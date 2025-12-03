const Product = require('../../models/Product');
const Notification = require('../../models/Notification');
const { toPlainText } = require('../../utils/localization');

/**
 * Service pour l'administration des produits
 */

/**
 * Approuver un produit
 */
async function approveProduct(productId) {
  const product = await Product.findByIdAndUpdate(
    productId,
    { 
      status: 'approved',
      publishedAt: new Date()
    },
    { new: true }
  )
  .populate('producer', 'firstName lastName email phone notifications')
  .populate('transformer', 'firstName lastName email phone notifications')
  .populate('restaurateur', 'firstName lastName companyName restaurantName email phone notifications');

  if (!product) {
    throw new Error('Produit non trouvé');
  }

  // Envoyer notification au(x) propriétaire(s)
  await Notification.notifyProductApproved(product);

  return product;
}

/**
 * Rejeter un produit
 */
async function rejectProduct(productId, reason) {
  if (!reason) {
    throw new Error('Raison du rejet requise');
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { 
      status: 'rejected',
      rejectionReason: reason
    },
    { new: true }
  )
  .populate('producer', 'firstName lastName email phone notifications')
  .populate('transformer', 'firstName lastName email phone notifications')
  .populate('restaurateur', 'firstName lastName companyName restaurantName email phone notifications');

  if (!product) {
    throw new Error('Produit non trouvé');
  }

  // Envoyer notification au(x) propriétaire(s)
  const ownerMap = new Map();
  const registerOwner = (entity) => {
    if (!entity) return;
    if (Array.isArray(entity)) {
      entity.forEach(registerOwner);
      return;
    }
    const id = entity._id || entity;
    if (!id) return;
    const key = id.toString();
    if (!ownerMap.has(key)) {
      ownerMap.set(key, entity);
    }
  };

  registerOwner(product.producer);
  registerOwner(product.transformer);
  registerOwner(product.restaurateur);

  const localizedName = toPlainText(product?.name, 'Produit');

  if (ownerMap.size > 0) {
    const notificationPromises = Array.from(ownerMap.values()).map((owner) => {
      const ownerId = owner._id || owner;

      return Notification.createNotification({
        recipient: ownerId,
        type: 'product_rejected',
        category: 'product',
        title: 'Produit rejeté',
        message: `Votre produit "${localizedName}" a été rejeté. Raison : ${reason}`,
        data: {
          productId: product._id,
          productName: localizedName
        },
        channels: {
          inApp: { enabled: true },
          email: { enabled: true }
        }
      });
    });

    await Promise.all(notificationPromises);
  }

  return product;
}

/**
 * Mettre un produit en vedette
 */
async function featureProduct(productId) {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isFeatured: true },
    { new: true }
  );

  if (!product) {
    throw new Error('Produit non trouvé');
  }

  return product;
}

/**
 * Retirer un produit de la vedette
 */
async function unfeatureProduct(productId) {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isFeatured: false },
    { new: true }
  );

  if (!product) {
    throw new Error('Produit non trouvé');
  }

  return product;
}

/**
 * Obtenir les produits en attente de modération
 */
async function getPendingProducts(queryParams = {}) {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const products = await Product.find({
    status: 'pending-review'
  })
  .populate('producer', 'farmName firstName lastName email')
  .populate('transformer', 'companyName firstName lastName email')
  .sort('-createdAt')
  .skip(skip)
  .limit(limit);

  const total = await Product.countDocuments({ status: 'pending-review' });

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = {
  approveProduct,
  rejectProduct,
  featureProduct,
  unfeatureProduct,
  getPendingProducts
};

