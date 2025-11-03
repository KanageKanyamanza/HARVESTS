const Product = require('../models/Product');

const DEFAULT_CATEGORY = 'processed-foods';

const buildDishProductPayload = (restaurateur, dish) => {
  const nameValue = dish.name || 'Plat';
  const descriptionValue = dish.description || '';
  const shortDescription = descriptionValue ? descriptionValue.slice(0, 160) : 'Plat proposé par le restaurateur';

  const images = [];
  if (dish.image) {
    images.push({ url: dish.image, alt: nameValue, isPrimary: true, order: 0 });
  }

  return {
    name: { fr: nameValue, en: nameValue },
    description: { fr: descriptionValue, en: descriptionValue },
    shortDescription: { fr: shortDescription, en: shortDescription },
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
      alt: payload.name.fr || payload.name.en || 'Plat',
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

