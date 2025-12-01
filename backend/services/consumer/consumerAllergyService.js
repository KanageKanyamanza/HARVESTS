const Consumer = require('../../models/Consumer');

/**
 * Service pour la gestion des allergies du consommateur
 */

async function getAllergies(consumerId) {
  const consumer = await Consumer.findById(consumerId).select('allergies');
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  return consumer.allergies || [];
}

async function addAllergy(consumerId, allergyData) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  if (!consumer.allergies) {
    consumer.allergies = [];
  }
  
  consumer.allergies.push(allergyData);
  await consumer.save();
  
  return consumer.allergies[consumer.allergies.length - 1];
}

async function updateAllergy(consumerId, allergyId, updateData) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  const allergy = consumer.allergies.id(allergyId);
  if (!allergy) {
    throw new Error('Allergie non trouvée');
  }
  
  Object.keys(updateData).forEach(key => {
    allergy[key] = updateData[key];
  });
  
  await consumer.save();
  return allergy;
}

async function removeAllergy(consumerId, allergyId) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  consumer.allergies.pull(allergyId);
  await consumer.save();
}

module.exports = {
  getAllergies,
  addAllergy,
  updateAllergy,
  removeAllergy
};

