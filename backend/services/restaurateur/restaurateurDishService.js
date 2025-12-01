const Product = require('../../models/Product');
const Restaurateur = require('../../models/Restaurateur');
const { toPlainText } = require('../../utils/localization');

/**
 * Service pour la gestion des plats du restaurateur
 */

async function addDish(restaurateurId, dishData) {
  const { name, description, price, image, category, preparationTime, allergens, stock } = dishData;
  
  const restaurateur = await Restaurateur.findById(restaurateurId);
  if (!restaurateur) {
    throw new Error('Restaurateur non trouvé');
  }
  
  if (!name || !price) {
    throw new Error('Le nom et le prix sont requis');
  }

  const normalizedName = toPlainText(name, name);
  const normalizedDescriptionRaw = description !== undefined && description !== null
    ? toPlainText(description, '')
    : '';
  const baseDescription = normalizedDescriptionRaw || 'Plat proposé par le restaurateur';
  const shortDescriptionText = (normalizedDescriptionRaw || normalizedName || '').slice(0, 160) || 'Plat proposé par le restaurateur';

  const images = [];
  if (image) {
    images.push({
      url: image,
      alt: normalizedName || 'Plat',
      isPrimary: true,
      order: 0
    });
  }

  const initialStock = stock !== undefined && stock !== null ? Math.max(0, parseInt(stock) || 10) : 10;

  const productData = {
    name: normalizedName,
    description: baseDescription,
    shortDescription: shortDescriptionText,
    price: parseFloat(price),
    images,
    userType: 'restaurateur',
    restaurateur: restaurateurId,
    category: 'processed-foods',
    subcategory: `dish-${category || 'plat'}`,
    originType: 'dish',
    dishInfo: {
      category: category || 'plat',
      preparationTime: preparationTime || 30,
      allergens: allergens || []
    },
    status: 'pending-review',
    isActive: false,
    isPublic: false,
    inventory: {
      quantity: initialStock,
      lowStockThreshold: Math.max(1, Math.floor(initialStock * 0.2)),
      trackQuantity: true,
      allowBackorder: false,
      reservedQuantity: 0
    },
    minimumOrderQuantity: 0
  };
  
  return await Product.create(productData);
}

async function updateDish(dishId, restaurateurId, updateData) {
  const product = await Product.findOne({
    _id: dishId,
    restaurateur: restaurateurId,
    originType: 'dish'
  });

  if (!product) {
    throw new Error('Plat non trouvé');
  }

  delete updateData.status;
  delete updateData.approvedAt;
  delete updateData.rejectionReason;
  delete updateData.isPublic;

  const fieldsRequiringReview = ['name', 'description', 'price', 'category', 'image'];
  let requiresReview = fieldsRequiringReview.some((field) => Object.prototype.hasOwnProperty.call(updateData, field));

  if (updateData.category || updateData.preparationTime !== undefined || updateData.allergens) {
    if (!product.dishInfo) product.dishInfo = {};
    if (updateData.category) product.dishInfo.category = updateData.category;
    if (updateData.preparationTime !== undefined) product.dishInfo.preparationTime = updateData.preparationTime;
    if (updateData.allergens) product.dishInfo.allergens = updateData.allergens;
    delete updateData.category;
    delete updateData.preparationTime;
    delete updateData.allergens;
    requiresReview = true;
  }

  if (Object.prototype.hasOwnProperty.call(updateData, 'name')) {
    updateData.name = toPlainText(updateData.name, product.name);
  }

  if (Object.prototype.hasOwnProperty.call(updateData, 'description')) {
    const normalizedDescription = toPlainText(updateData.description, product.description);
    updateData.description = normalizedDescription;
    const derivedShort = (normalizedDescription || '').slice(0, 160);
    if (!Object.prototype.hasOwnProperty.call(updateData, 'shortDescription')) {
      updateData.shortDescription = derivedShort || product.shortDescription;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updateData, 'shortDescription')) {
    updateData.shortDescription = toPlainText(updateData.shortDescription, product.shortDescription);
  }

  if (updateData.image) {
    const imageUrl = typeof updateData.image === 'string' ? updateData.image : updateData.image.url;
    const altText = toPlainText(updateData.name, product.name) || 'Plat';
    updateData.images = [{ url: imageUrl, alt: altText, isPrimary: true, order: 0 }];
    delete updateData.image;
  }

  if (updateData.price !== undefined) {
    updateData.price = parseFloat(updateData.price);
  }

  if (updateData.stock !== undefined && updateData.stock !== null) {
    const newStock = Math.max(0, parseInt(updateData.stock) || 0);
    if (!product.inventory) {
      product.inventory = {
        quantity: newStock,
        lowStockThreshold: Math.max(1, Math.floor(newStock * 0.2)),
        trackQuantity: true,
        allowBackorder: false,
        reservedQuantity: 0
      };
    } else {
      product.inventory.quantity = newStock;
      product.inventory.lowStockThreshold = Math.max(1, Math.floor(newStock * 0.2));
      product.inventory.trackQuantity = true;
    }
    delete updateData.stock;
  }

  if (requiresReview) {
    updateData.status = 'pending-review';
    updateData.isActive = false;
  }

  Object.assign(product, updateData);
  await product.save();
  
  return { product, requiresReview };
}

