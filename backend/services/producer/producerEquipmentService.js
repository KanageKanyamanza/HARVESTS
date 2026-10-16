const Producer = require('../../models/Producer');

/**
 * Service pour la gestion de l'équipement du producteur
 */

async function getEquipment(producerId) {
  const producer = await Producer.findById(producerId).select('equipment');
  if (!producer) {
    throw new Error('producer.not_found');
  }
  return producer.equipment;
}

async function addEquipment(producerId, equipmentData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  producer.equipment.push(equipmentData);
  await producer.save();
  
  return producer.equipment[producer.equipment.length - 1];
}

async function updateEquipment(producerId, equipmentId, updateData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  const equipment = producer.equipment.id(equipmentId);
  if (!equipment) {
    throw new Error('producer.equipment_not_found');
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
    throw new Error('producer.not_found');
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

