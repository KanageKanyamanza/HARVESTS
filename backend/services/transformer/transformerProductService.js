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
  const {
    name, description, shortDescription, category, subcategory,
    tags, price, compareAtPrice, stock, minimumOrderQuantity,
    maximumOrderQuantity, unit, status, images, currency
  } = productData;

  // Validation des champs obligatoires
  if (!name || !description || !category || !price || stock === undefined) {
    throw new Error('Tous les champs obligatoires doivent être remplis');
  }

  const normalizedName = toPlainText(name, name);
  const normalizedDescription = toPlainText(description, description);
  const normalizedShortDescription = shortDescription !== undefined && shortDescription !== null
    ? toPlainText(shortDescription, shortDescription)
    : '';

  if (!normalizedName || !normalizedDescription) {
    throw new Error('Le nom et la description doivent être fournis');
  }

  // S'assurer que subcategory a une valeur par défaut si non fournie
  const finalSubcategory = subcategory || category || undefined;

  // Préparer les données du produit
  const productDataToCreate = {
    name: normalizedName,
    description: normalizedDescription,
    shortDescription: normalizedShortDescription || undefined,
    category,
    subcategory: finalSubcategory,
    tags: tags || [],
    price: parseFloat(price),
    compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
    inventory: {
      quantity: parseInt(stock) || 0
    },
    minimumOrderQuantity: minimumOrderQuantity !== undefined ? minimumOrderQuantity : 0,
    maximumOrderQuantity: maximumOrderQuantity || undefined,
    status: status || 'draft',
    images: images ? images.map((img, index) => ({
      ...img,
      order: index,
      isPrimary: index === 0
    })) : [],
    transformer: transformerId,
    userType: 'transformer'
  };

  // Note: currency et unit ne sont pas stockés dans le modèle Product
  // Ils peuvent être utilisés pour des calculs ou affichage mais ne sont pas persistés
  
  const product = await Product.create(productDataToCreate);
  
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

