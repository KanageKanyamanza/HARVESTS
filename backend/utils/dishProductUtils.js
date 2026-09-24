const Product = require('../models/Product');
const { toPlainText } = require('./localization');

const DEFAULT_CATEGORY = 'processed-foods';

const buildDishProductPayload = (restaurateur, dish) => {
  // Jour 45 (bascule bilingue) : on ne fige plus name/description en chaîne
  // via toPlainText ici — on transmet la forme bilingue du plat telle quelle
  // (chaîne legacy ou {fr, en}) et c'est productMiddleware.js (déclenché par
  // le findOneAndUpdate plus bas) qui la normalise et complète `en` si besoin.
  // On garde toPlainText seulement pour des usages ponctuels non persistés
  // (alt d'image, valeur de repli du nom).
  const nameValueRaw = toPlainText(dish.name, '');
  const nameValue = (nameValueRaw ? dish.name : null) || dish.slug || 'Plat';
  const descriptionValueRaw = toPlainText(dish.description, '');
  const descriptionValue = (descriptionValueRaw ? dish.description : null) || 'Plat proposé par le restaurateur';
  const shortDescription = (descriptionValueRaw || toPlainText(nameValue, '') || '').slice(0, 160) || 'Plat proposé par le restaurateur';

  const images = [];
  if (dish.image) {
    images.push({ url: dish.image, alt: toPlainText(nameValue, 'Plat'), isPrimary: true, order: 0 });
  }

  return {
    name: nameValue,
    description: descriptionValue,
    shortDescription,
    price: dish.price || 0,
    minimumOrderQuantity: 1,
    images,
    userType: 'restaurateur',
    restaurateur: restaurateur._id,
    category: DEFAULT_CATEGORY,
    subcategory: `dish-${dish.category || 'specialite'}`,
    originType: 'dish',
    dishInfo: {
      category: dish.category || null,
      preparationTime: dish.preparationTime || null,
      allergens: dish.allergens || []
    },
    sourceDish: dish._id,
    status: dish.status,
    isActive: Boolean(dish.isAvailable && dish.status === 'approved'),
    isPublic: false,
    inventory: {
      quantity: 0,
      lowStockThreshold: 0,
      trackQuantity: false,
      allowBackorder: true,
      reservedQuantity: 0
    }
  };
};

exports.syncDishProduct = async (restaurateur, dish, overrides = {}) => {
  if (!restaurateur || !dish) {
    return null;
  }

  const payload = {
    ...buildDishProductPayload(restaurateur, dish),
    ...overrides
  };

  // S'assurer qu'une image par défaut existe si aucune fournie
  if (!payload.images || payload.images.length === 0) {
    payload.images = [{
      url: '/images/placeholders/dish-placeholder.png',
      alt: toPlainText(payload.name, 'Plat'),
      isPrimary: true,
      order: 0
    }];
  }

  return Product.findOneAndUpdate(
    { sourceDish: dish._id },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true } 
  );
};

exports.deleteDishProduct = async (dishId) => {
  if (!dishId) return;
  await Product.deleteOne({ sourceDish: dishId });
};

