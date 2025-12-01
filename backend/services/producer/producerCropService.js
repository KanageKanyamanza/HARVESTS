const Producer = require('../../models/Producer');

/**
 * Service pour la gestion des cultures du producteur
 */

async function getCrops(producerId) {
  const producer = await Producer.findById(producerId).select('crops');
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  return producer.crops;
}

async function addCrop(producerId, cropData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  producer.crops.push(cropData);
  await producer.save();
  
  return producer.crops[producer.crops.length - 1];
}

async function updateCrop(producerId, cropId, updateData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  const crop = producer.crops.id(cropId);
  if (!crop) {
    throw new Error('Culture non trouvée');
  }
  
  Object.keys(updateData).forEach(key => {
    crop[key] = updateData[key];
  });
  
  await producer.save();
  return crop;
}

async function removeCrop(producerId, cropId) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  producer.crops.pull(cropId);
  await producer.save();
}

module.exports = {
  getCrops,
  addCrop,
  updateCrop,
  removeCrop
};

