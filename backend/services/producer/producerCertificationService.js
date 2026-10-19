const Producer = require('../../models/Producer');

/**
 * Service pour la gestion des certifications du producteur
 */

async function getCertifications(producerId) {
  const producer = await Producer.findById(producerId).select('certifications');
  if (!producer) {
    throw new Error('producer.not_found');
  }
  return producer.certifications;
}

async function addCertification(producerId, certificationData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  producer.certifications.push(certificationData);
  await producer.save();
  
  return producer.certifications[producer.certifications.length - 1];
}

async function updateCertification(producerId, certId, updateData) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  const certification = producer.certifications.id(certId);
  if (!certification) {
    throw new Error('producer.certification_not_found');
  }
  
  Object.keys(updateData).forEach(key => {
    certification[key] = updateData[key];
  });
  
  await producer.save();
  return certification;
}

async function removeCertification(producerId, certId) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('producer.not_found');
  }
  
  producer.certifications.pull(certId);
  await producer.save();
}

module.exports = {
  getCertifications,
  addCertification,
  updateCertification,
  removeCertification
};

