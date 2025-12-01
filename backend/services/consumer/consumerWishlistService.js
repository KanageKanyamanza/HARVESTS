const Consumer = require('../../models/Consumer');

/**
 * Service pour la gestion de la wishlist du consommateur
 */

async function getWishlist(consumerId) {
  const consumer = await Consumer.findById(consumerId)
    .select('wishlist')
    .populate('wishlist.product', 'name price images category');
  
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  return consumer.wishlist || [];
}

async function addToWishlist(consumerId, productId) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  if (!consumer.wishlist) {
    consumer.wishlist = [];
  }
  
  // Vérifier si le produit est déjà dans la wishlist
  const existingItem = consumer.wishlist.find(item => 
    item.product.toString() === productId
  );
  
  if (existingItem) {
    throw new Error('Produit déjà dans la wishlist');
  }
  
  consumer.wishlist.push({
    product: productId,
    addedAt: new Date()
  });
  
  await consumer.save();
  
  return consumer.wishlist[consumer.wishlist.length - 1];
}

async function removeFromWishlist(consumerId, productId) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  consumer.wishlist = consumer.wishlist.filter(item => 
    item.product.toString() !== productId
  );
  
  await consumer.save();
}

async function toggleWishlistNotifications(consumerId, enabled) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  if (!consumer.wishlistPreferences) {
    consumer.wishlistPreferences = {};
  }
  
  consumer.wishlistPreferences.notificationsEnabled = enabled;
  await consumer.save();
  
  return consumer.wishlistPreferences;
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlistNotifications
};

