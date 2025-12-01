const Product = require('../../models/Product');
const { toPlainText } = require('../../utils/localization');

/**
 * Service pour la gestion des produits du transformateur
 */

async function getMyProducts(transformerId) {
  const products = await Product.find({ 
    transformer: transformerId,
    userType: 'transformer'
  }).sort('-createdAt');
  return products;
}

async function getProduct(productId, transformerId) {
  const product = await Product.findOne({
    _id: productId,
    transformer: transformerId,
    userType: 'transformer'
  });
  
  if (!product) {
    throw new Error('Produit non trouvé');
  }
  
  return product;
}

async function createProduct(transformerId, productData) {
  const normalizedName = toPlainText(productData.name, productData.name);
  const normalizedDescription = toPlainText(productData.description, productData.description);
  
  const product = await Product.create({
    ...productData,
    name: normalizedName,
    description: normalizedDescription,
    transformer: transformerId,
    userType: 'transformer',
    status: 'pending-review'
  });
  
  return product;
}

async function deleteProduct(productId, transformerId) {
  const product = await Product.findOneAndDelete({
    _id: productId,
    transformer: transformerId,
    userType: 'transformer'
  });
  
  if (!product) {
    throw new Error('Produit non trouvé');
  }
  
  return product;
}

async function submitProductForReview(productId, transformerId) {
  const product = await Product.findOneAndUpdate(
    { _id: productId, transformer: transformerId },
    { status: 'pending-review', isActive: false },
    { new: true }
  );
  
  if (!product) {
    throw new Error('Produit non trouvé');
  }
  
  return product;
}

async function getPublicProducts(transformerId) {
  const products = await Product.find({
    transformer: transformerId,
    userType: 'transformer',
    status: 'approved',
    isActive: true
  }).sort('-createdAt');
  
  return products;
}

module.exports = {
  getMyProducts,
  getProduct,
  createProduct,
  deleteProduct,
  submitProductForReview,
  getPublicProducts
};

