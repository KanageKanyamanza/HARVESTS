const Producer = require('../../models/Producer');

/**
 * Service pour la gestion des documents du producteur
 */

async function getDocuments(producerId) {
  const producer = await Producer.findById(producerId).select('documents');
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  return producer.documents;
}

async function addDocument(producerId, documentData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  if (!documentData.document) {
    throw new Error('Veuillez télécharger un document');
  }

  const { documentType } = documentData;
  if (producer.documents[documentType]) {
    producer.documents[documentType] = {
      ...producer.documents[documentType],
      ...documentData,
    };
  }

  await producer.save();
  return producer.documents[documentType];
}

module.exports = {
  getDocuments,
  addDocument
};

