const Producer = require("../../models/Producer");

/**
 * Service pour la gestion du profil producteur
 */

async function getProducerProfile(producerId) {
	const producer = await Producer.findById(producerId);
	if (!producer) {
		throw new Error("Producteur non trouvé");
	}
	return producer;
}

async function updateProducerProfile(producerId, updateData) {
	const allowedFields = [
		"firstName",
		"lastName",
		"farmName",
		"farmSize",
		"farmingType",
		"storageCapacity",
		"address",
		"city",
		"region",
		"country",
		"deliveryOptions",
		"minimumOrderQuantity",
		"crops",
		"bio",
		"phone",
		"specialties",
		"documents",
		"certifications",
	];

	const filteredBody = {};
	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key)) {
			filteredBody[key] = updateData[key];
		}
	});

	const producer = await Producer.findByIdAndUpdate(producerId, filteredBody, {
		new: true,
		runValidators: true,
	});

	if (!producer) {
		throw new Error("Producteur non trouvé");
	}

	return producer;
}

module.exports = {
	getProducerProfile,
	updateProducerProfile,
};
