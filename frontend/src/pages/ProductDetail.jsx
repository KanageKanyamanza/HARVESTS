import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../contexts/NotificationContext';
import { productService, producerService, reviewService } from '../services';
import CloudinaryImage from '../components/common/CloudinaryImage';
import ReviewList from '../components/reviews/ReviewList';
import SimpleReviewForm from '../components/reviews/SimpleReviewForm';
import StarRating from '../components/reviews/StarRating';
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
  FiMinus,
  FiInfo,
  FiEye,
  FiX
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
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [producer, setProducer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fonction pour charger les avis
  const loadReviews = async () => {
    if (!product?._id) return;
    
    try {
      setReviewsLoading(true);
      const [reviewsResponse, statsResponse] = await Promise.all([
        reviewService.getProductReviews(product._id),
        reviewService.getProductRatingStats(product._id)
      ]);
      
      setReviews(reviewsResponse.data.reviews || []);
      setReviewStats(statsResponse.data || null);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

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

  // Charger les avis quand le produit est chargé
  useEffect(() => {
    if (product?._id) {
      loadReviews();
    }
  }, [product?._id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Fonctions pour gérer les votes sur les avis
  const handleVoteHelpful = async (reviewId) => {
    try {
      await reviewService.voteHelpful(reviewId);
      // Recharger les avis pour mettre à jour les votes
      loadReviews();
    } catch (error) {
      console.error('Erreur lors du vote utile:', error);
    }
  };

  const handleVoteUnhelpful = async (reviewId) => {
    try {
      await reviewService.voteUnhelpful(reviewId);
      // Recharger les avis pour mettre à jour les votes
      loadReviews();
    } catch (error) {
      console.error('Erreur lors du vote inutile:', error);
    }
  };

  // Vérifier si l'utilisateur peut laisser un avis
  const canLeaveReview = () => {
    if (!user || user.userType !== 'consumer') return false;
    // Ici, vous pourriez vérifier si l'utilisateur a acheté ce produit
    // Pour l'instant, on permet à tous les consommateurs connectés de laisser un avis
    return true;
  };

  // Gérer la soumission d'un avis
  const handleSubmitReview = async (reviewData) => {
    try {
      console.log('📝 Données de l\'avis à envoyer:', {
        ...reviewData,
        productId: product._id,
        producer: producer._id
      });
      
      const response = await reviewService.createReview({
        ...reviewData,
        productId: product._id,
        producer: producer._id
      });
      
      console.log('✅ Avis créé avec succès:', response);
      showSuccess('Votre avis a été publié avec succès !');
      setShowReviewForm(false);
      loadReviews(); // Recharger les avis
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'avis:', error);
      console.error('📋 Détails de l\'erreur:', error.response?.data);
      
      // Afficher un message d'erreur plus spécifique
      let errorMessage = 'Erreur lors de la publication de l\'avis';
      
      console.log('🔍 Structure de l\'erreur:', {
        response: error.response,
        data: error.response?.data,
        message: error.response?.data?.message,
        errorMessage: error.message
      });
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Messages d'erreur plus clairs
      if (errorMessage.includes('Vous devez avoir acheté ce produit')) {
        errorMessage = 'Vous devez avoir acheté ce produit pour laisser un avis';
      } else if (errorMessage.includes('pas encore complétée')) {
        errorMessage = 'Votre commande n\'est pas encore complétée. Vous pourrez laisser un avis une fois la commande livrée.';
      } else if (errorMessage.includes('déjà laissé un avis')) {
        errorMessage = 'Vous avez déjà laissé un avis pour cette commande';
      }
      
      showError(errorMessage);
    }
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
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
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
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
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
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
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
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
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
    <div className="min-h-screen bg-harvests-light">
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
                  <div className="flex items-center space-x-2">
                    <StarRating 
                      rating={reviewStats?.averageRating || 0} 
                      size="md" 
                      showText={true}
                    />
                    {reviewStats?.totalReviews > 0 && (
                      <span className="text-sm text-gray-600">
                        ({reviewStats.totalReviews} avis)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPackage className="h-4 w-4 mr-1" />
                    {product.inventory?.quantity || 0} En stock
                  </div>
                  {product.stats && (
                    <>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiEye className="h-4 w-4 mr-1" />
                        {product.stats.views || 0} vues
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiHeart className="h-4 w-4 mr-1" />
                        {product.stats.favorites || 0} favoris
                      </div>
                    </>
                  )}
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
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-harvests-light'
                    }`}
                  >
                    <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-md border border-gray-300 text-gray-600 hover:bg-harvests-light"
                  >
                    <FiShare2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Informations du producteur */}
              {producer && (
                <div className="bg-harvests-light rounded-lg p-4">
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
                <div className="space-y-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Informations générales */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiPackage className="h-5 w-5 mr-2" />
                      Informations générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        {product.category && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Catégorie</dt>
                            <dd className="font-medium">{getCategoryLabel(product.category)}</dd>
                          </div>
                        )}
                        {product.subcategory && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Sous-catégorie</dt>
                            <dd className="font-medium">{product.subcategory}</dd>
                          </div>
                        )}
                        {product.price && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Prix</dt>
                            <dd className="font-medium">{formatPrice(product.price)}</dd>
                          </div>
                        )}
                        {product.compareAtPrice && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Prix de comparaison</dt>
                            <dd className="font-medium text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</dd>
                          </div>
                        )}
                        {product.inventory?.quantity !== undefined && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Stock disponible</dt>
                            <dd className="font-medium">{product.inventory.quantity} unités</dd>
                          </div>
                        )}
                        {product.minimumOrderQuantity && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Quantité minimum</dt>
                            <dd className="font-medium">{product.minimumOrderQuantity} unité(s)</dd>
                          </div>
                        )}
                        {product.maximumOrderQuantity && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Quantité maximum</dt>
                            <dd className="font-medium">{product.maximumOrderQuantity} unité(s)</dd>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {product.tags && product.tags.length > 0 && (
                          <div>
                            <dt className="text-gray-600 mb-2 block">Tags</dt>
                            <dd className="flex flex-wrap gap-2">
                              {product.tags.map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {tag}
                                </span>
                              ))}
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variantes du produit */}
                  {product.hasVariants && product.variants && product.variants.length > 0 && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiPackage className="h-5 w-5 mr-2" />
                        Variantes disponibles
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.variants.map((variant, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">{variant.name}</h4>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Prix</span>
                                <span className="font-medium">{formatPrice(variant.price)}</span>
                              </div>
                              {variant.compareAtPrice && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Prix de comparaison</span>
                                  <span className="font-medium text-gray-500 line-through">
                                    {formatPrice(variant.compareAtPrice)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Stock</span>
                                <span className="font-medium">{variant.inventory?.quantity || 0} unités</span>
                              </div>
                              {variant.sku && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">SKU</span>
                                  <span className="font-medium text-sm">{variant.sku}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informations agricoles */}
                  {product.agricultureInfo && Object.keys(product.agricultureInfo).some(key => {
                    const value = product.agricultureInfo[key];
                    return value !== null && value !== undefined && value !== '' && 
                           (Array.isArray(value) ? value.length > 0 : true);
                  }) && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiInfo className="h-5 w-5 mr-2" />
                        Informations agricoles
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-3">
                          {product.agricultureInfo.farmingMethod && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Méthode de culture</dt>
                              <dd className="font-medium capitalize">{product.agricultureInfo.farmingMethod}</dd>
                            </div>
                          )}
                          {product.agricultureInfo.region && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Région de production</dt>
                              <dd className="font-medium">{product.agricultureInfo.region}</dd>
                            </div>
                          )}
                          {product.agricultureInfo.harvestDate && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Date de récolte</dt>
                              <dd className="font-medium">
                                {new Date(product.agricultureInfo.harvestDate).toLocaleDateString('fr-FR')}
                              </dd>
                            </div>
                          )}
                          {product.agricultureInfo.expiryDate && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Date d'expiration</dt>
                              <dd className="font-medium">
                                {new Date(product.agricultureInfo.expiryDate).toLocaleDateString('fr-FR')}
                              </dd>
                            </div>
                          )}
                          {product.agricultureInfo.shelfLife && product.agricultureInfo.shelfLife.value && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Durée de conservation</dt>
                              <dd className="font-medium">
                                {product.agricultureInfo.shelfLife.value} {product.agricultureInfo.shelfLife.unit}
                              </dd>
                            </div>
                          )}
                          {product.agricultureInfo.storageConditions && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Conditions de stockage</dt>
                              <dd className="font-medium capitalize">
                                {product.agricultureInfo.storageConditions.replace('-', ' ')}
                              </dd>
                            </div>
                          )}
                          {product.agricultureInfo.seasonality && product.agricultureInfo.seasonality.length > 0 && (
                            <div>
                              <dt className="text-gray-600 mb-2 block">Saisonnalité</dt>
                              <dd className="flex flex-wrap gap-2">
                                {product.agricultureInfo.seasonality.map((season, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {season === 'spring' ? 'Printemps' : 
                                     season === 'summer' ? 'Été' : 
                                     season === 'autumn' ? 'Automne' : 
                                     season === 'winter' ? 'Hiver' : season}
                                  </span>
                                ))}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>
                      {product.agricultureInfo.storageInstructions && (
                        <div className="mt-4">
                          <dt className="text-gray-600 mb-2 block">Instructions de stockage</dt>
                          <dd className="text-gray-700">{product.agricultureInfo.storageInstructions}</dd>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informations nutritionnelles */}
                  {product.nutritionalInfo && Object.keys(product.nutritionalInfo).some(key => {
                    const value = product.nutritionalInfo[key];
                    return value !== null && value !== undefined && value !== '' && 
                           (Array.isArray(value) ? value.length > 0 : true);
                  }) && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiInfo className="h-5 w-5 mr-2" />
                        Informations nutritionnelles
                      </h3>
                      <div className="space-y-4">
                        {(product.nutritionalInfo.servingSize?.value || product.nutritionalInfo.calories) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.nutritionalInfo.servingSize?.value && (
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Taille de portion</dt>
                                <dd className="font-medium">
                                  {product.nutritionalInfo.servingSize.value} {product.nutritionalInfo.servingSize.unit}
                                </dd>
                              </div>
                            )}
                            {product.nutritionalInfo.calories && (
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Calories (pour 100g)</dt>
                                <dd className="font-medium">{product.nutritionalInfo.calories} kcal</dd>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Valeurs nutritionnelles */}
                        {product.nutritionalInfo.nutrients && product.nutritionalInfo.nutrients.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-3">Valeurs nutritionnelles</h4>
                            <div className="space-y-2">
                              {product.nutritionalInfo.nutrients.map((nutrient, index) => (
                                <div key={index} className="flex justify-between items-center py-1">
                                  <span className="text-gray-600">{nutrient.name}</span>
                                  <span className="font-medium">
                                    {nutrient.value} {nutrient.unit}
                                    {nutrient.dailyValue && (
                                      <span className="text-sm text-gray-500 ml-1">
                                        ({nutrient.dailyValue}% VQ*)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Allergènes */}
                        {product.nutritionalInfo.allergens && product.nutritionalInfo.allergens.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-2">Allergènes</h4>
                            <div className="flex flex-wrap gap-2">
                              {product.nutritionalInfo.allergens.map((allergen, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Ingrédients */}
                        {product.nutritionalInfo.ingredients && product.nutritionalInfo.ingredients.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-2">Ingrédients</h4>
                            <p className="text-gray-700">{product.nutritionalInfo.ingredients.join(', ')}</p>
                          </div>
                        )}
                        
                        {product.nutritionalInfo.nutrients && product.nutritionalInfo.nutrients.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">*VQ = Valeur quotidienne</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informations d'expédition */}
                  {product.shipping && Object.keys(product.shipping).some(key => {
                    const value = product.shipping[key];
                    return value !== null && value !== undefined && value !== '' && 
                           (Array.isArray(value) ? value.length > 0 : true);
                  }) && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiTruck className="h-5 w-5 mr-2" />
                        Informations d'expédition
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {product.shipping.weight?.value && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Poids</dt>
                              <dd className="font-medium">
                                {product.shipping.weight.value} {product.shipping.weight.unit}
                              </dd>
                            </div>
                          )}
                          {product.shipping.dimensions && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Dimensions</dt>
                              <dd className="font-medium">
                                {product.shipping.dimensions.length} x {product.shipping.dimensions.width} x {product.shipping.dimensions.height} {product.shipping.dimensions.unit}
                              </dd>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <dt className="text-gray-600">Fragile</dt>
                            <dd className="font-medium">
                              {product.shipping.fragile ? (
                                <FiCheckCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <FiXCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </dd>
                          </div>
                          <div className="flex items-center space-x-2">
                            <dt className="text-gray-600">Périssable</dt>
                            <dd className="font-medium">
                              {product.shipping.perishable ? (
                                <FiCheckCircle className="h-4 w-4 text-orange-500" />
                              ) : (
                                <FiXCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </dd>
                          </div>
                          <div className="flex items-center space-x-2">
                            <dt className="text-gray-600">Réfrigération requise</dt>
                            <dd className="font-medium">
                              {product.shipping.requiresRefrigeration ? (
                                <FiCheckCircle className="h-4 w-4 text-blue-500" />
                              ) : (
                                <FiXCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disponibilité */}
                  {product.availability && Object.keys(product.availability).some(key => {
                    const value = product.availability[key];
                    return value !== null && value !== undefined && value !== '' && 
                           (Array.isArray(value) ? value.length > 0 : true);
                  }) && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiCalendar className="h-5 w-5 mr-2" />
                        Disponibilité
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {product.availability.status && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Statut</dt>
                              <dd className="font-medium capitalize">
                                {product.availability.status === 'in-stock' ? 'En stock' :
                                 product.availability.status === 'low-stock' ? 'Stock faible' :
                                 product.availability.status === 'out-of-stock' ? 'Rupture de stock' :
                                 product.availability.status === 'pre-order' ? 'Pré-commande' :
                                 product.availability.status === 'discontinued' ? 'Discontinué' :
                                 product.availability.status}
                              </dd>
                            </div>
                          )}
                          {product.availability.availableFrom && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Disponible à partir du</dt>
                              <dd className="font-medium">
                                {new Date(product.availability.availableFrom).toLocaleDateString('fr-FR')}
                              </dd>
                            </div>
                          )}
                          {product.availability.availableUntil && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Disponible jusqu'au</dt>
                              <dd className="font-medium">
                                {new Date(product.availability.availableUntil).toLocaleDateString('fr-FR')}
                              </dd>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {product.availability.estimatedRestockDate && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Réapprovisionnement estimé</dt>
                              <dd className="font-medium">
                                {new Date(product.availability.estimatedRestockDate).toLocaleDateString('fr-FR')}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Statistiques du produit - Visible seulement pour le propriétaire et l'admin */}
                  {user && (user.userType === 'admin' || (product.producer && product.producer._id === user._id)) && product.stats && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiAward className="h-5 w-5 mr-2" />
                        Statistiques
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-harvests-green">
                            {product.stats.views || 0}
                          </div>
                          <div className="text-sm text-gray-600">Vues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-harvests-green">
                            {product.stats.sales || 0}
                          </div>
                          <div className="text-sm text-gray-600">Ventes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-harvests-green">
                            {product.stats.favorites || 0}
                          </div>
                          <div className="text-sm text-gray-600">Favoris</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informations SEO - Visible seulement pour le propriétaire et l'admin */}
                  {user && (user.userType === 'admin' || (product.producer && product.producer._id === user._id)) && product.seo && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiInfo className="h-5 w-5 mr-2" />
                        Informations SEO
                      </h3>
                      <div className="space-y-4">
                        {product.seo.title && (
                          <div>
                            <dt className="text-gray-600 mb-1 block">Titre SEO</dt>
                            <dd className="text-gray-700">{product.seo.title}</dd>
                          </div>
                        )}
                        {product.seo.description && (
                          <div>
                            <dt className="text-gray-600 mb-1 block">Description SEO</dt>
                            <dd className="text-gray-700">{product.seo.description}</dd>
                          </div>
                        )}
                        {product.seo.keywords && product.seo.keywords.length > 0 && (
                          <div>
                            <dt className="text-gray-600 mb-2 block">Mots-clés</dt>
                            <dd className="flex flex-wrap gap-2">
                              {product.seo.keywords.map((keyword, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {keyword}
                                </span>
                              ))}
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informations de publication - Visible seulement pour le propriétaire et l'admin */}
                  {user && (user.userType === 'admin' || (product.producer && product.producer._id === user._id)) && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiClock className="h-5 w-5 mr-2" />
                        Informations de publication
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Statut</dt>
                            <dd className="font-medium">{statusConfig.text}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Actif</dt>
                            <dd className="font-medium">
                              {product.isActive ? (
                                <FiCheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <FiXCircle className="h-4 w-4 text-red-500" />
                              )}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Mis en avant</dt>
                            <dd className="font-medium">
                              {product.isFeatured ? (
                                <FiCheckCircle className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <FiXCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </dd>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Créé le</dt>
                            <dd className="font-medium">
                              {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                            </dd>
                          </div>
                          {product.publishedAt && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Publié le</dt>
                              <dd className="font-medium">
                                {new Date(product.publishedAt).toLocaleDateString('fr-FR')}
                              </dd>
                            </div>
                          )}
                          {product.lastStockUpdate && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Dernière mise à jour stock</dt>
                              <dd className="font-medium">
                                {new Date(product.lastStockUpdate).toLocaleDateString('fr-FR')}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>
                      {product.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <dt className="text-red-800 font-medium mb-1">Raison du rejet</dt>
                          <dd className="text-red-700">{product.rejectionReason}</dd>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Certifications */}
                  {product.certifications && product.certifications.length > 0 && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiShield className="h-5 w-5 mr-2" />
                        Certifications et labels
                      </h3>
                      <div className="space-y-4">
                        {product.certifications.map((cert, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{cert.name}</h4>
                                {cert.certifyingBody && (
                                  <p className="text-sm text-gray-600">Organisme: {cert.certifyingBody}</p>
                                )}
                                {cert.certificateNumber && (
                                  <p className="text-sm text-gray-600">N°: {cert.certificateNumber}</p>
                                )}
                                {cert.validUntil && (
                                  <p className="text-sm text-gray-600">
                                    Valide jusqu'au: {new Date(cert.validUntil).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                              </div>
                              {cert.document && (
                                <a
                                  href={cert.document}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-harvests-green hover:text-green-600 text-sm font-medium"
                                >
                                  Voir le certificat
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informations producteur */}
                  {producer && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUser className="h-5 w-5 mr-2" />
                        Informations producteur
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
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
                        </div>
                        <div className="space-y-3">
                          {producer.phone && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Téléphone</dt>
                              <dd className="font-medium">{producer.phone}</dd>
                            </div>
                          )}
                          {producer.email && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Email</dt>
                              <dd className="font-medium">{producer.email}</dd>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Bouton pour laisser un avis */}
                  {canLeaveReview() && !showReviewForm && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-primary-500">
                            Avez-vous acheté ce produit ?
                          </h3>
                          <p className="text-primary-700 text-sm mt-1">
                            Partagez votre expérience avec la communauté
                          </p>
                        </div>
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        >
                          <FiStar className="h-4 w-4 mr-2" />
                          Laisser un avis
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Formulaire d'avis */}
                  {showReviewForm && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Laisser un avis
                        </h3>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </div>
                      <SimpleReviewForm
                        product={product}
                        producer={producer}
                        onSubmit={handleSubmitReview}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </div>
                  )}

                  {/* Liste des avis */}
                  <ReviewList
                    reviews={reviews}
                    stats={reviewStats}
                    loading={reviewsLoading}
                    onVoteHelpful={handleVoteHelpful}
                    onVoteUnhelpful={handleVoteUnhelpful}
                    currentUserId={user?._id}
                    showProductInfo={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProductDetail;
