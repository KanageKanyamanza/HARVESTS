const Transformer = require('../../models/Transformer');

/**
 * Service pour la gestion des fournisseurs préférés du transformateur
 */

async function getPreferredSuppliers(transformerId) {
  const transformer = await Transformer.findById(transformerId)
    .select('preferredSuppliers')
    .populate('preferredSuppliers.supplier', 'companyName farmName businessName');
  
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  return transformer.preferredSuppliers || [];
}

async function addPreferredSupplier(transformerId, supplierData) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  if (!transformer.preferredSuppliers) {
    transformer.preferredSuppliers = [];
  }
  
  transformer.preferredSuppliers.push(supplierData);
  await transformer.save();
  
  return transformer.preferredSuppliers[transformer.preferredSuppliers.length - 1];
}

async function updateSupplierPreference(transformerId, supplierId, updateData) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  const supplier = transformer.preferredSuppliers.id(supplierId);
  if (!supplier) {
    throw new Error('Fournisseur non trouvé');
  }
  
  Object.keys(updateData).forEach(key => {
    supplier[key] = updateData[key];
  });
  
  await transformer.save();
  return supplier;
}

async function removePreferredSupplier(transformerId, supplierId) {
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  
  transformer.preferredSuppliers.pull(supplierId);
  await transformer.save();
}

module.exports = {
  getPreferredSuppliers,
  addPreferredSupplier,
  updateSupplierPreference,
  removePreferredSupplier
};

