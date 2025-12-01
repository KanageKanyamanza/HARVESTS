const Transformer = require('../../models/Transformer');

/**
 * Service pour la gestion de la tarification du transformateur
 */

async function getPricing(transformerId) {
  const transformer = await Transformer.findById(transformerId).select('pricing');
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer.pricing || {};
}

async function updatePricing(transformerId, pricingData) {
  const transformer = await Transformer.findByIdAndUpdate(
    transformerId,
    { pricing: pricingData },
    { new: true, runValidators: true }
  );
  
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  return transformer.pricing;
}

module.exports = {
  getPricing,
  updatePricing
};