async function deleteDish(dishId, restaurateurId) {
  const product = await Product.findOneAndDelete({
    _id: dishId,
    restaurateur: restaurateurId,
    originType: 'dish'
  });
  if (!product) {
    throw new Error('Plat non trouvé');
  }
  return product;
}

async function getMyDishes(restaurateurId) {
  const dishes = await Product.find({
    restaurateur: restaurateurId,
    originType: 'dish'
  })
  .select('name description shortDescription price images primaryImage image dishInfo status isActive createdAt updatedAt slug restaurateur inventory')
  .sort('-createdAt');
  
  const dishesToUpdate = [];
  dishes.forEach(p => {
    if (!p.inventory || p.inventory.trackQuantity === false) {
      if (!p.inventory) p.inventory = {};
      p.inventory.quantity = p.inventory.quantity || 10;
      p.inventory.lowStockThreshold = p.inventory.lowStockThreshold || Math.max(1, Math.floor(p.inventory.quantity * 0.2));
      p.inventory.trackQuantity = true;
      p.inventory.allowBackorder = false;
      p.inventory.reservedQuantity = p.inventory.reservedQuantity || 0;
      dishesToUpdate.push(p._id);
    }
  });
  
  if (dishesToUpdate.length > 0) {
    await Promise.all(dishesToUpdate.map(id => {
      const dish = dishes.find(d => d._id.toString() === id.toString());
      return Product.findByIdAndUpdate(id, { inventory: dish.inventory }, { new: true });
    }));
  }
  
  return dishes;
}

async function getDishDetail(dishId, currentUserId = null, jwtToken = null) {
  const jwt = require('jsonwebtoken');
  const { promisify } = require('util');
  const User = require('../../models/User');
  
  const product = await Product.findOne({
    originType: 'dish',
    _id: dishId
  })
    .select('name description shortDescription price images primaryImage image dishInfo status isActive createdAt updatedAt slug restaurateur inventory')
    .populate('restaurateur', 'restaurantName firstName lastName address city region phone email');
  
  if (!product) {
    throw new Error('Plat non trouvé');
  }
  
  if (product.status === 'approved') {
    // Plat approuvé, accessible à tous
  } else {
    // Pour les plats non approuvés, vérifier si l'utilisateur est le propriétaire
    let userId = currentUserId;
    if (!userId && jwtToken) {
      try {
        const decoded = await promisify(jwt.verify)(jwtToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('userType');
        if (user && user.userType === 'restaurateur') {
          userId = user._id;
        }
      } catch (error) {
        // Token invalide
      }
    }
    
    if (!userId || 
        !product.restaurateur || 
        (product.restaurateur._id?.toString() !== userId.toString() && 
         product.restaurateur.toString() !== userId.toString())) {
      throw new Error('Plat non trouvé');
    }
  }
  
  if (product && product.status === 'approved' && !product.isActive) {
    product.isActive = true;
    await product.save();
  }

  let imageUrl = null;
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'object' && firstImage !== null) {
      imageUrl = firstImage.url || firstImage.src || null;
    } else if (typeof firstImage === 'string') {
      imageUrl = firstImage;
    }
  }
  
  if (!imageUrl && product.primaryImage) {
    if (typeof product.primaryImage === 'object' && product.primaryImage !== null) {
      imageUrl = product.primaryImage.url || product.primaryImage.src || null;
    } else if (typeof product.primaryImage === 'string') {
      imageUrl = product.primaryImage;
    }
  }
  
  if (!imageUrl) {
    imageUrl = product.image || null;
  }
  
  const productName = toPlainText(product.name, '');
  const productShortDescription = toPlainText(product.shortDescription, '');
  const productDescription = toPlainText(product.description, '');

  return {
    _id: product._id,
    productId: product._id,
    name: productName,
    description: productShortDescription || productDescription,
    price: product.price,
    images: product.images || [],
    image: imageUrl,
    dishInfo: product.dishInfo,
    category: product.dishInfo?.category,
    preparationTime: product.dishInfo?.preparationTime || null,
    allergens: product.dishInfo?.allergens || [],
    slug: product.slug,
    inventory: product.inventory || { quantity: 0, trackQuantity: true },
    stock: product.inventory?.quantity || 0,
    isInStock: (product.inventory?.quantity || 0) > 0,
    trackQuantity: product.inventory?.trackQuantity !== false,
    restaurateur: product.restaurateur,
    status: product.status,
    isActive: product.isActive
  };
}

