import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { producerService } from '../services';
import { 
  FiMapPin, 
  FiStar, 
  FiPackage, 
  FiUsers, 
  FiCalendar, 
  FiAward,
  FiArrowLeft,
  FiShoppingCart,
  FiHeart,
  FiShare2
} from 'react-icons/fi';

const ProducerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [producer, setProducer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    const loadProducerData = async () => {
      try {
        setLoading(true);
        let producerResponse = null;
        let productsResponse = null;

        // Charger les informations du producteur
        try {
          producerResponse = await producerService.getPublicProducer(id);
          if (producerResponse.data.status === 'success') {
            setProducer(producerResponse.data.data.producer);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du producteur:', error);
        }

        // Charger les produits selon les permissions
        let loadedProducts = [];
        
        // Si l'utilisateur est le propriétaire ou admin, charger tous les produits (privé)
        if (user && (user._id === id || user.role === 'admin')) {
          try {
            console.log('🔐 Chargement des produits privés pour le propriétaire/admin');
            productsResponse = await producerService.getProducts();
            if (productsResponse.data.status === 'success') {
              loadedProducts = productsResponse.data.data.products || [];
              console.log('✅ Produits privés chargés:', loadedProducts.length);
            }
          } catch (privateError) {
            console.error('❌ Erreur lors du chargement privé des produits:', privateError);
            // En cas d'erreur, essayer la route publique comme fallback
            try {
              productsResponse = await producerService.getPublicProducerProducts(id);
              if (productsResponse.data.status === 'success') {
                loadedProducts = productsResponse.data.data.products || [];
                console.log('✅ Fallback: Produits publics chargés:', loadedProducts.length);
              }
            } catch (publicError) {
              console.warn('Erreur lors du chargement public des produits:', publicError);
            }
          }
        } else {
          // Pour les utilisateurs non connectés ou autres, charger seulement les produits publics
          try {
            console.log('🌐 Chargement des produits publics');
            productsResponse = await producerService.getPublicProducerProducts(id);
            if (productsResponse.data.status === 'success') {
              loadedProducts = productsResponse.data.data.products || [];
              console.log('✅ Produits publics chargés:', loadedProducts.length);
            }
          } catch (publicError) {
            console.warn('Erreur lors du chargement public des produits:', publicError);
          }
        }

        // Mettre à jour l'état avec les produits chargés
        setProducts(loadedProducts);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProducerData();
    }
  }, [id, user]);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Fonction pour déterminer si un produit peut être vu
  const canViewProduct = (product) => {
    if (!user) {
      return product.status === 'approved';
    }
    if (user.role === 'admin' || user._id === id) {
      return true; // Admin et propriétaire peuvent voir tous les produits
    }
    return product.status === 'approved';
  };

  // Fonction pour obtenir le statut du produit
  const getProductStatus = (status) => {
    const statusMap = {
      'approved': 'Approuvé',
      'pending-review': 'En attente',
      'draft': 'Brouillon',
      'rejected': 'Rejeté',
      'inactive': 'Inactif'
    };
    return statusMap[status] || status;
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colorMap = {
      'approved': 'bg-green-100 text-green-800',
      'pending-review': 'bg-yellow-100 text-yellow-800',
      'draft': 'bg-gray-100 text-gray-800',
      'rejected': 'bg-red-100 text-red-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getCountryName = (code) => {
    const countries = {
      'CM': 'Cameroun',
      'SN': 'Sénégal',
      'CI': 'Côte d\'Ivoire',
      'GH': 'Ghana',
      'NG': 'Nigeria',
      'KE': 'Kenya'
    };
    return countries[code] || code;
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du producteur...</p>
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producteur non trouvé</h1>
          <p className="text-gray-600 mb-6">Ce producteur n'existe pas ou n'est plus actif.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
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
            {producer.shopBanner ? (
              <img 
                src={producer.shopBanner} 
                alt="Bannière de la boutique"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                <FiPackage className="w-16 h-16 text-white opacity-50" />
              </div>
            )}
            
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            {/* Photo de profil en coin inférieur gauche */}
            <div className="absolute bottom-5 left-5 transform -translate-x-2 translate-y-2">
              <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                  {producer.avatar ? (
                    <img 
                      src={producer.avatar} 
                      alt={`${producer.firstName} ${producer.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-green-600">
                        {producer.firstName?.[0]}{producer.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations en bas */}
          <div className="p-6 pt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {producer.farmName || `${producer.firstName} ${producer.lastName}`}
            </h1>
            <p className="text-gray-600 mb-2">
              {producer.firstName} {producer.lastName}
            </p>
            <div className="flex items-center text-gray-500 mb-6">
              <FiMapPin className="mr-1" />
              <span>{getCountryName(producer.country)}</span>
              {producer.address?.city && (
                <span className="ml-2">• {producer.address.city}</span>
              )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FiStar className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {producer.salesStats?.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FiPackage className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {products.filter(canViewProduct).length}
                </div>
                <div className="text-sm text-gray-600">Produits</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FiUsers className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {producer.salesStats?.totalReviews || 0}
                </div>
                <div className="text-sm text-gray-600">Avis</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FiCalendar className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Date(producer.createdAt).getFullYear()}
                </div>
                <div className="text-sm text-gray-600">Membre depuis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Produits ({products.filter(canViewProduct).length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                {products.filter(canViewProduct).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.filter(canViewProduct).map((product) => (
                      <div 
                        key={product._id} 
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        {/* Image du produit */}
                        <div className="h-48 bg-gray-200 relative">
                          {product.images?.[0]?.url ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name?.fr || product.name?.en || 'Produit'}
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
                            <h3 className="font-semibold text-gray-900">
                              {product.name?.fr || product.name?.en || 'Produit sans nom'}
                            </h3>
                            {product.status !== 'approved' && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                {getProductStatus(product.status)}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description?.fr || product.description?.en || 'Aucune description'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {product.inventory?.quantity || 0} en stock
                            </span>
                          </div>
                          <button 
                            className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation(); // Empêcher la navigation vers les détails
                              addToCart(product);
                              console.log('Produit ajouté au panier:', product.name?.fr || product.name);
                            }}
                          >
                            <FiShoppingCart className="w-4 h-4 mr-2" />
                            Ajouter au panier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit disponible</h3>
                    <p className="text-gray-500">Ce producteur n'a pas encore de produits en vente.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerProfile;
