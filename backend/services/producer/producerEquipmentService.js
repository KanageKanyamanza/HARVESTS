const Producer = require('../../models/Producer');

/**
 * Service pour la gestion de l'équipement du producteur
 */

async function getEquipment(producerId) {
  const producer = await Producer.findById(producerId).select('equipment');
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  return producer.equipment;
}

async function addEquipment(producerId, equipmentData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  producer.equipment.push(equipmentData);
  await producer.save();
  
  return producer.equipment[producer.equipment.length - 1];
}

async function updateEquipment(producerId, equipmentId, updateData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  const equipment = producer.equipment.id(equipmentId);
  if (!equipment) {
    throw new Error('Équipement non trouvé');
  }
  
  Object.keys(updateData).forEach(key => {
    equipment[key] = updateData[key];
  });
  
  await producer.save();
  return equipment;
}

async function removeEquipment(producerId, equipmentId) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  producer.equipment.pull(equipmentId);
  await producer.save();
}

module.exports = {
  getEquipment,
  addEquipment,
  updateEquipment,
  removeEquipment
};

