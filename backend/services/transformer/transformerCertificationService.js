const Transformer = require('../../models/Transformer');

/**
 * Service pour la gestion des certifications du transformateur
 */

async function getCertifications(transformerId) {
  const transformer = await Transformer.findById(transformerId).select('certifications');
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer.certifications || [];
}

async function addCertification(transformerId, certificationData) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  if (!transformer.certifications) {
    transformer.certifications = [];
  }
  
  transformer.certifications.push(certificationData);
  await transformer.save();
  
  return transformer.certifications[transformer.certifications.length - 1];
}

async function updateCertification(transformerId, certId, updateData) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  const certification = transformer.certifications.id(certId);
  if (!certification) {
    throw new Error('Certification non trouvée');
  }
  
  Object.keys(updateData).forEach(key => {
    certification[key] = updateData[key];
  });
  
  await transformer.save();
  return certification;
}

async function removeCertification(transformerId, certId) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  transformer.certifications.pull(certId);
  await transformer.save();
}

module.exports = {
  getCertifications,
  addCertification,
  updateCertification,
  removeCertification
};

