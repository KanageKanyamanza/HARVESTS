const Transformer = require("../../models/Transformer");

/**
 * Service pour la gestion du profil transformateur
 */

async function getTransformerProfile(transformerId) {
	const transformer = await Transformer.findById(transformerId);
	if (!transformer) {
		throw new Error("Transformateur non trouvé");
	}
	return transformer;
}

async function updateTransformerProfile(transformerId, updateData) {
	const allowedFields = [
		"firstName",
		"lastName",
		"companyName",
		"businessName",
		"description",
		"address",
		"city",
		"region",
		"country",
		"phone",
		"email",
		"website",
		"bio",
		"transformationType",
		"processingCapabilities",
		"storageCapabilities",
		"services",
		"pricing",
		"operatingHours",
	];

	const filteredBody = {};
	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key)) {
			filteredBody[key] = updateData[key];
		}
	});

	const transformer = await Transformer.findByIdAndUpdate(
		transformerId,
		filteredBody,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!transformer) {
		throw new Error("Transformateur non trouvé");
	}

	return transformer;
}

async function getCompanyInfo(transformerId) {
	const transformer = await Transformer.findById(transformerId).select(
		"companyName businessName description address contactInfo"
	);
	if (!transformer) {
		throw new Error("Transformateur non trouvé");
	}
	return {
		companyName: transformer.companyName,
		businessName: transformer.businessName,
		description: transformer.description,
		address: transformer.address,
		contactInfo: transformer.contactInfo,
	};
}

async function updateCompanyInfo(transformerId, companyData) {
	const transformer = await Transformer.findByIdAndUpdate(
		transformerId,
		{
			companyName: companyData.companyName,
			businessName: companyData.businessName,
			description: companyData.description,
			address: companyData.address,
			contactInfo: companyData.contactInfo,
		},
		{ new: true, runValidators: true }
	);

	if (!transformer) {
		throw new Error("Transformateur non trouvé");
	}

	return transformer;
}

module.exports = {
	getTransformerProfile,
	updateTransformerProfile,
	getCompanyInfo,
	updateCompanyInfo,
};
