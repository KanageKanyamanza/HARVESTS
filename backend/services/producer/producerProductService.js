const Product = require('../../models/Product');
const { toPlainText } = require('../../utils/localization');

/**
 * Service pour la gestion des produits du producteur
 */

async function getProducts(producerId) {
  const products = await Product.find({ producer: producerId })
    .sort('-createdAt');
  return products;
}

async function createProduct(producerId, productData) {
  const {
    name, description, shortDescription, category, subcategory,
    tags, price, compareAtPrice, stock, minimumOrderQuantity,
    maximumOrderQuantity, unit, currency, status, images
  } = productData;

  if (!name || !description || !category || !price || stock === undefined) {
    throw new Error('Tous les champs obligatoires doivent être remplis');
  }

  // Jour 45 (bascule bilingue) : on ne fige plus name/description/
  // shortDescription en chaîne ici — la forme brute (chaîne legacy ou
  // {fr, en}) est transmise telle quelle, productMiddleware.js (pre('save'))
  // la normalise et complète `en` par traduction automatique si absent.
  const plainNameForValidation = toPlainText(name, '');
  const plainDescriptionForValidation = toPlainText(description, '');

  if (!plainNameForValidation || !plainDescriptionForValidation) {
    throw new Error('Le nom et la description doivent être fournis');
  }

  const productDataToCreate = {
    name,
    description,
    shortDescription: shortDescription || undefined,
    category,
    subcategory: subcategory || category || undefined,
    tags: tags || [],
    price: parseFloat(price),
    compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
    inventory: {
      quantity: parseInt(stock) || 0
    },
    minimumOrderQuantity: minimumOrderQuantity !== undefined ? minimumOrderQuantity : 0,
    maximumOrderQuantity: maximumOrderQuantity || undefined,
    unit: unit || 'unité',
    currency: currency || 'XOF',
    status: status || 'draft',
    images: images ? images.map((img, index) => ({
      ...img,
      order: index,
      isPrimary: index === 0
    })) : [],
    producer: producerId,
    userType: 'producer'
  };
  
  return await Product.create(productDataToCreate);
}

async function getProduct(productId, producerId) {
  const product = await Product.findOne({
    _id: productId,
    producer: producerId
  });
  
  if (!product) {
    throw new Error('Produit non trouvé');
  }
  
  return product;
}

async function updateProduct(productId, producerId, updateData) {
  const product = await Product.findOne({
    _id: productId,
    producer: producerId
  });
  
  if (!product) {
    throw new Error('Produit non trouvé');
  }

  // Jour 45 (bascule bilingue) : name/description/shortDescription passent
  // tels quels à product.save() ci-dessous ; productMiddleware.js s'occupe
  // de la normalisation et de la traduction automatique.
  Object.assign(product, updateData);
  await product.save();
  
  return product;
}

async function deleteProduct(productId, producerId) {
  const product = await Product.findOneAndDelete({
    _id: productId,
    producer: producerId
  });
  
  if (!product) {
    throw new Error('Produit non trouvé');
  }
  
  return product;
}

module.exports = {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct
};

