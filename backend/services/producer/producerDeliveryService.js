const Producer = require('../../models/Producer');

/**
 * Service pour la gestion des paramètres de livraison du producteur
 */

async function getDeliverySettings(producerId) {
  const producer = await Producer.findById(producerId).select('deliveryOptions');
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  return producer.deliveryOptions;
}

async function updateDeliverySettings(producerId, deliveryOptions) {
  const producer = await Producer.findByIdAndUpdate(
    producerId,
    { deliveryOptions },
    { new: true, runValidators: true }
  ).select('deliveryOptions');
  
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  return producer.deliveryOptions;
}

module.exports = {
  getDeliverySettings,
  updateDeliverySettings
};

