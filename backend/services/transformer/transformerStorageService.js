const Transformer = require('../../models/Transformer');

/**
 * Service pour la gestion des capacités de stockage du transformateur
 */

async function getStorageCapabilities(transformerId) {
  const transformer = await Transformer.findById(transformerId).select('storageCapabilities');
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer.storageCapabilities || {};
}

async function updateStorageCapabilities(transformerId, storageData) {
  const transformer = await Transformer.findByIdAndUpdate(
    transformerId,
    { storageCapabilities: storageData },
    { new: true, runValidators: true }
  );
  
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  return transformer.storageCapabilities;
}

module.exports = {
  getStorageCapabilities,
  updateStorageCapabilities
};

