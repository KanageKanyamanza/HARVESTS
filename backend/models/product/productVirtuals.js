/**
 * Ajoute les virtuals au schéma Product
 */
function addProductVirtuals(productSchema) {
  productSchema.virtual('isInStock').get(function() {
    if (this.hasVariants) {
      return this.variants.some(variant => 
        variant.isActive && variant.inventory.quantity > 0
      );
    }
    return this.inventory.quantity > 0;
  });

  productSchema.virtual('isLowStock').get(function() {
    if (this.hasVariants) {
      return this.variants.some(variant => 
        variant.isActive && 
        variant.inventory.quantity <= variant.inventory.lowStockThreshold &&
        variant.inventory.quantity > 0
      );
    }
    return this.inventory.quantity <= this.inventory.lowStockThreshold && 
           this.inventory.quantity > 0;
  });

  productSchema.virtual('displayPrice').get(function() {
    if (this.hasVariants && this.variants.length > 0) {
      const activePrices = this.variants
        .filter(v => v.isActive)
        .map(v => v.price);
      
      if (activePrices.length === 0) return null;
      
      const minPrice = Math.min(...activePrices);
      const maxPrice = Math.max(...activePrices);
      
      return minPrice === maxPrice ? minPrice : { from: minPrice, to: maxPrice };
    }
    return this.price;
  });

  productSchema.virtual('primaryImage').get(function() {
    if (this.images && this.images.length > 0) {
      const primary = this.images.find(img => img.isPrimary);
      return primary || this.images[0];
    }
    return null;
  });
}

module.exports = addProductVirtuals;

