const Transformer = require('../../models/Transformer');

/**
 * Service pour la gestion des capacités de transformation
 */

async function getProcessingCapabilities(transformerId) {
  const transformer = await Transformer.findById(transformerId).select('processingCapabilities');
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer.processingCapabilities || [];
}

async function addProcessingCapability(transformerId, capabilityData) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  if (!transformer.processingCapabilities) {
    transformer.processingCapabilities = [];
  }
  
  transformer.processingCapabilities.push(capabilityData);
  await transformer.save();
  
  return transformer.processingCapabilities[transformer.processingCapabilities.length - 1];
}

async function updateProcessingCapability(transformerId, capabilityId, updateData) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  const capability = transformer.processingCapabilities.id(capabilityId);
  if (!capability) {
    throw new Error('Capacité non trouvée');
  }
  
  Object.keys(updateData).forEach(key => {
    capability[key] = updateData[key];
  });
  
  await transformer.save();
  return capability;
}

async function removeProcessingCapability(transformerId, capabilityId) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  transformer.processingCapabilities.pull(capabilityId);
  await transformer.save();
}

async function getProcessingTimes(transformerId) {
  const transformer = await Transformer.findById(transformerId).select('processingTimes');
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer.processingTimes || {};
}

async function updateProcessingTimes(transformerId, timesData) {
  const transformer = await Transformer.findByIdAndUpdate(
    transformerId,
    { processingTimes: timesData },
    { new: true, runValidators: true }
  );
  
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  return transformer.processingTimes;
}

module.exports = {
  getProcessingCapabilities,
  addProcessingCapability,
  updateProcessingCapability,
  removeProcessingCapability,
  getProcessingTimes,
  updateProcessingTimes
};

