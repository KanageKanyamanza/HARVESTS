const Producer = require('../../models/Producer');

/**
 * Service pour la gestion des transporteurs préférés du producteur
 */

async function getPreferredTransporters(producerId) {
  const producer = await Producer.findById(producerId)
    .select('preferredTransporters')
    .populate('preferredTransporters', 'companyName phone address performanceStats');
  
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  return producer.preferredTransporters;
}

async function addPreferredTransporter(producerId, transporterId) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  if (producer.preferredTransporters.includes(transporterId)) {
    throw new Error('Ce transporteur est déjà dans vos préférés');
  }

  producer.preferredTransporters.push(transporterId);
  await producer.save();
}

async function removePreferredTransporter(producerId, transporterId) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  producer.preferredTransporters.pull(transporterId);
  await producer.save();
}

module.exports = {
  getPreferredTransporters,
  addPreferredTransporter,
  removePreferredTransporter
};

