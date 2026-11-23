// Recherche d'un Payment par identifiant métier OU Mongo (Jour 86, recette).
// Le `paymentId` métier généré par l'application est une chaîne de 24
// hexadécimaux : `mongoose.isValidObjectId` la considère comme un ObjectId,
// alors que l'`_id` du document est DIFFÉRENT. Chercher par `_id` en premier
// renvoyait donc 404 pour un paymentId parfaitement valide.
const mongoose = require("mongoose");

const findPaymentByIdentifier = async (
	identifier,
	{ findOne, findById, isValidObjectId = mongoose.isValidObjectId } = {},
) => {
	const byPaymentId = await findOne({ paymentId: identifier });
	if (byPaymentId) return byPaymentId;
	if (!isValidObjectId(identifier)) return null;
	return findById(identifier);
};

module.exports = { findPaymentByIdentifier };
