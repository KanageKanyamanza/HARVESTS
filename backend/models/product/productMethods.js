/**
 * Ajoute les méthodes d'instance au schéma Product
 */
function addProductMethods(productSchema) {
  productSchema.methods.reserveStock = function(quantity, variantId = null) {
    if (this.hasVariants && variantId) {
      const variant = this.variants.id(variantId);
      if (!variant || variant.inventory.quantity < quantity) {
        throw new Error('Stock insuffisant pour cette variante');
      }
      variant.inventory.quantity -= quantity;
      variant.inventory.reservedQuantity = (variant.inventory.reservedQuantity || 0) + quantity;
    } else {
      if (this.inventory.quantity < quantity) {
        throw new Error('Stock insuffisant');
      }
      this.inventory.quantity -= quantity;
      this.inventory.reservedQuantity = (this.inventory.reservedQuantity || 0) + quantity;
    }
    
    this.lastStockUpdate = new Date();
  };

  productSchema.methods.releaseStock = function(quantity, variantId = null) {
    if (this.hasVariants && variantId) {
      const variant = this.variants.id(variantId);
      if (variant) {
        variant.inventory.quantity += quantity;
        variant.inventory.reservedQuantity = Math.max(0, (variant.inventory.reservedQuantity || 0) - quantity);
      }
    } else {
      this.inventory.quantity += quantity;
      this.inventory.reservedQuantity = Math.max(0, (this.inventory.reservedQuantity || 0) - quantity);
    }
    
    this.lastStockUpdate = new Date();
  };

  productSchema.methods.incrementViews = function() {
    if (!this.stats) {
      this.stats = { views: 0, sales: 0, favorites: 0 };
    }
    this.stats.views += 1;
    return this.save({ validateBeforeSave: false });
  };

  // Méthode pour obtenir le contenu dans la langue demandée
  productSchema.methods.getLocalizedContent = function() {
    return {
      name: this.name,
      description: this.description,
      shortDescription: this.shortDescription,
      _id: this._id,
      slug: this.slug,
      producer: this.producer,
      category: this.category,
      subcategory: this.subcategory,
      price: this.price,
      images: this.images,
      inventory: this.inventory,
      stats: this.stats,
      isActive: this.isActive,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  };
}

module.exports = addProductMethods;

