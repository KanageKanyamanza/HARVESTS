import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../contexts/NotificationContext';
import { productService, producerService } from '../services';
import CloudinaryImage from '../components/common/CloudinaryImage';
import { 
  FiArrowLeft, 
  FiStar, 
  FiPackage, 
  FiDollarSign, 
  FiTruck, 
  FiMapPin, 
  FiCalendar,
  FiHeart,
  FiShare2,
  FiShoppingCart,
  FiUser,
  FiAward,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiMinus
} from 'react-icons/fi';

// Fonction utilitaire pour convertir le code pays en nom complet
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

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showSuccess } = useNotifications();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [producer, setProducer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showAddedToCart, setShowAddedToCart] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        let productResponse = null;

        // Essayer d'abord la route publique (pour les produits approuvés)
        try {
          productResponse = await productService.getProduct(id);
        } catch (publicError) {
          // Si l'utilisateur est connecté et que c'est un producteur/admin,
          // essayer la route privée pour ses propres produits
          if (user && (user.userType === 'producer' || user.userType === 'admin')) {
            try {
              productResponse = await producerService.getProduct(id);
            } catch (privateError) {
              // Si c'est un admin, essayer une route admin (à implémenter)
              if (user.userType === 'admin') {
                // TODO: Implémenter une route admin pour voir tous les produits
                console.warn('Route admin non implémentée');
              }
              console.warn('Erreur lors du chargement privé:', privateError);
              throw publicError; // Utiliser l'erreur publique comme fallback
            }
          } else {
            throw publicError;
          }
        }

        if (productResponse && productResponse.data.status === 'success') {
          const productData = productResponse.data.data.product;
          setProduct(productData);
          
          // Les avis sont déjà inclus dans la réponse du produit
          if (productData.reviews) {
            setReviews(productData.reviews);
          }
          
          // Les informations du producteur sont déjà incluses dans la réponse du produit
          if (productData.producer) {
            console.log('🔍 Données du producteur:', productData.producer);
            setProducer(productData.producer);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProductData();
    }
  }, [id, user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'cereals': 'Céréales',
      'vegetables': 'Légumes',
      'fruits': 'Fruits',
      'legumes': 'Légumineuses',
      'tubers': 'Tubercules',
      'spices': 'Épices',
      'herbs': 'Herbes',
      'grains': 'Grains',
      'nuts': 'Noix',
      'seeds': 'Graines',
      'dairy': 'Produits laitiers',
      'meat': 'Viande',
      'poultry': 'Volaille',
      'fish': 'Poisson',
      'processed-foods': 'Aliments transformés',
      'beverages': 'Boissons',
      'other': 'Autres'
    };
    return categories[category] || category;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'approved': { color: 'bg-green-100 text-green-800', text: 'Disponible', icon: FiCheckCircle },
      'pending-review': { color: 'bg-yellow-100 text-yellow-800', text: 'En cours de révision', icon: FiClock },
      'draft': { color: 'bg-blue-100 text-blue-800', text: 'Brouillon', icon: FiPackage },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Rejeté', icon: FiXCircle },
      'inactive': { color: 'bg-gray-100 text-gray-800', text: 'Indisponible', icon: FiXCircle }
    };
    return configs[status] || configs['draft'];
  };

  // Vérifier si l'utilisateur peut voir ce produit
  const canViewProduct = () => {
    if (!product) return false;
    
    // Si le produit est approuvé, tout le monde peut le voir
    if (product.status === 'approved') return true;
    
    // Si l'utilisateur est connecté
    if (user) {
      // Si c'est un admin, il peut voir tous les produits
      if (user.userType === 'admin') return true;
      
      // Si c'est le producteur du produit, il peut voir son produit
      if (user.userType === 'producer' && product.producer) {
        const producerId = product.producer._id || product.producer;
        return producerId === user._id || producerId === user.id;
      }
    }
    
    return false;
  };

  const handleAddToCart = () => {
    if (product) {
      // Créer un objet produit avec la quantité sélectionnée
      const productWithQuantity = {
        ...product,
        quantity: quantity
      };
      addToCart(productWithQuantity);
      console.log('Produit ajouté au panier:', product.name?.fr || product.name, 'Quantité:', quantity);
      
      // Afficher la notification de succès
      showSuccess(
        `${quantity} ${quantity > 1 ? 'articles' : 'article'} ajouté${quantity > 1 ? 's' : ''} au panier`,
        'Produit ajouté'
      );
      
      // Afficher le message de confirmation visuel
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 3000);
    }
  };

  const handleToggleFavorite = () => {
    // TODO: Implémenter l'ajout/suppression des favoris
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name?.fr || product?.name?.en || product?.name,
        text: product?.description?.fr || product?.description?.en || product?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Afficher une notification de copie
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou n'est plus disponible</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur peut voir ce produit
  if (!canViewProduct()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">
            Ce produit n'est pas encore approuvé ou vous n'avez pas l'autorisation de le voir.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Retour aux produits
            </button>
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const productName = product.name?.fr || product.name?.en || product.name;
  const productDescription = product.description?.fr || product.description?.en || product.description;
  const statusConfig = getStatusConfig(product.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images du produit */}
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-white shadow-lg max-w-[400px] mx-auto">
                {product.images && product.images.length > 0 ? (
                  <CloudinaryImage
                    src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
                    alt={productName}
                    className="w-full h-[400px] max-w-[400px] mx-auto object-cover"
                    width={400}
                    height={400}
                    quality="auto"
                    crop="fit"
                  />
                ) : (
                  <div className="w-full h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
                    <FiPackage className="h-24 w-24 text-gray-400 mb-4" />
                    <span className="text-lg font-medium">Aucune image</span>
                  </div>
                )}
              </div>

              {/* Miniatures des images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index 
                          ? 'border-harvests-green' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CloudinaryImage
                        src={image.url}
                        alt={`${productName} ${index + 1}`}
                        className="w-full h-20 object-cover"
                        width={100}
                        height={80}
                        quality="auto"
                        crop="fit"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations du produit */}
            <div className="space-y-6 relative">
              {/* En-tête */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getCategoryLabel(product.category)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.text}
                    </span>
                    {product.status !== 'approved' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <FiShield className="w-3 h-3 mr-1" />
                        Non public
                      </span>
                    )}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{productName}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FiStar className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">Note</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPackage className="h-4 w-4 mr-1" />
                    {product.inventory?.quantity || 0} En stock
                  </div>
                </div>
              </div>

              {/* Prix */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-gray-600">par kg</span>
              </div>

              {/* Description courte */}
              <p className="text-gray-600 leading-relaxed">
                {productDescription}
              </p>

              {/* Quantité et actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Quantité</label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100"
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-harvests-green text-white px-6 py-3 rounded-md hover:bg-green-600 flex items-center justify-center font-medium"
                  >
                    <FiShoppingCart className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Ajouter au panier</span>
                  </button>
                  
                  {/* Message de confirmation */}
                  {showAddedToCart && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                      <FiShoppingCart className="h-4 w-4 mr-2" />
                      {quantity} article{quantity > 1 ? 's' : ''} ajouté{quantity > 1 ? 's' : ''} au panier !
                    </div>
                  )}
                  
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-md border ${
                      isFavorite 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <FiShare2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Informations du producteur */}
              {producer && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-harvests-green rounded-full flex items-center justify-center">
                      <FiUser className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {producer.businessName || producer.firstName + ' ' + producer.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FiMapPin className="h-4 w-4 mr-1" />
                        {producer.address?.city}, {getCountryName(producer.country)}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/producers/${producer._id}`)}
                      className="text-harvests-green hover:text-green-600 text-sm font-medium"
                    >
                      Visiter la boutique
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Onglets de détails */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'border-harvests-green text-harvests-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'specifications'
                      ? 'border-harvests-green text-harvests-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Spécifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-harvests-green text-harvests-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Avis ({reviews.length})
                </button>
              </nav>
            </div>

            <div className="py-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {productDescription}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Informations générales</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Catégorie</dt>
                        <dd className="font-medium">{getCategoryLabel(product.category)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Prix</dt>
                        <dd className="font-medium">{formatPrice(product.price)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Stock disponible</dt>
                        <dd className="font-medium">{product.inventory?.quantity || 0} unités</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Statut</dt>
                        <dd className="font-medium">{statusConfig.text}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Informations producteur</h3>
                    {producer && (
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Nom</dt>
                          <dd className="font-medium">
                            {producer.businessName || producer.firstName + ' ' + producer.lastName}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Localisation</dt>
                          <dd className="font-medium">
                            {producer.address?.city}, {getCountryName(producer.country)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Membre depuis</dt>
                          <dd className="font-medium">
                            {new Date(producer.createdAt).toLocaleDateString('fr-FR')}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <FiUser className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {review.user?.firstName} {review.user?.lastName}
                              </p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiStar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun avis</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Soyez le premier à laisser un avis
                      </p>
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

export default ProductDetail;
