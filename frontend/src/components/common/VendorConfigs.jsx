import {
  FiStar, 
  FiPackage, 
  FiUsers, 
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiGlobe
} from 'react-icons/fi';
import { getVendorAverageRating, getVendorReviewCount, formatAverageRating, getProductAverageRating, getProductReviewCount } from '../../utils/vendorRatings';
import { getDishImageUrl } from '../../utils/dishImageUtils';
import { toPlainText } from '../../utils/textHelpers';

// Configuration pour les producteurs
export const producerConfig = {
  vendorType: 'producer',
  getVendorName: (producer) => producer.farmName || `${producer.firstName} ${producer.lastName}`,
  getVendorSubtitle: (producer) => producer.farmName ? `${producer.firstName} ${producer.lastName}` : 'Producteur',
  getVendorStats: (producer, products, reviews = []) => {
    const averageRating = getVendorAverageRating(producer, reviews);
    const reviewCount = getVendorReviewCount(producer, reviews);

    return [
      {
        icon: <FiStar className="w-5 h-5 text-yellow-500" />,
        value: formatAverageRating(averageRating),
        label: 'Note moyenne'
      },
      {
        icon: <FiPackage className="w-5 h-5 text-blue-500" />,
        value: products.length,
        label: 'Produits'
      },
      {
        icon: <FiUsers className="w-5 h-5 text-green-500" />,
        value: reviewCount,
        label: 'Avis'
      },
      {
        icon: <FiCalendar className="w-5 h-5 text-purple-500" />,
        value: new Date(producer.createdAt).getFullYear(),
        label: 'Membre depuis'
      }
    ];
  },
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
    if (producer.address || producer.city) {
      contact.push({
        icon: <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />,
        text: `${producer.address ? producer.address + ', ' : ''}${producer.city || ''}${producer.region ? ', ' + producer.region : ''}`
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
  getItemName: (product) => toPlainText(product.name, 'Produit sans nom'),
  getItemDescription: (product) => toPlainText(product.description, 'Aucune description'),
  getItemPrice: (product) => product.price,
  getItemImage: (product) => product.images?.[0]?.url,
  getItemExtraInfo: (product) => `${product.inventory?.quantity || 0} en stock`,
  getItemButtonText: 'Ajouter au panier',
  getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-green-600 hover:bg-green-700',
  getEmptyStateIcon: <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucun produit disponible',
  getEmptyStateDescription: 'Ce producteur n\'a pas encore de produits en vente.',
  tabs: ['products', 'reviews'],
  getTabLabel: (tab) => {
    const labels = {
      'products': 'Produits',
      'reviews': 'Avis'
    };
    return labels[tab] || tab;
  },
  getTabCount: (tab, items, reviews = []) => {
    if (tab === 'products') return items.length;
    if (tab === 'reviews') return reviews.length;
    return 0;
  },
  getTabContent: (tab, items, vendor, helpers, reviews = []) => {
    if (tab === 'products') {
      return (
        <div>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => {
                const productAverage = getProductAverageRating(item);
                const productReviewCount = getProductReviewCount(item);

                return (
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.category || 'Produit'}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <FiStar className="w-4 h-4" />
                        <span className="ml-1 text-sm text-gray-700">
                          {formatAverageRating(productAverage)}
                        </span>
                        {productReviewCount > 0 && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({productReviewCount} avis)
                          </span>
                        )}
                      </div>
                    </div>
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
                );
              })}
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
    if (tab === 'reviews') {
      return (
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {review.reviewer?.firstName?.[0] || 'A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {review.reviewer?.firstName} {review.reviewer?.lastName}
                        </h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                      <div className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiStar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis</h3>
              <p className="text-gray-500">Ce vendeur n'a pas encore reçu d'avis.</p>
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
  getVendorStats: (restaurateur, dishes, reviews = []) => {
    const averageRating = getVendorAverageRating(restaurateur, reviews);
    const reviewCount = getVendorReviewCount(restaurateur, reviews);

    return [
      {
        icon: <FiStar className="w-5 h-5 text-yellow-500" />,
        value: formatAverageRating(averageRating),
        label: 'Note moyenne'
      },
      {
        icon: <FiPackage className="w-5 h-5 text-orange-500" />,
        value: dishes.length,
        label: 'Plats'
      },
      {
        icon: <FiUsers className="w-5 h-5 text-green-500" />,
        value: reviewCount,
        label: 'Avis'
      },
      {
        icon: <FiCalendar className="w-5 h-5 text-purple-500" />,
        value: new Date(restaurateur.createdAt).getFullYear(),
        label: 'Membre depuis'
      }
    ];
  },
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
    if (restaurateur.address || restaurateur.city) {
      contact.push({
        icon: <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />,
        text: `${restaurateur.address ? restaurateur.address + ', ' : ''}${restaurateur.city || ''}${restaurateur.region ? ', ' + restaurateur.region : ''}`
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
  getItemName: (dish) => toPlainText(dish.name, 'Plat'),
  getItemDescription: (dish) => toPlainText(dish.description, 'Aucune description'),
  getItemPrice: (dish) => dish.price?.value ?? dish.price ?? 0,
  getItemImage: (dish) => getDishImageUrl(dish),
  getItemExtraInfo: (dish) => `${dish.preparationTime || dish.dishInfo?.preparationTime || 0} min`,
  getItemButtonText: 'Commander',
  getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-orange-600 hover:bg-orange-700',
  getEmptyStateIcon: <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Menu en cours de préparation',
  getEmptyStateDescription: 'Notre menu sera bientôt disponible.',
  tabs: ['menu', 'reviews', 'hours'],
  getTabLabel: (tab) => {
    const labels = {
      'menu': 'Menu',
      'reviews': 'Avis',
      'hours': 'Horaires'
    };
    return labels[tab] || tab;
  },
  getTabCount: (tab, items, reviews = []) => {
    if (tab === 'menu') return items.length;
    if (tab === 'reviews') return reviews.length;
    return 0;
  },
  getTabContent: (tab, items, vendor, helpers, reviews = []) => {
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-orange-600">
                        {helpers.formatPrice(helpers.getItemPrice(item))}
                      </span>
                      <span className="text-sm text-gray-500">
                        {helpers.getItemExtraInfo(item)}
                      </span>
                    </div>
                    {/* Affichage du stock pour les plats */}
                    {item.trackQuantity && (
                      <div className="mb-2">
                        <span className={`text-xs font-medium ${(item.stock || item.inventory?.quantity || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Stock: {item.stock ?? item.inventory?.quantity ?? 0}
                        </span>
                      </div>
                    )}
                    {item.trackQuantity && (item.stock ?? item.inventory?.quantity ?? 0) === 0 && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                        Rupture de stock
                      </div>
                    )}
                    <button 
                      disabled={item.trackQuantity && (item.stock ?? item.inventory?.quantity ?? 0) === 0}
                      className={`w-full mt-3 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
                        item.trackQuantity && (item.stock ?? item.inventory?.quantity ?? 0) === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : `${helpers.getItemButtonColor} text-white`
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!(item.trackQuantity && (item.stock ?? item.inventory?.quantity ?? 0) === 0)) {
                          helpers.addToCart(item);
                        }
                      }}
                    >
                      {helpers.getItemButtonIcon}
                      {item.trackQuantity && (item.stock ?? item.inventory?.quantity ?? 0) === 0 ? 'Rupture de stock' : helpers.getItemButtonText}
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
  getVendorName: (transformer) => transformer.companyName || `${transformer.firstName} ${transformer.lastName}`,
  getVendorSubtitle: (transformer) => transformer.companyName ? `${transformer.firstName} ${transformer.lastName}` : 'Transformateur',
  getVendorStats: (transformer, products, reviews = []) => {
    const averageRating = getVendorAverageRating(transformer, reviews);
    const reviewCount = getVendorReviewCount(transformer, reviews);

    return [
      {
        icon: <FiStar className="w-5 h-5 text-yellow-500" />,
        value: formatAverageRating(averageRating),
        label: 'Note moyenne'
      },
      {
        icon: <FiPackage className="w-5 h-5 text-green-500" />,
        value: products.length,
        label: 'Produits'
      },
      {
        icon: <FiUsers className="w-5 h-5 text-green-500" />,
        value: reviewCount,
        label: 'Avis'
      },
      {
        icon: <FiCalendar className="w-5 h-5 text-purple-500" />,
        value: new Date(transformer.createdAt).getFullYear(),
        label: 'Membre depuis'
      }
    ];
  },
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
    if (transformer.address || transformer.city) {
      contact.push({
        icon: <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />,
        text: `${transformer.address ? transformer.address + ', ' : ''}${transformer.city || ''}${transformer.region ? ', ' + transformer.region : ''}`
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
  getItemName: (product) => toPlainText(product.name, 'Produit sans nom'),
  getItemDescription: (product) => toPlainText(product.description, 'Aucune description'),
  getItemPrice: (product) => product.price,
  getItemImage: (product) => product.images?.[0]?.url,
  getItemExtraInfo: (product) => `${product.inventory?.quantity || 0} en stock`,
  getItemButtonText: 'Ajouter au panier',
  getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-green-600 hover:bg-green-700',
  getEmptyStateIcon: <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucun produit disponible',
  getEmptyStateDescription: 'Ce transformateur n\'a pas encore de produits en vente.',
  tabs: ['products', 'reviews', 'hours'],
  getTabLabel: (tab) => {
    const labels = {
      'products': 'Produits',
      'reviews': 'Avis',
      'hours': 'Horaires'
    };
    return labels[tab] || tab;
  },
  getTabCount: (tab, items, reviews = []) => {
    if (tab === 'products') return items.length;
    if (tab === 'reviews') return reviews.length;
    return 0;
  },
  getTabContent: (tab, items, vendor, helpers, reviews = []) => {
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
          {vendor.openingHours ? (
            <div className="space-y-3">
              {Object.entries(vendor.openingHours).map(([day, hours]) => (
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

// Configuration pour les transporteurs (livraison locale)
export const exporterConfig = {
  vendorType: 'exporter',
  getVendorName: (exporter) => exporter.companyName || `${exporter.firstName} ${exporter.lastName}`,
  getVendorSubtitle: (exporter) => {
    const markets = exporter.targetMarkets?.map(m => m.country).filter(Boolean) || [];
    return markets.length > 0 ? `Export vers ${markets.slice(0, 3).join(', ')}` : 'Exportateur';
  },
  getVendorStats: (exporter, _items, reviews = []) => {
    const averageRating = getVendorAverageRating(exporter, reviews);

    return [
      {
        icon: <FiStar className="w-5 h-5 text-yellow-500" />,
        value: formatAverageRating(averageRating),
        label: 'Note moyenne'
      },
      {
        icon: <FiGlobe className="w-5 h-5 text-blue-500" />,
        value: exporter.targetMarkets?.length || 0,
        label: 'Marchés cibles'
      },
      {
        icon: <FiTruck className="w-5 h-5 text-green-500" />,
        value: exporter.fleet?.length || 0,
        label: 'Flotte'
      },
      {
        icon: <FiCheckCircle className="w-5 h-5 text-purple-500" />,
        value: exporter.exportLicenses?.length || 0,
        label: 'Licences'
      }
    ];
  },
  getVendorContact: (exporter) => {
    const contact = [];
    if (exporter.phone) {
      contact.push({
        icon: <FiPhone className="h-5 w-5 text-gray-400 mr-3" />,
        text: exporter.phone,
        href: `tel:${exporter.phone}`
      });
    }
    if (exporter.email) {
      contact.push({
        icon: <FiMail className="h-5 w-5 text-gray-400 mr-3" />,
        text: exporter.email,
        href: `mailto:${exporter.email}`
      });
    }
    return contact;
  },
  getVendorLocation: (exporter) => {
    const location = [];
    if (exporter.address) location.push(exporter.address);
    if (exporter.city) location.push(exporter.city);
    if (exporter.region) location.push(exporter.region);
    if (exporter.country) location.push(exporter.country);
    return location;
  },
  getVendorDescription: (exporter) => exporter.bio || exporter.description || '',
  getVendorTags: (exporter) => {
    const tags = [];
    
    if (exporter.targetMarkets && exporter.targetMarkets.length > 0) {
      tags.push({
        label: 'Marchés cibles',
        items: exporter.targetMarkets.map(m => m.country).filter(Boolean)
      });
    }

    if (exporter.exportProducts && exporter.exportProducts.length > 0) {
      const categories = exporter.exportProducts.map(p => p.category).filter(Boolean);
      tags.push({
        label: 'Produits d\'export',
        items: [...new Set(categories)]
      });
    }

    return tags;
  },
  formatPrice: (price) => price ? new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price) : 'Sur devis',
  getItemName: (vehicle) => {
    const types = {
      'container': 'Conteneur standard',
      'container-20ft': 'Conteneur 20 pieds',
      'container-40ft': 'Conteneur 40 pieds',
      'container-refrigerated': 'Conteneur frigorifique',
      'truck': 'Camion',
      'refrigerated-truck': 'Camion frigorifique',
      'trailer': 'Remorque',
      'vessel': 'Navire',
      'aircraft': 'Avion cargo'
    };
    return types[vehicle.vehicleType] || vehicle.vehicleType || 'Véhicule';
  },
  getItemDescription: (vehicle) => {
    const capacity = [];
    if (vehicle.capacity?.weight) {
      capacity.push(`${vehicle.capacity.weight.value} ${vehicle.capacity.weight.unit}`);
    }
    if (vehicle.capacity?.volume) {
      capacity.push(`${vehicle.capacity.volume.value} ${vehicle.capacity.volume.unit}`);
    }
    return capacity.length > 0 ? `Capacité: ${capacity.join(', ')}` : 'Véhicule d\'export';
  },
  getItemPrice: (vehicle) => null,
  getItemImage: (vehicle) => vehicle.image?.url || vehicle.image || null,
  getItemExtraInfo: (vehicle) => {
    const status = vehicle.isAvailable ? 'Disponible' : 'Indisponible';
    const condition = {
      'excellent': 'Excellent',
      'good': 'Bon',
      'fair': 'Moyen',
      'needs-maintenance': 'Entretien requis'
    }[vehicle.condition] || vehicle.condition;
    return `${status} - ${condition}`;
  },
  getItemButtonText: 'Voir détails',
  getItemButtonIcon: <FiTruck className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-blue-600 hover:bg-blue-700',
  getEmptyStateIcon: <FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucune flotte disponible',
  getEmptyStateDescription: 'Cet exportateur n\'a pas encore de véhicules ou conteneurs enregistrés.',
  tabs: ['fleet', 'markets', 'reviews'],
  getTabLabel: (tab) => {
    const labels = {
      'fleet': 'Flotte',
      'markets': 'Marchés',
      'reviews': 'Avis'
    };
    return labels[tab] || tab;
  },
  getTabCount: (tab, items, reviews = []) => {
    if (tab === 'fleet') return items.length;
    if (tab === 'markets') return 0;
    if (tab === 'reviews') return reviews.length;
    return 0;
  },
  getTabContent: (tab, items, vendor, helpers, reviews = []) => {
    if (tab === 'fleet') {
      return (
        <div>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((vehicle, idx) => (
                <div 
                  key={vehicle._id || vehicle.registrationNumber || idx} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {helpers.getItemImage(vehicle) && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img 
                        src={helpers.getItemImage(vehicle)} 
                        alt={helpers.getItemName(vehicle)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {helpers.getItemName(vehicle)}
                        </h3>
                        {vehicle.registrationNumber && (
                          <p className="text-sm text-gray-500">
                            {vehicle.registrationNumber}
                          </p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.isAvailable ? 'Disponible' : 'Indisponible'}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {helpers.getItemDescription(vehicle)}
                    </p>

                    {vehicle.specialFeatures && vehicle.specialFeatures.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Caractéristiques:</p>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.specialFeatures.map((feature, featureIdx) => {
                            const labels = {
                              'refrigerated': 'Frigorifique',
                              'insulated': 'Isolé',
                              'ventilated': 'Ventilé',
                              'covered': 'Couvert',
                              'gps-tracked': 'Suivi GPS',
                              'temperature-controlled': 'Température contrôlée'
                            };
                            return (
                              <span key={featureIdx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                {labels[feature] || feature}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {helpers.getItemExtraInfo(vehicle)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {helpers.getEmptyStateIcon}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {helpers.getEmptyStateTitle}
              </h3>
              <p className="text-gray-500">
                {helpers.getEmptyStateDescription}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (tab === 'markets') {
      return (
        <div>
          {vendor.targetMarkets && vendor.targetMarkets.length > 0 ? (
            <div className="space-y-4">
              {vendor.targetMarkets.map((market, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {market.country} {market.region && `- ${market.region}`}
                    </h3>
                    {market.experience && (
                      <span className="text-xs text-gray-500">
                        {market.experience === 'new' ? 'Nouveau' :
                         market.experience === '1-2-years' ? '1-2 ans' :
                         market.experience === '3-5-years' ? '3-5 ans' :
                         market.experience === '5+-years' ? '5+ ans' : market.experience}
                      </span>
                    )}
                  </div>
                  {market.marketType && (
                    <p className="text-sm text-gray-600 mb-2">
                      Type: {
                        market.marketType === 'wholesale' ? 'Gros' :
                        market.marketType === 'retail' ? 'Détail' :
                        market.marketType === 'industrial' ? 'Industriel' :
                        market.marketType === 'institutional' ? 'Institutionnel' : market.marketType
                      }
                    </p>
                  )}
                  {market.annualVolume && (
                    <p className="text-sm text-gray-600">
                      Volume annuel: {market.annualVolume.value} {market.annualVolume.unit}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiGlobe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun marché cible</h3>
              <p className="text-gray-500">Cet exportateur n'a pas encore renseigné ses marchés cibles.</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  }
};

export const transporterConfig = {
  vendorType: 'transporter',
  getVendorName: (transporter) => transporter.companyName || `${transporter.firstName} ${transporter.lastName}`,
  getVendorSubtitle: (transporter) => {
    const types = {
      'road': 'Transport routier',
      'rail': 'Transport ferroviaire',
      'air': 'Transport aérien',
      'sea': 'Transport maritime',
      'multimodal': 'Transport multimodal'
    };
    const transportTypes = transporter.transportType || [];
    return transportTypes.map(type => types[type] || type).join(', ') || 'Transporteur';
  },
  getVendorStats: (transporter, _items, reviews = []) => {
    const averageRating = getVendorAverageRating(transporter, reviews);

    return [
      {
        icon: <FiStar className="w-5 h-5 text-yellow-500" />,
        value: formatAverageRating(averageRating),
        label: 'Note moyenne'
      },
      {
        icon: <FiTruck className="w-5 h-5 text-blue-500" />,
        value: transporter.fleet?.length || 0,
        label: 'Véhicules'
      },
      {
        icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
        value: `${transporter.performanceStats?.onTimeDeliveryRate || 0}%`,
        label: 'Ponctualité'
      },
      {
        icon: <FiPackage className="w-5 h-5 text-purple-500" />,
        value: transporter.performanceStats?.totalDeliveries || 0,
        label: 'Livraisons'
      }
    ];
  },
  getVendorContact: (transporter) => {
    const contact = [];
    if (transporter.phone) {
      contact.push({
        icon: <FiPhone className="h-5 w-5 text-gray-400 mr-3" />,
        text: transporter.phone,
        href: `tel:${transporter.phone}`
      });
    }
    if (transporter.email) {
      contact.push({
        icon: <FiMail className="h-5 w-5 text-gray-400 mr-3" />,
        text: transporter.email,
        href: `mailto:${transporter.email}`
      });
    }
    if (transporter.address || transporter.city) {
      contact.push({
        icon: <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />,
        text: `${transporter.address ? transporter.address + ', ' : ''}${transporter.city || ''}${transporter.region ? ', ' + transporter.region : ''}`
      });
    }
    return contact;
  },
  getVendorTags: (transporter) => {
    const tags = [];
    
    if (transporter.serviceTypes && transporter.serviceTypes.length > 0) {
      const serviceLabels = {
        'local-delivery': 'Livraison locale',
        'regional-transport': 'Transport régional',
        'national-transport': 'Transport national',
        'international-shipping': 'Transport international',
        'cold-chain': 'Chaîne du froid',
        'express-delivery': 'Livraison express'
      };
      tags.push({
        label: 'Services',
        items: transporter.serviceTypes.map(type => serviceLabels[type] || type)
      });
    }

    if (transporter.serviceAreas && transporter.serviceAreas.length > 0) {
      tags.push({
        label: 'Zones de couverture',
        items: transporter.serviceAreas.map(area => area.region).filter((v, i, a) => a.indexOf(v) === i)
      });
    }

    return tags;
  },
  formatPrice: (price) => price ? new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price) : 'Sur devis',
  getItemName: (vehicle) => {
    const types = {
      'motorcycle': 'Moto',
      'van': 'Camionnette',
      'truck': 'Camion',
      'refrigerated-truck': 'Camion frigorifique',
      'trailer': 'Remorque',
      'container-truck': 'Camion conteneur'
    };
    return types[vehicle.vehicleType] || vehicle.vehicleType || 'Véhicule';
  },
  getItemDescription: (vehicle) => {
    const capacity = [];
    if (vehicle.capacity?.weight) {
      capacity.push(`${vehicle.capacity.weight.value} ${vehicle.capacity.weight.unit}`);
    }
    if (vehicle.capacity?.volume) {
      capacity.push(`${vehicle.capacity.volume.value} ${vehicle.capacity.volume.unit}`);
    }
    return capacity.length > 0 ? `Capacité: ${capacity.join(', ')}` : 'Véhicule de transport';
  },
  getItemPrice: (vehicle) => null,
  getItemImage: (vehicle) => null,
  getItemExtraInfo: (vehicle) => {
    const status = vehicle.isAvailable ? 'Disponible' : 'Indisponible';
    const condition = {
      'excellent': 'Excellent',
      'good': 'Bon',
      'fair': 'Moyen',
      'needs-maintenance': 'Entretien requis'
    }[vehicle.condition] || vehicle.condition;
    return `${status} - ${condition}`;
  },
  getItemButtonText: 'Réserver',
  getItemButtonIcon: <FiTruck className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-blue-600 hover:bg-blue-700',
  getEmptyStateIcon: <FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucun véhicule disponible',
  getEmptyStateDescription: 'Ce transporteur n\'a pas encore de véhicules enregistrés.',
  tabs: ['fleet', 'services', 'reviews', 'hours'],
  getTabLabel: (tab) => {
    const labels = {
      'fleet': 'Flotte',
      'services': 'Services',
      'reviews': 'Avis',
      'hours': 'Horaires'
    };
    return labels[tab] || tab;
  },
  getTabCount: (tab, items, reviews = []) => {
    if (tab === 'fleet') return items.length;
    if (tab === 'services') return 0;
    if (tab === 'reviews') return reviews.length;
    return 0;
  },
  getTabContent: (tab, items, vendor, helpers, reviews = []) => {
    if (tab === 'fleet') {
      return (
        <div>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((vehicle, idx) => (
                <div 
                  key={vehicle._id || vehicle.registrationNumber || idx} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {helpers.getItemName(vehicle)}
                        </h3>
                        {vehicle.registrationNumber && (
                          <p className="text-sm text-gray-500">
                            {vehicle.registrationNumber}
                          </p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.isAvailable ? 'Disponible' : 'Indisponible'}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {helpers.getItemDescription(vehicle)}
                    </p>

                    {vehicle.specialFeatures && vehicle.specialFeatures.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Caractéristiques:</p>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.specialFeatures.map((feature, featureIdx) => {
                            const labels = {
                              'refrigerated': 'Frigorifique',
                              'insulated': 'Isolé',
                              'ventilated': 'Ventilé',
                              'covered': 'Couvert',
                              'gps-tracked': 'Suivi GPS',
                              'temperature-controlled': 'Température contrôlée'
                            };
                            return (
                              <span 
                                key={featureIdx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {labels[feature] || feature}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">
                        État: <span className="font-medium">
                          {helpers.getItemExtraInfo(vehicle).split(' - ')[1]}
                        </span>
                      </span>
                    </div>

                    <button 
                      className={`w-full ${helpers.getItemButtonColor} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
                      onClick={() => {
                        alert('Fonctionnalité de réservation à venir');
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

    if (tab === 'services') {
      return (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendor.serviceAreas && vendor.serviceAreas.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2 text-blue-500" />
                  Zones de couverture
                </h3>
                <div className="space-y-3">
                  {vendor.serviceAreas.map((area, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <p className="font-medium text-gray-900">{area.region}</p>
                      {area.cities && area.cities.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Villes: {area.cities.join(', ')}
                        </p>
                      )}
                      {area.deliveryRadius && (
                        <p className="text-sm text-gray-500 mt-1">
                          Rayon: {area.deliveryRadius} km
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vendor.specialCapabilities && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacités spéciales</h3>
                <div className="space-y-2">
                  {vendor.specialCapabilities.coldChain?.available && (
                    <div className="flex items-center text-sm">
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Chaîne du froid</span>
                      {vendor.specialCapabilities.coldChain.temperatureRange && (
                        <span className="text-gray-500 ml-2">
                          ({vendor.specialCapabilities.coldChain.temperatureRange.min}°C - {vendor.specialCapabilities.coldChain.temperatureRange.max}°C)
                        </span>
                      )}
                    </div>
                  )}
                  {vendor.specialCapabilities.oversizedCargo && (
                    <div className="flex items-center text-sm">
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Fret volumineux</span>
                    </div>
                  )}
                  {vendor.specialCapabilities.crossBorder && (
                    <div className="flex items-center text-sm">
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Transport transfrontalier</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {vendor.pricingStructure && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarification</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Modèle:</span> {
                    {
                      'per-km': 'Par km',
                      'per-kg': 'Par kg',
                      'flat-rate': 'Tarif fixe',
                      'time-based': 'Par temps',
                      'custom': 'Sur devis'
                    }[vendor.pricingStructure.model] || vendor.pricingStructure.model
                  }</p>
                  {vendor.pricingStructure.baseRate > 0 && (
                    <p><span className="font-medium">Tarif de base:</span> {
                      new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF'
                      }).format(vendor.pricingStructure.baseRate)
                    }</p>
                  )}
                </div>
              </div>
            )}
          </div>
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
                    {hours.isAvailable && hours.start && hours.end 
                      ? `${hours.start} - ${hours.end}` 
                      : 'Fermé'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Horaires non renseignés</h3>
              <p className="text-gray-500">Les horaires d'opération ne sont pas encore disponibles.</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  }
};
