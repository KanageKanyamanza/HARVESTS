const Producer = require('../../models/Producer');

/**
 * Service pour la gestion des transporteurs préférés du producteur
 */

async function getPreferredTransporters(producerId) {
  const producer = await Producer.findById(producerId)
    .select('preferredTransporters')
    .populate('preferredTransporters', 'companyName phone address performanceStats');
  
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  return producer.preferredTransporters;
}

async function addPreferredTransporter(producerId, transporterId) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  if (producer.preferredTransporters.includes(transporterId)) {
    throw new Error('producer.transporter_already_favorite');
  }

  producer.preferredTransporters.push(transporterId);
  await producer.save();
}

async function removePreferredTransporter(producerId, transporterId) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  producer.preferredTransporters.pull(transporterId);
  await producer.save();
}

module.exports = {
  getPreferredTransporters,
  addPreferredTransporter,
  removePreferredTransporter
};

