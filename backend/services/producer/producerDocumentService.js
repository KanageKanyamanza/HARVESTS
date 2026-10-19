const Producer = require('../../models/Producer');

/**
 * Service pour la gestion des documents du producteur
 */

async function getDocuments(producerId) {
  const producer = await Producer.findById(producerId).select('documents');
  if (!producer) {
    throw new Error('producer.not_found');
  }
  return producer.documents;
}

async function addDocument(producerId, documentData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  if (!documentData.document) {
    throw new Error('producer.document_required');
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

