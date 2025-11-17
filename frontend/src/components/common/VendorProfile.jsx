import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { 
  FiMapPin, 
  FiStar, 
  FiPackage, 
  FiUsers, 
  FiCalendar, 
  FiArrowLeft,
  FiShoppingCart,
  FiClock,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { reviewService } from '../../services';
import { getCountryName } from '../../utils/countryMapper';

const VendorProfile = ({ 
  vendorType, 
  service, 
  getVendorName, 
  getVendorSubtitle,
  getVendorStats,
  getVendorContact,
  getVendorTags,
  formatPrice,
  getItemName,
  getItemDescription,
  getItemPrice,
  getItemImage,
  getItemExtraInfo,
  getItemButtonText,
  getItemButtonIcon,
  getItemButtonColor,
  getEmptyStateIcon,
  getEmptyStateTitle,
  getEmptyStateDescription,
  tabs = ['items'],
  getTabContent,
  getTabLabel,
  getTabCount
}) => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true);
        let vendorResponse = null;
        let itemsResponse = null;

        // Charger les informations du vendeur
        try {
          vendorResponse = await service.getPublic(id);
          
          if (vendorResponse.data.status === 'success') {
            const vendorData = vendorResponse.data.data[vendorType] || vendorResponse.data[vendorType];
            console.log(`[VendorProfile] ${vendorType} - Full vendor data:`, vendorData);
            console.log(`[VendorProfile] ${vendorType} - companyName:`, vendorData?.companyName);
            console.log(`[VendorProfile] ${vendorType} - shopBanner:`, vendorData?.shopBanner);
            console.log(`[VendorProfile] ${vendorType} - shopLogo:`, vendorData?.shopLogo);
            console.log(`[VendorProfile] ${vendorType} - avatar:`, vendorData?.avatar);
            setVendor(vendorData);
            
            // Pour les transporteurs et exportateurs, charger la flotte depuis les données du vendeur
            if (vendorType === 'transporter' || vendorType === 'exporter') {
              // Vérifier que fleet existe et est un tableau
              const fleetData = vendorData?.fleet;
              console.log(`[VendorProfile] ${vendorType} - fleet data:`, fleetData);
              if (Array.isArray(fleetData) && fleetData.length > 0) {
                console.log(`[VendorProfile] ${vendorType} - Setting ${fleetData.length} fleet items`);
                setItems(fleetData);
              } else {
                // Initialiser avec un tableau vide si pas de flotte
                console.log(`[VendorProfile] ${vendorType} - No fleet data, initializing empty array`);
                setItems([]);
              }
            }
          }
        } catch (error) {
          console.error(`Erreur lors du chargement du ${vendorType}:`, error);
        }

        // Charger les items (produits/plats pour producteurs/transformateurs/restaurateurs)
        try {
          if (vendorType === 'transporter' || vendorType === 'exporter') {
            // La flotte est déjà chargée depuis vendor.fleet ci-dessus
            // Pas besoin de charger depuis une autre API
          } else {
            itemsResponse = await service.getPublicProducts(id);
            
            if (itemsResponse.data.status === 'success') {
              const rawItems = itemsResponse.data.data.products || itemsResponse.data.data.dishes || [];
              const itemsWithRatings = await Promise.all(
                rawItems.map(async (item) => {
                  if (!item?._id) {
                    return item;
                  }

                  // Pour les restaurateurs, s'assurer que le champ restaurateur est rempli
                  // Note: vendor peut ne pas être encore chargé, donc on utilise vendorData si disponible
                  const currentVendor = vendor || (vendorResponse?.data?.data?.[vendorType] || vendorResponse?.data?.[vendorType]);
                  if (vendorType === 'restaurateur' && currentVendor && !item.restaurateur) {
                    item.restaurateur = {
                      _id: currentVendor._id,
                      id: currentVendor._id,
                      restaurantName: currentVendor.restaurantName || currentVendor.name,
                      name: currentVendor.restaurantName || currentVendor.name
                    };
                    item.restaurateurId = currentVendor._id;
                    item.restaurantName = currentVendor.restaurantName || currentVendor.name;
                  }

                  try {
                    const statsResponse = await reviewService.getProductRatingStats(item._id);
                    const statsData = statsResponse?.data;
                    if (statsData) {
                      return {
                        ...item,
                        ratingStats: {
                          averageRating: statsData.averageRating || 0,
                          totalReviews: statsData.totalReviews || 0
                        }
                      };
                    }
                  } catch (statsError) {
                    console.error(`Erreur lors du chargement des statistiques d'avis du produit ${item._id}:`, statsError);
                  }

                  return {
                    ...item,
                    ratingStats: {
                      averageRating: 0,
                      totalReviews: 0
                    }
                  };
                })
              );

              setItems(itemsWithRatings);
            }
          }
        } catch (error) {
          console.error(`Erreur lors du chargement des items:`, error);
        }

        // Charger les avis
        try {
          // Essayer d'appeler getReviews directement (gérer l'erreur si elle n'existe pas)
          if (service && service.getReviews) {
            try {
              const reviewsResponse = await service.getReviews(id);
              
              if (reviewsResponse?.data?.status === 'success') {
                setReviews(reviewsResponse.data.data?.reviews || reviewsResponse.data.data || []);
              }
            } catch (reviewError) {
              // Si l'erreur est 404 ou que la route n'existe pas, c'est normal
              if (reviewError.response?.status === 404) {
                console.log(`Route reviews non disponible pour ${vendorType}`);
                setReviews([]);
              } else {
                console.error(`Erreur lors du chargement des avis:`, reviewError);
                setReviews([]);
              }
            }
          } else {
            console.log(`Méthode getReviews non disponible pour ${vendorType}, avis non chargés`);
            setReviews([]);
          }
        } catch (error) {
          console.error(`Erreur lors du chargement des avis:`, error);
          // Ne pas bloquer l'affichage si les avis ne peuvent pas être chargés
          setReviews([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadVendorData();
    }
  }, [id, user, service, vendorType]);

  useEffect(() => {
    const shouldFetchStats = ['producer', 'transformer'].includes(vendorType);
    if (!shouldFetchStats || !vendor?._id) {
      return;
    }

    let isActive = true;

    const loadVendorRatingStats = async () => {
      try {
        const statsResponse = await reviewService.getProducerRatingStats(vendor._id);
        const statsData = statsResponse?.data;

        if (!isActive || !statsData) {
          return;
        }

        setVendor((prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            ratings: {
              ...(prev.ratings || {}),
              average: statsData.averageRating || 0,
              count: statsData.totalReviews || 0
            },
            stats: {
              ...(prev.stats || {}),
              averageRating: statsData.averageRating || 0,
              totalReviews: statsData.totalReviews || 0
            },
            reviewStats: statsData
          };
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques d\'avis du vendeur:', error);
      }
    };

    loadVendorRatingStats();

    return () => {
      isActive = false;
    };
  }, [vendor?._id, vendorType]);


  if (loading) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du {vendorType}...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{vendorType} non trouvé</h1>
          <p className="text-gray-600 mb-6">Ce {vendorType} n'existe pas ou n'est plus actif.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const stats = getVendorStats(vendor, items, reviews);
  const contact = getVendorContact(vendor);
  const tags = getVendorTags(vendor);

  return (
    <div className="min-h-screen bg-harvests-light">
      {/* Header avec bouton retour */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Retour
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 pb-8">
        {/* En-tête avec bannière et photo de profil */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            {/* Bannière en arrière-plan */}
          <div className="relative sm:h-[300px] h-[200px] md:h-[375px] bg-gradient-to-r from-green-400 to-green-600">
            {/* Extraction de l'URL de la bannière (peut être string ou objet) */}
            {(() => {
              let bannerUrl = null;
              if (vendor.restaurantBanner) {
                bannerUrl = typeof vendor.restaurantBanner === 'string' ? vendor.restaurantBanner : vendor.restaurantBanner.url;
              } else if (vendor.shopBanner) {
                bannerUrl = typeof vendor.shopBanner === 'string' ? vendor.shopBanner : vendor.shopBanner.url;
              } else if (vendor.shopLogo) {
                bannerUrl = typeof vendor.shopLogo === 'string' ? vendor.shopLogo : vendor.shopLogo.url;
              }
              return bannerUrl ? (
                <img 
                  src={bannerUrl} 
                  alt={`Bannière de ${getVendorName(vendor)}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <FiPackage className="w-16 h-16 text-white opacity-50" />
                </div>
              );
            })()}
            
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            {/* Photo de profil en coin inférieur gauche */}
            <div className="absolute bottom-5 left-5 transform -translate-x-2 translate-y-2">
              <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                  {(() => {
                    let logoUrl = null;
                    if (vendor.logo) {
                      logoUrl = typeof vendor.logo === 'string' ? vendor.logo : vendor.logo.url;
                    } else if (vendor.shopLogo) {
                      logoUrl = typeof vendor.shopLogo === 'string' ? vendor.shopLogo : vendor.shopLogo.url;
                    }
                    return logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={getVendorName(vendor)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">
                          {getVendorName(vendor)?.[0] || vendor.firstName?.[0] || 'U'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Informations en bas */}
          <div className="p-6 pt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getVendorName(vendor)}
            </h1>
            <p className="text-gray-600 mb-2">
              {getVendorSubtitle(vendor)}
            </p>
            <div className="flex items-center text-gray-500 mb-6">
              <FiMapPin className="mr-1" />
              <span>{getCountryName(vendor.country)}</span>
              {vendor.city && (
                <span className="ml-2">• {vendor.city}</span>
              )}
              {vendor.region && (
                <span className="ml-2">• {vendor.region}</span>
              )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-harvests-light rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Informations de contact */}
            {contact.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {item.icon}
                    {item.href ? (
                      <a href={item.href} className="text-sm text-gray-900 hover:text-green-600">
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-900">{item.text}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{tags[0].label}</h3>
                <div className="flex flex-wrap gap-2">
                  {tags[0].items.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {getTabLabel(tab)} ({getTabCount(tab, items, reviews)})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {getTabContent(activeTab, items, vendor, {
              formatPrice,
              getItemName,
              getItemDescription,
              getItemPrice,
              getItemImage,
              getItemExtraInfo,
              getItemButtonText,
              getItemButtonIcon,
              getItemButtonColor,
              getEmptyStateIcon,
              getEmptyStateTitle,
              getEmptyStateDescription,
              addToCart,
              navigate
            }, reviews)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
