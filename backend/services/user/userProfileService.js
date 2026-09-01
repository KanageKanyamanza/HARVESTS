const crypto = require("crypto");
const User = require("../../models/User");
const Consumer = require("../../models/Consumer");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Review = require("../../models/Review");

// Mapping des modèles par type d'utilisateur
const userModels = {
	producer: require("../../models/Producer"),
	transformer: require("../../models/Transformer"),
	consumer: Consumer,
	restaurateur: require("../../models/Restaurateur"),
	exporter: require("../../models/Exporter"),
	transporter: require("../../models/Transporter"),
};

// Fonction utilitaire pour filtrer les champs autorisés
const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

/**
 * Obtenir l'utilisateur actuel
 */
function getCurrentUser(userId) {
	return User.findById(userId);
}

/**
 * Mettre à jour le profil utilisateur
 */
async function updateProfile(userId, userType, updateData, file = null) {
	const allowedFields = [
		"firstName",
		"lastName",
		"companyName",
		"farmName",
		"restaurantName",
		"phone",
		"address",
		"city",
		"region",
		"bio",
		"language",
		"preferredLanguage",
		"country",
		"currency",
		"notifications",
		"avatar",
		"shopBanner",
		"shopLogo",
		"dietaryPreferences",
		"shoppingPreferences",
		"allergies",
	];

	const filteredBody = filterObj(updateData, ...allowedFields);

	// Ajouter l'image si téléchargée
	if (file) {
		const imageUrl = file.path || file.secure_url || file.url;
		if (imageUrl) {
			if (file.fieldname === "avatar") {
				filteredBody.avatar = imageUrl;
			} else if (file.fieldname === "shopBanner") {
				filteredBody.shopBanner = imageUrl;
			} else if (file.fieldname === "shopLogo") {
				filteredBody.shopLogo = imageUrl;
			}
		}
	}

	const UserModel = userModels[userType] || User;
	let user = await UserModel.findById(userId);

	if (!user) {
		user = await User.findById(userId);
		if (!user) {
			throw new Error("Utilisateur non trouvé");
		}
	}

	// Mettre à jour les champs autorisés
	Object.keys(filteredBody).forEach((key) => {
		// On fait confiance à filteredBody qui a déjà été filtré par allowedFields
		// Cette vérification schemaPath empêchait la mise à jour des objets imbriqués comme shoppingPreferences
		user[key] = filteredBody[key];
	});

	const updatedUser = await user.save({ validateBeforeSave: false });

	// Filtrer les données utilisateur pour ne retourner que les champs nécessaires
	return {
		_id: updatedUser._id,
		firstName: updatedUser.firstName,
		lastName: updatedUser.lastName,
		email: updatedUser.email,
		phone: updatedUser.phone,
		userType: updatedUser.userType,
		address: updatedUser.address,
		city: updatedUser.city,
		region: updatedUser.region,
		country: updatedUser.country,
		bio: updatedUser.bio,
		avatar: updatedUser.avatar,
		shopBanner: updatedUser.shopBanner,
		shopLogo: updatedUser.shopLogo,
		isEmailVerified: updatedUser.isEmailVerified,
		isPhoneVerified: updatedUser.isPhoneVerified,
		isActive: updatedUser.isActive,
		isApproved: updatedUser.isApproved,
		language: updatedUser.language,
		currency: updatedUser.currency,
		dietaryPreferences: updatedUser.dietaryPreferences,
		shoppingPreferences: updatedUser.shoppingPreferences,
		allergies: updatedUser.allergies,
		subscriptionFeatures: updatedUser.subscriptionFeatures,
		createdAt: updatedUser.createdAt,
		updatedAt: updatedUser.updatedAt,
	};
}

/**
 * Désactiver le compte utilisateur
 */
async function deactivateAccount(userId) {
	await User.findByIdAndUpdate(userId, { isActive: false });
	return true;
}

/**
 * Suppression en libre-service : anonymise les données personnelles et
 * désactive le compte, sans supprimer le document pour préserver
 * l'intégrité référentielle des commandes existantes (Order.seller/buyer,
 * Product.producer, etc. continuent de pointer vers un utilisateur valide).
 * Masque aussi les produits publiés par ce compte (producteur/transformateur/
 * restaurateur), qui ne doivent plus apparaître publiquement.
 */
async function anonymizeAndDeleteAccount(userId) {
	const user = await User.findById(userId);
	if (!user) {
		throw new Error("Utilisateur non trouvé");
	}

	const anonymousId = crypto.randomBytes(8).toString("hex");

	user.firstName = "Utilisateur";
	user.lastName = "Supprimé";
	user.companyName = undefined;
	user.farmName = undefined;
	user.restaurantName = undefined;
	user.email = `deleted-${anonymousId}@deleted.harvests.bf`;
	user.phone = undefined;
	user.address = undefined;
	user.city = undefined;
	user.region = undefined;
	user.postalCode = undefined;
	user.bio = undefined;
	user.coordinates = undefined;
	user.avatar = null;
	user.shopBanner = null;
	user.shopLogo = null;
	user.bankAccount = undefined;
	user.paymentMethods = [];
	user.webPushSubscriptions = [];
	user.fcmTokens = [];
	user.referredBy = null;
	user.isActive = false;
	user.isShopVisible = false;
	user.isApproved = false;
	user.deletedAt = new Date();

	await user.save({ validateBeforeSave: false });

	await Product.updateMany(
		{
			$or: [
				{ producer: userId },
				{ transformer: userId },
				{ restaurateur: userId },
			],
		},
		{ $set: { isActive: false, status: "inactive" } },
	);

	return true;
}

