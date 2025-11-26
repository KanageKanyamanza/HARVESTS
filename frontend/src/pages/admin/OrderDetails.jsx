import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  CreditCard,
  FileText
} from 'lucide-react';
import { parseProductName } from '../../utils/productUtils';
import { adminService } from '../../services/adminService';
import CloudinaryImage from '../../components/common/CloudinaryImage';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrderById(orderId);
      console.log('📡 Réponse API Order Details:', response);
      
      // Vérifier la structure de la réponse
      if (response && response.data && response.data.order) {
        setOrder(response.data.order);
      } else if (response && response.data) {
        setOrder(response.data);
      } else if (response && response.order) {
        setOrder(response.order);
      } else {
        console.error('Structure de réponse inattendue:', response);
        setOrder(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la commande:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await adminService.updateOrderStatus(orderId, newStatus);
      await loadOrderDetails(); // Recharger les détails
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt('Raison de l\'annulation:');
    if (reason) {
      try {
        setUpdating(true);
        await adminService.cancelOrder(orderId, reason);
        await loadOrderDetails();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleConfirmPayment = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir confirmer ce paiement ?')) {
      try {
        setUpdating(true);
        
        // Mettre à jour le statut de paiement
        await adminService.updatePaymentStatus(orderId, { 
          paymentStatus: 'completed',
          paidAt: new Date().toISOString()
        });
        
        await loadOrderDetails();
      } catch (error) {
        console.error('Erreur lors de la confirmation du paiement:', error);
      } finally {
        setUpdating(false);
      }
    }
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
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        color: 'text-yellow-600 bg-yellow-100', 
        text: 'En attente', 
        icon: Clock 
      },
      'confirmed': { 
        color: 'text-blue-600 bg-blue-100', 
        text: 'Confirmée', 
        icon: CheckCircle 
      },
      'preparing': { 
        color: 'text-purple-600 bg-purple-100', 
        text: 'En préparation', 
        icon: Package 
      },
      'processing': { 
        color: 'text-purple-600 bg-purple-100', 
        text: 'En cours', 
        icon: Package 
      },
      'ready-for-pickup': { 
        color: 'text-indigo-600 bg-indigo-100', 
        text: 'Prête à collecter', 
        icon: Package 
      },
      'in-transit': { 
        color: 'text-indigo-600 bg-indigo-100', 
        text: 'En transit', 
        icon: Truck 
      },
      'shipped': { 
        color: 'text-indigo-600 bg-indigo-100', 
        text: 'Expédiée', 
        icon: Truck 
      },
      'delivered': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Livrée', 
        icon: CheckCircle 
      },
      'completed': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Terminée', 
        icon: CheckCircle 
      },
      'cancelled': { 
        color: 'text-red-600 bg-red-100', 
        text: 'Annulée', 
        icon: XCircle 
      },
      'disputed': { 
        color: 'text-orange-600 bg-orange-100', 
        text: 'En litige', 
        icon: AlertTriangle 
      }
    };
    return configs[status] || configs['pending'];
  };

  const getPaymentStatusConfig = (status) => {
    const configs = {
      'pending': { 
        color: 'text-yellow-600 bg-yellow-100', 
        text: 'En attente' 
      },
      'completed': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Payé' 
      },
      'paid': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Payé' 
      },
      'failed': { 
        color: 'text-red-600 bg-red-100', 
        text: 'Échoué' 
      },
      'refunded': { 
        color: 'text-gray-600 bg-gray-100', 
        text: 'Remboursé' 
      }
    };
    return configs[status] || configs['pending'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des détails de la commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande non trouvée</h2>
          <p className="text-gray-600 mb-4">Cette commande n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order?.status);
  const paymentStatusConfig = getPaymentStatusConfig(order?.payment?.status || order?.paymentStatus);
  const StatusIcon = statusConfig.icon;


  return (
    <div className="min-h-screen bg-harvests-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs text-gray-500">Commande:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.text}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Paiement:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatusConfig.color}`}>
                    <CreditCard className="h-3 w-3 mr-1" />
                    {paymentStatusConfig.text}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Commande #{order?.orderNumber || (order?._id ? order._id.slice(-8).toUpperCase() : 'N/A')}
            </h1>
            <p className="text-gray-600 mt-1">
              Créée le {order?.createdAt ? formatDate(order.createdAt) : 'Date inconnue'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Informations principales */}
          <div className="xl:col-span-3 space-y-6">
            {/* Articles commandés - Par vendeur si multi-vendeurs */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Articles commandés
                  {order?.isMultiVendor && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Multi-vendeurs
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-6">
                {/* Affichage par segments (vendeurs) si disponible */}
                {order?.segments && order.segments.length > 0 ? (
                  <div className="space-y-6">
                    {order.segments.map((segment, segmentIndex) => {
                      const segmentStatusConfig = getStatusConfig(segment.status);
                      const SegmentStatusIcon = segmentStatusConfig.icon;
                      
                      return (
                        <div key={segment._id || segmentIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* En-tête du segment avec vendeur et statut */}
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Package className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {segment.seller?.name || `${segment.seller?.firstName || ''} ${segment.seller?.lastName || ''}`.trim() || 'Vendeur'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {segment.seller?.userType === 'producer' && 'Producteur'}
                                  {segment.seller?.userType === 'transformer' && 'Transformateur'}
                                  {segment.seller?.userType === 'restaurateur' && 'Restaurateur'}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${segmentStatusConfig.color}`}>
                              <SegmentStatusIcon className="h-4 w-4 mr-1" />
                              {segmentStatusConfig.text}
                            </span>
                          </div>
                          
                          {/* Items du segment */}
                          <div className="divide-y divide-gray-100">
                            {segment.items?.map((item, itemIndex) => {
                              const itemStatusConfig = getStatusConfig(item.status);
                              const productImages = item.productSnapshot?.images || item.product?.images || [];
                              let imageUrl = null;
                              
                              if (productImages.length > 0) {
                                const firstImg = productImages[0];
                                if (firstImg && typeof firstImg === 'object' && firstImg.url) {
                                  imageUrl = firstImg.url;
                                } else if (typeof firstImg === 'string' && firstImg.startsWith('http')) {
                                  imageUrl = firstImg;
                                }
                              }
                              
                              return (
                                <div key={item._id || itemIndex} className="flex items-center p-4 space-x-4">
                                  {/* Image */}
                                  <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                                    {imageUrl ? (
                                      <CloudinaryImage
                                        src={imageUrl}
                                        alt={parseProductName(item.productSnapshot?.name || item.product?.name)}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <Package className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Détails */}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900">
                                      {parseProductName(item.productSnapshot?.name || item.product?.name)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Quantité: {item.quantity} • Prix unitaire: {formatPrice(item.price)}
                                    </p>
                                  </div>
                                  
                                  {/* Statut et prix */}
                                  <div className="flex-shrink-0 text-right">
                                    <p className="font-semibold text-gray-900">
                                      {formatPrice(item.price * item.quantity)}
                                    </p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${itemStatusConfig.color}`}>
                                      {itemStatusConfig.text}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Sous-total du segment */}
                          <div className="bg-gray-50 px-4 py-2 flex justify-between text-sm">
                            <span className="text-gray-600">Sous-total vendeur</span>
                            <span className="font-medium text-gray-900">{formatPrice(segment.subtotal || segment.total || 0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Affichage classique si pas de segments */
                  <div className="grid grid-cols-1 gap-6">
                    {order?.items?.map((item, index) => {
                      const itemStatusConfig = getStatusConfig(item.status);
                      const productSnapshot = item.productSnapshot || {};
                      const productImages = productSnapshot.images || item.product?.images || [];
                      let imageUrl = null;
                      
                      if (productImages.length > 0) {
                        const firstImg = productImages[0];
                        if (firstImg && typeof firstImg === 'object' && firstImg.url) {
                          imageUrl = firstImg.url;
                        } else if (typeof firstImg === 'string' && firstImg.startsWith('http')) {
                          imageUrl = firstImg;
                        }
                      }
                      
                      return (
                        <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                          <div className="flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                            {imageUrl ? (
                              <CloudinaryImage
                                src={imageUrl}
                                alt={parseProductName(productSnapshot.name || item.product?.name)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">
                              {parseProductName(productSnapshot.name || item.product?.name)}
                            </h3>
                            <div className="mt-2 flex items-center space-x-4">
                              <span className="text-sm text-gray-600">
                                Quantité: <span className="font-medium">{item.quantity}</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Prix unitaire: <span className="font-medium">{formatPrice(item.price)}</span>
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${itemStatusConfig.color}`}>
                                {itemStatusConfig.text}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Total de la commande */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total de la commande</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(order?.totalAmount || order?.total || 0)}
                    </span>
                  </div>
                  {order?.delivery?.deliveryFee > 0 && (
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                      <span>Frais de livraison</span>
                      <span>{formatPrice(order.delivery.deliveryFee)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vendeurs de la commande */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Vendeurs ({order?.segments?.length || 1})
                </h2>
              </div>
              <div className="p-6">
                {order?.segments && order.segments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.segments.map((segment, index) => {
                      const segmentStatusConfig = getStatusConfig(segment.status);
                      const userTypeLabels = {
                        'producer': 'Producteur',
                        'transformer': 'Transformateur',
                        'restaurateur': 'Restaurateur'
                      };
                      
                      return (
                        <div key={segment._id || index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {segment.seller?.name || `${segment.seller?.firstName || ''} ${segment.seller?.lastName || ''}`.trim() || 'Vendeur'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {userTypeLabels[segment.seller?.userType] || 'Vendeur'}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${segmentStatusConfig.color}`}>
                              {segmentStatusConfig.text}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {segment.seller?.email && (
                              <p className="flex items-center">
                                <Mail className="h-3 w-3 mr-2" />
                                {segment.seller.email}
                              </p>
                            )}
                            {segment.seller?.phone && (
                              <p className="flex items-center">
                                <Phone className="h-3 w-3 mr-2" />
                                {segment.seller.phone}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-500">{segment.items?.length || 0} article(s)</span>
                            <span className="font-medium text-gray-900">{formatPrice(segment.subtotal || segment.total || 0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Affichage du producteur unique si pas de segments */
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order?.producer?.firstName && order?.producer?.firstName !== 'N/A' 
                          ? `${order.producer.firstName} ${order.producer.lastName}`
                          : 'Aucun vendeur assigné'}
                      </p>
                      {order?.producer?.farmName && order.producer.farmName !== 'N/A' && (
                        <p className="text-sm text-gray-600">
                          {order.producer.farmName}
                        </p>
                      )}
                      {order?.producer?.email && order.producer.email !== 'N/A' && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {order.producer.email}
                        </p>
                      )}
                      {order?.producer?.phone && order.producer.phone !== 'N/A' && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {order.producer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations de livraison */}
            {order?.delivery?.deliveryAddress && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Adresse de livraison
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">
                      <strong>{order.delivery.deliveryAddress.firstName} {order.delivery.deliveryAddress.lastName}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.delivery.deliveryAddress.street}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.delivery.deliveryAddress.city}, {order.delivery.deliveryAddress.region}
                    </p>
                    {order.delivery.deliveryAddress.phone && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {order.delivery.deliveryAddress.phone}
                      </p>
                    )}
                    {order.delivery.deliveryInstructions && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Instructions de livraison:</strong> {order.delivery.deliveryInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Raison du litige */}
            {order?.disputeReason && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-red-600 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Raison du litige
                  </h2>
                </div>
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{order.disputeReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations client */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Client
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order?.customer?.firstName} {order?.customer?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {order?.customer?.email}
                    </p>
                    {order?.customer?.phone && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {order.customer.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {/* Informations de paiement */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Paiement
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Méthode</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(() => {
                        const method = order?.payment?.method || order?.paymentMethod;
                        const methodLabels = {
                          'cash': 'Paiement à la livraison',
                          'paypal': 'PayPal'
                        };
                        return methodLabels[method] || method || 'Non spécifiée';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Statut</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatusConfig.color}`}>
                      {paymentStatusConfig.text}
                    </span>
                  </div>
                  {(order?.payment?.provider || order?.paymentProvider) && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fournisseur</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(() => {
                          const provider = order?.payment?.provider || order?.paymentProvider;
                          const providerLabels = {
                            'cash-on-delivery': 'Paiement à la livraison',
                            'paypal': 'PayPal'
                          };
                          return providerLabels[provider] || provider;
                        })()}
                      </span>
                    </div>
                  )}
                  {order?.payment?.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ID Transaction</span>
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        {order.payment.transactionId}
                      </span>
                    </div>
                  )}
                  {order?.payment?.amount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Montant payé</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(order.payment.amount)}
                      </span>
                    </div>
                  )}
                  {order?.payment?.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payé le</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(order.payment.paidAt)}
                      </span>
                    </div>
                  )}
                  {order?.payment?.failureReason && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Raison d'échec</span>
                      <span className="text-sm font-medium text-red-600">
                        {order.payment.failureReason}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions - Masquer si paiement confirmé */}
            {(() => {
              const paymentStatus = order?.payment?.status || order?.paymentStatus;
              const isPaymentCompleted = paymentStatus === 'completed' || paymentStatus === 'paid';
              return !isPaymentCompleted;
            })() && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Actions
                  </h2>
                </div>
                <div className="p-6">
                <div className="space-y-3">
                  {order?.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus('confirmed')}
                      disabled={updating}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {updating ? 'Confirmation...' : 'Confirmer la commande'}
                    </button>
                  )}
                  
                  {order?.status === 'disputed' && (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      disabled={updating}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {updating ? 'Résolution...' : 'Résoudre le litige'}
                    </button>
                  )}
                  
                  {/* Confirmation de paiement pour les paiements en espèces */}
                  {(() => {
                    const paymentMethod = order?.payment?.method || order?.paymentMethod;
                    const paymentStatus = order?.payment?.status || order?.paymentStatus;
                    const isCashPayment = paymentMethod === 'cash';
                    const isPendingPayment = paymentStatus === 'pending';
                    
                    return isCashPayment && isPendingPayment;
                  })() && (
                    <button
                      onClick={handleConfirmPayment}
                      disabled={updating}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {updating ? 'Confirmation...' : 'Confirmer le paiement'}
                    </button>
                  )}
                  
                  {(order?.status === 'pending' || order?.status === 'confirmed') && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={updating}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {updating ? 'Annulation...' : 'Annuler la commande'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
