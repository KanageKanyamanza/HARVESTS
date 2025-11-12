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
      'processing': { 
        color: 'text-purple-600 bg-purple-100', 
        text: 'En cours', 
        icon: Package 
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
            {/* Produits commandés */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Produits commandés
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {order?.items?.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      {/* Image du produit */}
                      <div className="flex-shrink-0">
                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                          {(() => {
                            // Utiliser la même logique que OrderList
                            const productSnapshot = item.productSnapshot || {};
                            const productImages = productSnapshot.images || item.product?.images || [];
                            let imageUrl = null;
                            let imageAlt = null;
                            
                            if (productImages.length > 0) {
                              const firstImg = productImages[0];
                              
                              // Si c'est déjà un objet avec une propriété url
                              if (firstImg && typeof firstImg === 'object' && firstImg.url) {
                                imageUrl = firstImg.url;
                                imageAlt = firstImg.alt;
                              }
                              // Si c'est une chaîne qui ressemble à une URL
                              else if (typeof firstImg === 'string' && firstImg.startsWith('http')) {
                                imageUrl = firstImg;
                              }
                              // Si c'est une chaîne avec une représentation d'objet, extraire l'URL avec regex
                              else if (typeof firstImg === 'string') {
                                // Chercher l'URL dans la chaîne avec une regex
                                const urlMatch = firstImg.match(/url:\s*['"]([^'"]+)['"]/);
                                if (urlMatch && urlMatch[1]) {
                                  imageUrl = urlMatch[1];
                                }
                                
                                // Chercher l'alt dans la chaîne avec une regex
                                const altMatch = firstImg.match(/alt:\s*['"]([^'"]*)['"]/);
                                if (altMatch && altMatch[1]) {
                                  imageAlt = altMatch[1];
                                }
                              }
                            }
                            
                            return imageUrl ? (
                              <CloudinaryImage
                                src={imageUrl}
                                alt={imageAlt || parseProductName(productSnapshot.name || item.product?.name)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Détails du produit */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900">
                          {parseProductName((item.productSnapshot || {}).name || item.product?.name)}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Catégorie: {(item.productSnapshot || {}).category || item.product?.category || 'Non spécifiée'}
                        </p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            Quantité: <span className="font-medium">{item.quantity}</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Prix unitaire: <span className="font-medium">{formatPrice(item.price)}</span>
                          </span>
                        </div>
                        {item.specialInstructions && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                              <strong>Instructions spéciales:</strong> {item.specialInstructions}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Prix total de l'article */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total de la commande */}
                  <div className="border-t border-gray-200 pt-4">
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
            </div>

            {/* Informations de livraison et producteur */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

              {/* Informations producteur */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Producteur
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order?.producer?.firstName} {order?.producer?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order?.producer?.farmName || 'Ferme non renseignée'}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {order?.producer?.email}
                      </p>
                      {order?.producer?.phone && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {order.producer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
