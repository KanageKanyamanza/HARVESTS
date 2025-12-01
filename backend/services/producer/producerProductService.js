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
    maximumOrderQuantity, unit, status, images
  } = productData;

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

  const productDataToCreate = {
    name: normalizedName,
    description: normalizedDescription,
    shortDescription: normalizedShortDescription || undefined,
    category,
    subcategory: subcategory || category,
    tags: tags || [],
    price: parseFloat(price),
    compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
    inventory: {
      quantity: parseInt(stock) || 0
    },
    minimumOrderQuantity: minimumOrderQuantity !== undefined ? minimumOrderQuantity : 0,
    maximumOrderQuantity: maximumOrderQuantity || undefined,
    unit: unit || 'kg',
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

  if (updateData.name) {
    updateData.name = toPlainText(updateData.name, product.name);
  }
  
  if (updateData.description) {
    updateData.description = toPlainText(updateData.description, product.description);
  }
  
  if (updateData.shortDescription) {
    updateData.shortDescription = toPlainText(updateData.shortDescription, product.shortDescription);
  }

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

