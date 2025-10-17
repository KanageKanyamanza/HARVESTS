import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Calendar, 
  DollarSign, 
  Star,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Tag,
  MapPin,
  Truck,
  Shield
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProductById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir approuver ce produit ?')) {
      try {
        setActionLoading(true);
        await adminService.approveProduct(id);
        await loadProduct(); // Recharger les données
      } catch (error) {
        console.error('Erreur lors de l\'approbation:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRejectProduct = async () => {
    const reason = window.prompt('Raison du rejet:');
    if (reason) {
      try {
        setActionLoading(true);
        await adminService.rejectProduct(id, reason);
        await loadProduct(); // Recharger les données
      } catch (error) {
        console.error('Erreur lors du rejet:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleFeatureProduct = async () => {
    try {
      setActionLoading(true);
      if (product.isFeatured) {
        await adminService.unfeatureProduct(id);
      } else {
        await adminService.featureProduct(id);
      }
      await loadProduct(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la mise en vedette:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': 'text-green-600 bg-green-100',
      'pending-review': 'text-yellow-600 bg-yellow-100',
      'draft': 'text-gray-600 bg-gray-100',
      'rejected': 'text-red-600 bg-red-100',
      'inactive': 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5" />;
      case 'pending-review':
        return <Clock className="h-5 w-5" />;
      case 'rejected':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'approved': 'Approuvé',
      'pending-review': 'En attente de révision',
      'draft': 'Brouillon',
      'rejected': 'Rejeté',
      'inactive': 'Inactif'
    };
    return statusMap[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  };

  const getLocalizedText = (text) => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text.fr || text.en || 'Texte non disponible';
    }
    return 'Texte non disponible';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h2>
        <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas.</p>
        <button
          onClick={() => navigate('/admin/products')}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getLocalizedText(product.name)}
            </h1>
            <p className="text-gray-600">Par {product.producer?.firstName} {product.producer?.lastName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
            {getStatusIcon(product.status)}
            <span className="ml-2">{getStatusText(product.status)}</span>
          </span>
          {product.isFeatured && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-purple-600 bg-purple-100">
              <Star className="h-4 w-4 mr-1" />
              En vedette
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {product.status === 'pending-review' && (
            <>
              <button
                onClick={handleApproveProduct}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </button>
              <button
                onClick={handleRejectProduct}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </button>
            </>
          )}
          
          {product.status === 'approved' && (
            <button
              onClick={handleFeatureProduct}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-md disabled:opacity-50 flex items-center ${
                product.isFeatured 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {product.isFeatured ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Retirer des vedettes
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Mettre en vedette
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du produit</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{getLocalizedText(product.name)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Catégorie</p>
                <p className="font-medium capitalize">{product.category}</p>
                {product.subcategory && (
                  <p className="text-xs text-gray-400 capitalize">{product.subcategory}</p>
                )}
              </div>
            </div>
            
            {product.tags && product.tags.length > 0 && (
              <div className="flex items-start">
                <Tag className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Prix</p>
                <p className="font-medium">{formatPrice(product.price)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Producteur</p>
                <p className="font-medium">{product.producer?.firstName} {product.producer?.lastName}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Créé le</p>
                <p className="font-medium">{formatDate(product.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Vues</span>
              <span className="font-medium">{product.stats?.views || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Commandes</span>
              <span className="font-medium">{product.stats?.purchases || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Note moyenne</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-medium">{product.stats?.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Avis</span>
              <span className="font-medium">{product.stats?.totalReviews || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Stock</span>
              <span className="font-medium">{product.inventory?.quantity || 'Illimité'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
        <p className="text-gray-700 leading-relaxed">
          {getLocalizedText(product.description)}
        </p>
      </div>

      {/* Images */}
      {product.images && product.images.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`${getLocalizedText(product.name)} - Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200">
                    <Eye className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variantes */}
      {product.hasVariants && product.variants && product.variants.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Variantes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-harvests-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poids
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {product.variants.map((variant, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {variant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(variant.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.weight ? 
                        `${variant.weight.value} ${variant.weight.unit}` : 
                        'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.inventory?.quantity || 'Illimité'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Informations de livraison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Livraison</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Poids</p>
                <p className="font-medium">
                  {product.shipping?.weight ? 
                    `${product.shipping.weight.value} ${product.shipping.weight.unit}` : 
                    'Non spécifié'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="font-medium">
                  {product.shipping?.dimensions ? 
                    `${product.shipping.dimensions.length}x${product.shipping.dimensions.width}x${product.shipping.dimensions.height} ${product.shipping.dimensions.unit}` : 
                    'Non spécifiées'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Fragile</p>
                <p className="font-medium">{product.shipping?.fragile ? 'Oui' : 'Non'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Qualité</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Périssable</span>
              <div className="flex items-center">
                {product.shipping?.perishable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Réfrigération requise</span>
              <div className="flex items-center">
                {product.shipping?.requiresRefrigeration ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Disponibilité</span>
              <span className="font-medium capitalize">
                {product.availability?.status?.replace('-', ' ') || 'En stock'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Commande minimum</span>
              <span className="font-medium">{product.minimumOrderQuantity || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations SEO */}
      {product.seo && (product.seo.title || product.seo.description || product.seo.keywords) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations SEO</h2>
          <div className="space-y-4">
            {product.seo.title && (
              <div>
                <p className="text-sm text-gray-500">Titre SEO</p>
                <p className="font-medium">{product.seo.title}</p>
              </div>
            )}
            {product.seo.description && (
              <div>
                <p className="text-sm text-gray-500">Description SEO</p>
                <p className="font-medium">{product.seo.description}</p>
              </div>
            )}
            {product.seo.keywords && product.seo.keywords.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Mots-clés</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.seo.keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historique des modifications */}
      {product.updatedAt !== product.createdAt && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernière modification</h2>
          <p className="text-gray-600">
            Modifié le {formatDate(product.updatedAt)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
