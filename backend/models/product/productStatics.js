/**
 * Ajoute les méthodes statiques au schéma Product
 */
function addProductStatics(productSchema) {
  // Méthode statique pour la recherche (améliorée avec gestion pluriel/singulier)
  productSchema.statics.search = function(query, filters = {}) {
    const { buildFlexibleSearchQuery } = require('../../utils/searchUtils');
    
    const searchQuery = {
      status: 'approved',
      isActive: true,
      isPublic: { $ne: false },
      ...filters
    };
    
    // Utiliser la recherche flexible si un terme de recherche est fourni
    if (query && query.trim()) {
      const flexibleSearch = buildFlexibleSearchQuery(query, [
        'name',
        'description',
        'shortDescription',
        'tags',
        'subcategory'
      ]);
      
      if (flexibleSearch.$or && flexibleSearch.$or.length > 0) {
        searchQuery.$or = flexibleSearch.$or;
      }
    }
    
    return this.find(searchQuery)
      .populate('producer', 'farmName firstName lastName address')
      .populate('transformer', 'companyName firstName lastName address')
      .sort({ createdAt: -1 });
  };
}

module.exports = addProductStatics;

