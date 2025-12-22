const Restaurateur = require("../../models/Restaurateur");

/**
 * Service pour la gestion du profil du restaurateur
 */

async function updateMyProfile(restaurateurId, updateData) {
	const allowedFields = [
		"firstName",
		"lastName",
		"restaurantName",
		"restaurantType",
		"cuisineTypes",
		"seatingCapacity",
		"address",
		"city",
		"region",
		"country",
		"additionalServices",
		"operatingHours",
		"restaurantBanner",
		"dishes",
		"bio",
		"phone",
		"documents",
		"certifications",
	];
	const filteredBody = {};
	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key)) {
			filteredBody[key] = updateData[key];
		}
	});
	const restaurateur = await Restaurateur.findByIdAndUpdate(
		restaurateurId,
		filteredBody,
		{
			new: true,
			runValidators: true,
		}
	);
	return restaurateur;
}

module.exports = {
	updateMyProfile,
};