/**
 * Obtenir les adresses de l'utilisateur
 */
async function getUserAddresses(userId) {
	const user = await User.findById(userId);

	let addresses = [user.address]; // Adresse principale

	// Ajouter les adresses de livraison pour les consommateurs
	if (user.userType === "consumer" && user.deliveryAddresses) {
		addresses = [...addresses, ...user.deliveryAddresses];
	}

	return addresses;
}

/**
 * Ajouter une adresse
 */
async function addAddress(userId, addressData) {
	const user = await User.findById(userId);

	if (user.userType !== "consumer") {
		throw new Error(
			"Seuls les consommateurs peuvent ajouter plusieurs adresses",
		);
	}

	const consumer = await Consumer.findById(userId);

	const isFirstAddress =
		!consumer.deliveryAddresses || consumer.deliveryAddresses.length === 0;

	const newAddress = {
		...addressData,
		isDefault: addressData.isDefault || isFirstAddress,
	};

	// Si c'est la nouvelle adresse par défaut, désactiver les autres
	if (newAddress.isDefault) {
		consumer.deliveryAddresses?.forEach((addr) => (addr.isDefault = false));
	}

	consumer.deliveryAddresses.push(newAddress);
	await consumer.save();

	return newAddress;
}

/**
 * Mettre à jour une adresse
 */
async function updateAddress(userId, addressId, addressData) {
	const consumer = await Consumer.findById(userId);

	if (!consumer) {
		throw new Error("Utilisateur non trouvé");
	}

	const address = consumer.deliveryAddresses.id(addressId);

	if (!address) {
		throw new Error("Adresse non trouvée");
	}

	// Mettre à jour les champs
	Object.keys(addressData).forEach((key) => {
		address[key] = addressData[key];
	});

	// Si c'est la nouvelle adresse par défaut, désactiver les autres
	if (addressData.isDefault) {
		consumer.deliveryAddresses.forEach((addr) => {
			if (addr.id !== addressId) addr.isDefault = false;
		});
	}

	await consumer.save();

	return address;
}

/**
 * Supprimer une adresse
 */
async function deleteAddress(userId, addressId) {
	const consumer = await Consumer.findById(userId);

	if (!consumer) {
		throw new Error("Utilisateur non trouvé");
	}

	const address = consumer.deliveryAddresses.id(addressId);

	if (!address) {
		throw new Error("Adresse non trouvée");
	}

	// Ne pas permettre la suppression si c'est la seule adresse
	if (consumer.deliveryAddresses.length === 1) {
		throw new Error("Vous devez avoir au moins une adresse");
	}

	// Si c'était l'adresse par défaut, définir une autre comme par défaut
	if (address.isDefault && consumer.deliveryAddresses.length > 1) {
		const otherAddress = consumer.deliveryAddresses.find(
			(addr) => addr.id !== addressId,
		);
		if (otherAddress) otherAddress.isDefault = true;
	}

	consumer.deliveryAddresses.pull(addressId);
	await consumer.save();

	return true;
}

/**
 * Export en libre-service de toutes les données personnelles du compte :
 * profil, commandes (en tant qu'acheteur et/ou vendeur), produits publiés
 * et avis (rédigés et reçus), selon ce qui s'applique au type de compte.
 */
async function exportUserData(userId) {
	const user = await User.findById(userId);
	if (!user) {
		throw new Error("Utilisateur non trouvé");
	}

	const [ordersAsBuyer, ordersAsSeller, products, reviewsWritten, reviewsReceived] =
		await Promise.all([
			Order.find({ buyer: userId }).lean(),
			Order.find({ seller: userId }).lean(),
			Product.find({
				$or: [
					{ producer: userId },
					{ transformer: userId },
					{ restaurateur: userId },
				],
			}).lean(),
			Review.find({ reviewer: userId }).lean(),
			Review.find({ producer: userId }).lean(),
		]);

	return {
		exportedAt: new Date().toISOString(),
		profile: user.toJSON(),
		orders: {
			asBuyer: ordersAsBuyer,
			asSeller: ordersAsSeller,
		},
		products,
		reviews: {
			written: reviewsWritten,
			received: reviewsReceived,
		},
	};
}

module.exports = {
	getCurrentUser,
	updateProfile,
	deactivateAccount,
	anonymizeAndDeleteAccount,
	exportUserData,
	getUserAddresses,
	addAddress,
	updateAddress,
	deleteAddress,
};
