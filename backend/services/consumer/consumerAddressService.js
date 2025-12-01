const Consumer = require('../../models/Consumer');

/**
 * Service pour la gestion des adresses de livraison du consommateur
 */

async function getDeliveryAddresses(consumerId) {
  const consumer = await Consumer.findById(consumerId).select('deliveryAddresses');
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  return consumer.deliveryAddresses || [];
}

async function addDeliveryAddress(consumerId, addressData) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  if (!consumer.deliveryAddresses) {
    consumer.deliveryAddresses = [];
  }
  
  // Si c'est la première adresse ou si isDefault est true, la définir comme défaut
  if (consumer.deliveryAddresses.length === 0 || addressData.isDefault) {
    consumer.deliveryAddresses.forEach(addr => { addr.isDefault = false; });
    addressData.isDefault = true;
  }
  
  consumer.deliveryAddresses.push(addressData);
  await consumer.save();
  
  return consumer.deliveryAddresses[consumer.deliveryAddresses.length - 1];
}

async function updateDeliveryAddress(consumerId, addressId, updateData) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  const address = consumer.deliveryAddresses.id(addressId);
  if (!address) {
    throw new Error('Adresse non trouvée');
  }
  
  // Si on définit cette adresse comme défaut, retirer le défaut des autres
  if (updateData.isDefault) {
    consumer.deliveryAddresses.forEach(addr => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }
  
  Object.keys(updateData).forEach(key => {
    address[key] = updateData[key];
  });
  
  await consumer.save();
  return address;
}

async function removeDeliveryAddress(consumerId, addressId) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  const address = consumer.deliveryAddresses.id(addressId);
  if (!address) {
    throw new Error('Adresse non trouvée');
  }
  
  const wasDefault = address.isDefault;
  consumer.deliveryAddresses.pull(addressId);
  
  // Si l'adresse supprimée était la défaut, définir la première comme défaut
  if (wasDefault && consumer.deliveryAddresses.length > 0) {
    consumer.deliveryAddresses[0].isDefault = true;
  }
  
  await consumer.save();
}

async function setDefaultAddress(consumerId, addressId) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  const address = consumer.deliveryAddresses.id(addressId);
  if (!address) {
    throw new Error('Adresse non trouvée');
  }
  
  consumer.deliveryAddresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === addressId;
  });
  
  await consumer.save();
  return address;
}

module.exports = {
  getDeliveryAddresses,
  addDeliveryAddress,
  updateDeliveryAddress,
  removeDeliveryAddress,
  setDefaultAddress
};

