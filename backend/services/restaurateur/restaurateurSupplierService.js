const Producer = require('../../models/Producer');
const Transformer = require('../../models/Transformer');

/**
 * Service pour la découverte de fournisseurs pour les restaurateurs
 */

async function discoverSuppliers(queryParams) {
  const { limit = 20, page = 1, type, region, search } = queryParams;
  const skip = (page - 1) * limit;
  
  const baseFilters = {
    isActive: true,
    isApproved: true,
    isEmailVerified: true
  };
  
  const filters = { ...baseFilters };
  if (region) filters.region = new RegExp(region, 'i');
  if (search) {
    filters.$or = [
      { companyName: new RegExp(search, 'i') },
      { businessName: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }
  
  let suppliers = [];
  let total = 0;
  
  if (!type || type === 'producer') {
    const producers = await Producer.find(filters)
      .select('companyName businessName description region contactInfo businessStats createdAt')
      .sort('-businessStats.supplierRating -createdAt')
      .skip(type === 'producer' ? skip : 0)
      .limit(type === 'producer' ? limit : Math.ceil(limit / 2));
    
    const producerCount = await Producer.countDocuments(filters);
    
    suppliers = suppliers.concat(producers.map(p => ({
      ...p.toObject(),
      userType: 'producer',
      supplierType: 'Producteur'
    })));
    
    total += producerCount;
  }
  
  if (!type || type === 'transformer') {
    const transformers = await Transformer.find(filters)
      .select('companyName businessName description region contactInfo businessStats transformationType createdAt')
      .sort('-businessStats.supplierRating -createdAt')
      .skip(type === 'transformer' ? skip : 0)
      .limit(type === 'transformer' ? limit : Math.ceil(limit / 2));
    
    const transformerCount = await Transformer.countDocuments(filters);
    
    suppliers = suppliers.concat(transformers.map(t => ({
      ...t.toObject(),
      userType: 'transformer',
      supplierType: 'Transformateur'
    })));
    
    total += transformerCount;
  }
  
  suppliers.sort((a, b) => {
    const ratingA = a.businessStats?.supplierRating || 0;
    const ratingB = b.businessStats?.supplierRating || 0;
    if (ratingA !== ratingB) return ratingB - ratingA;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  if (!type) {
    suppliers = suppliers.slice(0, limit);
  }
  
  return { suppliers, total };
}

module.exports = {
  discoverSuppliers
};

