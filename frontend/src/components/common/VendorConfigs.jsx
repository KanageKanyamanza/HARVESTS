import { 
  FiStar, 
  FiPackage, 
  FiUsers, 
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock
} from 'react-icons/fi';

// Configuration pour les producteurs
export const producerConfig = {
  vendorType: 'producer',
  getVendorName: (producer) => producer.farmName || `${producer.firstName} ${producer.lastName}`,
  getVendorSubtitle: (producer) => `${producer.firstName} ${producer.lastName}`,
  getVendorStats: (producer, products) => [
    {
      icon: <FiStar className="w-5 h-5 text-yellow-500" />,
      value: producer.salesStats?.averageRating?.toFixed(1) || '0.0',
      label: 'Note moyenne'
    },
    {
      icon: <FiPackage className="w-5 h-5 text-blue-500" />,
      value: products.length,
      label: 'Produits'
    },
    {
      icon: <FiUsers className="w-5 h-5 text-green-500" />,
      value: producer.salesStats?.totalReviews || 0,
      label: 'Avis'
    },
    {
      icon: <FiCalendar className="w-5 h-5 text-purple-500" />,
      value: new Date(producer.createdAt).getFullYear(),
      label: 'Membre depuis'
    }
  ],
  getVendorContact: (producer) => {
    const contact = [];
    if (producer.phone) {
      contact.push({
        icon: <FiPhone className="h-5 w-5 text-gray-400 mr-3" />,
        text: producer.phone,
        href: `tel:${producer.phone}`
      });
    }
    if (producer.email) {
      contact.push({
        icon: <FiMail className="h-5 w-5 text-gray-400 mr-3" />,
        text: producer.email,
        href: `mailto:${producer.email}`
      });
    }
    if (producer.address) {
      contact.push({
        icon: <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />,
        text: `${producer.address.street ? producer.address.street + ', ' : ''}${producer.address.city}${producer.address.region ? ', ' + producer.address.region : ''}`
      });
    }
    return contact;
  },
  getVendorTags: (producer) => [
    {
      label: 'Spécialités',
      items: producer.specialties || []
    }
  ],
  formatPrice: (price) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price),
  getItemName: (product) => product.name?.fr || product.name?.en || 'Produit sans nom',
  getItemDescription: (product) => product.description?.fr || product.description?.en || 'Aucune description',
  getItemPrice: (product) => product.price,
  getItemImage: (product) => product.images?.[0]?.url,
  getItemExtraInfo: (product) => `${product.inventory?.quantity || 0} en stock`,
  getItemButtonText: 'Ajouter au panier',
  getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-green-600 hover:bg-green-700',
  getEmptyStateIcon: <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucun produit disponible',
  getEmptyStateDescription: 'Ce producteur n\'a pas encore de produits en vente.',
  tabs: ['products'],
  getTabLabel: (tab) => tab === 'products' ? 'Produits' : tab,
  getTabCount: (tab, items) => items.length,
  getTabContent: (tab, items, vendor, helpers) => {
    if (tab === 'products') {
      return (
        <div>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => helpers.navigate(`/products/${item._id}`)}
                >
                  {/* Image du produit */}
                  <div className="h-48 bg-gray-200 relative">
                    {helpers.getItemImage(item) ? (
                      <img 
                        src={helpers.getItemImage(item)} 
                        alt={helpers.getItemName(item)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FiPackage className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Informations du produit */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {helpers.getItemName(item)}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {helpers.getItemDescription(item)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {helpers.formatPrice(helpers.getItemPrice(item))}
                      </span>
                      <span className="text-sm text-gray-500">
                        {helpers.getItemExtraInfo(item)}
                      </span>
                    </div>
                    <button 
                      className={`w-full mt-3 ${helpers.getItemButtonColor} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
                      onClick={(e) => {
                        e.stopPropagation();
                        helpers.addToCart(item);
                      }}
                    >
                      {helpers.getItemButtonIcon}
                      {helpers.getItemButtonText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {helpers.getEmptyStateIcon}
              <h3 className="text-lg font-medium text-gray-900 mb-2">{helpers.getEmptyStateTitle}</h3>
              <p className="text-gray-500">{helpers.getEmptyStateDescription}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  }
};

// Configuration pour les restaurateurs
export const restaurateurConfig = {
  vendorType: 'restaurateur',
  getVendorName: (restaurateur) => restaurateur.restaurantName || `${restaurateur.firstName} ${restaurateur.lastName}`,
  getVendorSubtitle: (restaurateur) => {
    const types = {
      'fine-dining': 'Restaurant gastronomique',
      'casual': 'Restaurant décontracté',
      'fast-food': 'Restaurant rapide',
      'cafe': 'Café',
      'bar': 'Bar',
      'catering': 'Traiteur',
      'food-truck': 'Food truck',
      'bakery': 'Boulangerie'
    };
    return types[restaurateur.restaurantType] || restaurateur.restaurantType;
  },
  getVendorStats: (restaurateur, dishes) => [
    {
      icon: <FiStar className="w-5 h-5 text-yellow-500" />,
      value: restaurateur.businessStats?.supplierRating?.toFixed(1) || '0.0',
      label: 'Note moyenne'
    },
    {
      icon: <FiPackage className="w-5 h-5 text-orange-500" />,
      value: dishes.length,
      label: 'Plats'
    },
    {
      icon: <FiUsers className="w-5 h-5 text-green-500" />,
      value: restaurateur.seatingCapacity || 0,
      label: 'Places'
    },
    {
      icon: <FiCalendar className="w-5 h-5 text-purple-500" />,
      value: new Date(restaurateur.createdAt).getFullYear(),
      label: 'Membre depuis'
    }
  ],
  getVendorContact: (restaurateur) => {
    const contact = [];
    if (restaurateur.phone) {
      contact.push({
        icon: <FiPhone className="h-5 w-5 text-gray-400 mr-3" />,
        text: restaurateur.phone,
        href: `tel:${restaurateur.phone}`
      });
    }
    if (restaurateur.email) {
      contact.push({
        icon: <FiMail className="h-5 w-5 text-gray-400 mr-3" />,
        text: restaurateur.email,
        href: `mailto:${restaurateur.email}`
      });
    }
    if (restaurateur.address) {
      contact.push({
        icon: <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />,
        text: `${restaurateur.address.street ? restaurateur.address.street + ', ' : ''}${restaurateur.address.city}${restaurateur.address.region ? ', ' + restaurateur.address.region : ''}`
      });
    }
    return contact;
  },
  getVendorTags: (restaurateur) => [
    {
      label: 'Types de cuisine',
      items: (restaurateur.cuisineTypes || []).map(type => {
        const types = {
          'african': 'Africaine',
          'french': 'Française',
          'italian': 'Italienne',
          'asian': 'Asiatique',
          'american': 'Américaine',
          'mediterranean': 'Méditerranéenne',
          'fusion': 'Fusion',
          'vegetarian': 'Végétarienne',
          'vegan': 'Végane'
        };
        return types[type] || type;
      })
    }
  ],
  formatPrice: (price) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price),
  getItemName: (dish) => dish.name,
  getItemDescription: (dish) => dish.description || 'Aucune description',
  getItemPrice: (dish) => dish.price,
  getItemImage: (dish) => dish.image,
  getItemExtraInfo: (dish) => `${dish.preparationTime || 0} min`,
  getItemButtonText: 'Commander',
  getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-orange-600 hover:bg-orange-700',
  getEmptyStateIcon: <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Menu en cours de préparation',
  getEmptyStateDescription: 'Notre menu sera bientôt disponible.',
  tabs: ['menu', 'hours'],
  getTabLabel: (tab) => {
    const labels = {
      'menu': 'Menu',
      'hours': 'Horaires'
    };
    return labels[tab] || tab;
  },
  getTabCount: (tab, items) => {
    if (tab === 'menu') return items.length;
    return 0;
  },
  getTabContent: (tab, items, vendor, helpers) => {
    if (tab === 'menu') {
      return (
        <div>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => helpers.navigate(`/dishes/${item._id}`)}
                >
                  {/* Image du plat */}
                  <div className="h-48 bg-gray-200 relative">
                    {helpers.getItemImage(item) ? (
                      <img 
                        src={helpers.getItemImage(item)} 
                        alt={helpers.getItemName(item)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FiPackage className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Informations du plat */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {helpers.getItemName(item)}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {helpers.getItemDescription(item)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        {helpers.formatPrice(helpers.getItemPrice(item))}
                      </span>
                      <span className="text-sm text-gray-500">
                        {helpers.getItemExtraInfo(item)}
                      </span>
                    </div>
                    <button 
                      className={`w-full mt-3 ${helpers.getItemButtonColor} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
                      onClick={(e) => {
                        e.stopPropagation();
                        helpers.addToCart(item);
                      }}
                    >
                      {helpers.getItemButtonIcon}
                      {helpers.getItemButtonText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {helpers.getEmptyStateIcon}
              <h3 className="text-lg font-medium text-gray-900 mb-2">{helpers.getEmptyStateTitle}</h3>
              <p className="text-gray-500">{helpers.getEmptyStateDescription}</p>
            </div>
          )}
        </div>
      );
    }
    
    if (tab === 'hours') {
      const getDayLabel = (day) => {
        const days = {
          'monday': 'Lundi',
          'tuesday': 'Mardi',
          'wednesday': 'Mercredi',
          'thursday': 'Jeudi',
          'friday': 'Vendredi',
          'saturday': 'Samedi',
          'sunday': 'Dimanche'
        };
        return days[day] || day;
      };

      return (
        <div>
          {vendor.operatingHours ? (
            <div className="space-y-3">
              {Object.entries(vendor.operatingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-900">
                    {getDayLabel(day)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {hours.isOpen && hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Fermé'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Horaires non renseignés</h3>
              <p className="text-gray-500">Les horaires d'ouverture ne sont pas encore disponibles.</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  }
};

// Configuration pour les transformateurs
export const transformerConfig = {
  vendorType: 'transformer',
  getVendorName: (transformer) => transformer.shopInfo?.shopName || transformer.companyName || `${transformer.firstName} ${transformer.lastName}`,
  getVendorSubtitle: (transformer) => transformer.shopInfo?.shopDescription || `${transformer.firstName} ${transformer.lastName}`,
  getVendorStats: (transformer, products) => [
    {
      icon: <FiStar className="w-5 h-5 text-yellow-500" />,
      value: transformer.businessStats?.supplierRating?.toFixed(1) || '0.0',
      label: 'Note moyenne'
    },
    {
      icon: <FiPackage className="w-5 h-5 text-green-500" />,
      value: products.length,
      label: 'Produits'
    },
    {
      icon: <FiUsers className="w-5 h-5 text-green-500" />,
      value: transformer.businessStats?.totalReviews || 0,
      label: 'Avis'
    },
    {
      icon: <FiCalendar className="w-5 h-5 text-purple-500" />,
      value: new Date(transformer.createdAt).getFullYear(),
      label: 'Membre depuis'
    }
  ],
  getVendorContact: (transformer) => {
    const contact = [];
    if (transformer.phone) {
      contact.push({
        icon: <FiPhone className="h-5 w-5 text-gray-400 mr-3" />,
        text: transformer.phone,
        href: `tel:${transformer.phone}`
      });
    }
    if (transformer.email) {
      contact.push({
        icon: <FiMail className="h-5 w-5 text-gray-400 mr-3" />,
        text: transformer.email,
        href: `mailto:${transformer.email}`
      });
    }
    if (transformer.address) {
      contact.push({
        icon: <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />,
        text: `${transformer.address.street ? transformer.address.street + ', ' : ''}${transformer.address.city}${transformer.address.region ? ', ' + transformer.address.region : ''}`
      });
    }
    return contact;
  },
  getVendorTags: (transformer) => [
    {
      label: 'Spécialités',
      items: transformer.specialties || []
    }
  ],
  formatPrice: (price) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price),
  getItemName: (product) => product.name?.fr || product.name?.en || 'Produit sans nom',
  getItemDescription: (product) => product.description?.fr || product.description?.en || 'Aucune description',
  getItemPrice: (product) => product.price,
  getItemImage: (product) => product.images?.[0]?.url,
  getItemExtraInfo: (product) => `${product.inventory?.quantity || 0} en stock`,
  getItemButtonText: 'Ajouter au panier',
  getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-green-600 hover:bg-green-700',
  getEmptyStateIcon: <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucun produit disponible',
  getEmptyStateDescription: 'Ce transformateur n\'a pas encore de produits en vente.',
  tabs: ['products', 'hours'],
  getTabLabel: (tab) => {
    const labels = {
      'products': 'Produits',
      'hours': 'Horaires'
    };
    return labels[tab] || tab;
  },
  getTabCount: (tab, items) => {
    if (tab === 'products') return items.length;
    return 0;
  },
  getTabContent: (tab, items, vendor, helpers) => {
    if (tab === 'products') {
      return (
        <div>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => helpers.navigate(`/products/${item._id}`)}
                >
                  {/* Image du produit */}
                  <div className="h-48 bg-gray-200 relative">
                    {helpers.getItemImage(item) ? (
                      <img 
                        src={helpers.getItemImage(item)} 
                        alt={helpers.getItemName(item)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FiPackage className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Informations du produit */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {helpers.getItemName(item)}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {helpers.getItemDescription(item)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {helpers.formatPrice(helpers.getItemPrice(item))}
                      </span>
                      <span className="text-sm text-gray-500">
                        {helpers.getItemExtraInfo(item)}
                      </span>
                    </div>
                    <button 
                      className={`w-full mt-3 ${helpers.getItemButtonColor} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
                      onClick={(e) => {
                        e.stopPropagation();
                        helpers.addToCart(item);
                      }}
                    >
                      {helpers.getItemButtonIcon}
                      {helpers.getItemButtonText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {helpers.getEmptyStateIcon}
              <h3 className="text-lg font-medium text-gray-900 mb-2">{helpers.getEmptyStateTitle}</h3>
              <p className="text-gray-500">{helpers.getEmptyStateDescription}</p>
            </div>
          )}
        </div>
      );
    }
    
    if (tab === 'hours') {
      const getDayLabel = (day) => {
        const days = {
          'monday': 'Lundi',
          'tuesday': 'Mardi',
          'wednesday': 'Mercredi',
          'thursday': 'Jeudi',
          'friday': 'Vendredi',
          'saturday': 'Samedi',
          'sunday': 'Dimanche'
        };
        return days[day] || day;
      };

      return (
        <div>
          {vendor.shopInfo?.openingHours ? (
            <div className="space-y-3">
              {Object.entries(vendor.shopInfo.openingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-900">
                    {getDayLabel(day)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {hours.isOpen && hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Fermé'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Horaires non renseignés</h3>
              <p className="text-gray-500">Les horaires d'ouverture ne sont pas encore disponibles.</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  }
};
