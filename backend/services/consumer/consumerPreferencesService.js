const Consumer = require('../../models/Consumer');

/**
 * Service pour la gestion des préférences du consommateur
 */

async function getDietaryPreferences(consumerId) {
  const consumer = await Consumer.findById(consumerId).select('dietaryPreferences');
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  return consumer.dietaryPreferences || {};
}

async function updateDietaryPreferences(consumerId, dietaryPreferences) {
  const consumer = await Consumer.findByIdAndUpdate(
    consumerId,
    { dietaryPreferences },
    { new: true, runValidators: true }
  );
  
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  return consumer.dietaryPreferences;
}

async function getShoppingPreferences(consumerId) {
  const consumer = await Consumer.findById(consumerId).select('shoppingPreferences');
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  return consumer.shoppingPreferences || {};
}

async function updateShoppingPreferences(consumerId, shoppingPreferences) {
  const consumer = await Consumer.findByIdAndUpdate(
    consumerId,
    { shoppingPreferences },
    { new: true, runValidators: true }
  );
  
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  return consumer.shoppingPreferences;
}

async function getCommunicationPreferences(consumerId) {
  const consumer = await Consumer.findById(consumerId).select('communicationPreferences');
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  return consumer.communicationPreferences || {};
}

async function updateCommunicationPreferences(consumerId, communicationPreferences) {
  const consumer = await Consumer.findByIdAndUpdate(
    consumerId,
    { communicationPreferences },
    { new: true, runValidators: true }
  );
  
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  return consumer.communicationPreferences;
}

async function getNotificationPreferences(consumerId) {
  const consumer = await Consumer.findById(consumerId).select('notificationPreferences');
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  return consumer.notificationPreferences || {};
}

async function updateNotificationPreferences(consumerId, notificationPreferences) {
  const consumer = await Consumer.findByIdAndUpdate(
    consumerId,
    { notificationPreferences },
    { new: true, runValidators: true }
  );
  
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  return consumer.notificationPreferences;
}

module.exports = {
  getDietaryPreferences,
  updateDietaryPreferences,
  getShoppingPreferences,
  updateShoppingPreferences,
  getCommunicationPreferences,
  updateCommunicationPreferences,
  getNotificationPreferences,
  updateNotificationPreferences
};

