const Consumer = require('../../models/Consumer');

/**
 * Service pour la gestion du profil consommateur
 */

async function getConsumerProfile(consumerId) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  return consumer;
}

async function updateConsumerProfile(consumerId, updateData) {
  const allowedFields = [
    'firstName', 'lastName', 'phone', 'dateOfBirth',
    'gender', 'avatar', 'bio'
  ];
  
  const filteredBody = {};
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = updateData[key];
    }
  });

  const consumer = await Consumer.findByIdAndUpdate(consumerId, filteredBody, {
    new: true,
    runValidators: true,
  });
  
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  return consumer;
}

module.exports = {
  getConsumerProfile,
  updateConsumerProfile
};