async function getRestaurateurDishes(restaurateurId) {
  const restaurateur = await Restaurateur.findById(restaurateurId).select('restaurantName');
  if (!restaurateur) {
    throw new Error('Restaurateur non trouvé');
  }
  
  const products = await Product.find({
    restaurateur: restaurateurId,
    originType: 'dish',
    status: 'approved',
    $or: [
      { 'inventory.trackQuantity': false },
      { 'inventory.trackQuantity': true, 'inventory.quantity': { $gt: 0 } },
      { 'inventory': { $exists: false } }
    ]
  }).select('name description shortDescription price images primaryImage image dishInfo slug isActive inventory').sort('-createdAt');
  
  const productsToUpdateStock = [];
  products.forEach(p => {
    if (!p.inventory || p.inventory.trackQuantity === false) {
      if (!p.inventory) p.inventory = {};
      p.inventory.quantity = p.inventory.quantity || 10;
      p.inventory.lowStockThreshold = p.inventory.lowStockThreshold || Math.max(1, Math.floor(p.inventory.quantity * 0.2));
      p.inventory.trackQuantity = true;
      p.inventory.allowBackorder = false;
      p.inventory.reservedQuantity = p.inventory.reservedQuantity || 0;
      productsToUpdateStock.push(p._id);
    }
  });
  
  if (productsToUpdateStock.length > 0) {
    await Promise.all(productsToUpdateStock.map(id => {
      const product = products.find(p => p._id.toString() === id.toString());
      return Product.findByIdAndUpdate(id, { inventory: product.inventory }, { new: true });
    }));
    const updatedProducts = await Product.find({
      restaurateur: restaurateurId,
      originType: 'dish',
      status: 'approved'
    }).select('name description shortDescription price images primaryImage image dishInfo slug isActive inventory').sort('-createdAt');
    updatedProducts.forEach((updated, idx) => {
      const original = products.find(p => p._id.toString() === updated._id.toString());
      if (original) {
        products[idx] = updated;
      }
    });
  }
  
  const productsToUpdate = products.filter(p => !p.isActive);
  if (productsToUpdate.length > 0) {
    await Product.updateMany(
      { _id: { $in: productsToUpdate.map(p => p._id) } },
      { $set: { isActive: true } }
    );
    productsToUpdate.forEach(p => { p.isActive = true; });
  }

  const dishes = products.map((product) => {
    let imageUrl = null;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage !== null) {
        imageUrl = firstImage.url || firstImage.src || null;
      } else if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      }
    }
    
    if (!imageUrl && product.primaryImage) {
      if (typeof product.primaryImage === 'object' && product.primaryImage !== null) {
        imageUrl = product.primaryImage.url || product.primaryImage.src || null;
      } else if (typeof product.primaryImage === 'string') {
        imageUrl = product.primaryImage;
      }
    }
    
    if (!imageUrl) {
      imageUrl = product.image || null;
    }
    
    const productName = toPlainText(product.name, '');
    const productShortDescription = toPlainText(product.shortDescription, '');
    const productDescription = toPlainText(product.description, '');
    
    return {
      _id: product._id,
      productId: product._id,
      name: productName,
      description: productShortDescription || productDescription,
      price: product.price,
      image: imageUrl,
      images: product.images || [],
      dishInfo: product.dishInfo,
      category: product.dishInfo?.category,
      preparationTime: product.dishInfo?.preparationTime || null,
      allergens: product.dishInfo?.allergens || [],
      slug: product.slug,
      inventory: product.inventory || { quantity: 10, trackQuantity: true },
      stock: product.inventory?.quantity || 10,
      isInStock: (product.inventory?.quantity || 10) > 0,
      trackQuantity: product.inventory?.trackQuantity !== false
    };
  });
  
  return { dishes, restaurantName: restaurateur.restaurantName };
}

module.exports = {
  addDish,
  updateDish,
  deleteDish,
  getMyDishes,
  getDishDetail,
  getRestaurateurDishes
};

