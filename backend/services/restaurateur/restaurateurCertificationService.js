const Restaurateur = require('../../models/Restaurateur');

/**
 * Service pour la gestion des certifications du restaurateur
 */

async function addCertification(restaurateurId, certificationData) {
  const restaurateur = await Restaurateur.findById(restaurateurId);
  if (!restaurateur) {
    throw new Error('Restaurateur non trouvé');
  }
  restaurateur.certifications.push(certificationData);
  await restaurateur.save();
  return restaurateur.certifications[restaurateur.certifications.length - 1];
}

async function updateCertification(restaurateurId, certId, updateData) {
  const restaurateur = await Restaurateur.findById(restaurateurId);
  if (!restaurateur) {
    throw new Error('Restaurateur non trouvé');
  }
  const certification = restaurateur.certifications.id(certId);
  if (!certification) {
    throw new Error('Certification non trouvée');
  }
  Object.keys(updateData).forEach(key => {
    certification[key] = updateData[key];
  });
  await restaurateur.save();
  return certification;
}

async function removeCertification(restaurateurId, certId) {
  const restaurateur = await Restaurateur.findById(restaurateurId);
  if (!restaurateur) {
    throw new Error('Restaurateur non trouvé');
  }
  restaurateur.certifications.pull(certId);
  await restaurateur.save();
}

module.exports = {
  addCertification,
  updateCertification,
  removeCertification
};

