const Transformer = require('../../models/Transformer');

/**
 * Service pour la gestion des services du transformateur
 */

async function getServices(transformerId) {
  const transformer = await Transformer.findById(transformerId).select('services');
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer.services || {};
}

async function updateServices(transformerId, services) {
  const transformer = await Transformer.findByIdAndUpdate(
    transformerId,
    { services },
    { new: true, runValidators: true }
  );
  
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  return transformer.services;
}

module.exports = {
  getServices,
  updateServices
};

