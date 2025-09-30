import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService, orderService } from '../../../services';
import { parseProductName } from '../../../utils/productUtils';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
  FiArrowRight,
  FiDownload,
  FiShare2,
  FiHome,
  FiPackage,
  FiUser,
  FiPhone
} from 'react-icons/fi';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('ID de commande manquant');
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        setError('Vous devez être connecté pour voir cette commande');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        // Essayer d'abord avec consumerService si l'utilisateur est un consommateur
        if (user?.userType === 'consumer') {
          try {
            response = await consumerService.getMyOrder(orderId);
            if (response.data.status === 'success') {
              setOrder(response.data.data?.order || response.data.order);
              return;
            }
          } catch (consumerError) {
            console.log('Erreur avec consumerService, essai avec orderService:', consumerError);
          }
        }
        
        // Fallback vers orderService
        response = await orderService.getOrder(orderId);
        if (response.data.status === 'success') {
          setOrder(response.data.data?.order || response.data.order);
        } else {
          setError('Commande non trouvée');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
        if (error.response?.status === 404) {
          setError('Commande introuvable');
        } else if (error.response?.status === 403) {
          setError('Vous n\'avez pas l\'autorisation de voir cette commande');
        } else {
          setError('Erreur lors du chargement de la commande');
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, isAuthenticated, user, navigate]);

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        color: 'text-yellow-600 bg-yellow-100', 
        text: 'En attente', 
        icon: FiClock 
      },
      'confirmed': { 
        color: 'text-blue-600 bg-blue-100', 
        text: 'Confirmée', 
        icon: FiCheckCircle 
      },
      'processing': { 
        color: 'text-purple-600 bg-purple-100', 
        text: 'En préparation', 
        icon: FiPackage 
      },
      'shipped': { 
        color: 'text-indigo-600 bg-indigo-100', 
        text: 'Expédiée', 
        icon: FiTruck 
      },
      'delivered': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Livrée', 
        icon: FiCheckCircle 
      },
      'cancelled': { 
        color: 'text-red-600 bg-red-100', 
        text: 'Annulée', 
        icon: FiClock 
      }
    };
    return configs[status] || configs['pending'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadInvoice = () => {
    // TODO: Implémenter le téléchargement de la facture
    console.log('Téléchargement de la facture pour la commande:', orderId);
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Commande #${order?.orderNumber}`,
        text: `Ma commande sur Harvests - ${order?.items?.length} article(s)`,
        url: window.location.href
      });
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      // Ici on pourrait afficher une notification
    }
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {error || 'Commande introuvable'}
            </h2>
            <p className="mt-2 text-gray-600">
              {error === 'Commande introuvable' 
                ? 'La commande demandée n\'existe pas ou vous n\'avez pas l\'autorisation de la voir.'
                : error === 'Vous devez être connecté pour voir cette commande'
                ? 'Veuillez vous connecter pour accéder à cette page.'
                : error === 'ID de commande manquant'
                ? 'L\'identifiant de la commande est manquant dans l\'URL.'
                : 'Une erreur est survenue lors du chargement de la commande.'
              }
            </p>
            <div className="mt-6 space-x-4">
              {error === 'Vous devez être connecté pour voir cette commande' ? (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                >
                  Se connecter
                </button>
              ) : (
                <button
                  onClick={() => navigate('/order-history')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                >
                  <FiArrowRight className="mr-2 h-5 w-5" />
                  Voir mes commandes
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiHome className="mr-2 h-5 w-5" />
                Accueil
              </button>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FiCheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-600">
            Votre commande a été passée avec succès. Vous recevrez un email de confirmation.
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}
              </h2>
              <p className="text-sm text-gray-600">
                Passée le {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusConfig.text}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Télécharger la facture
            </button>
            <button
              onClick={handleShareOrder}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiShare2 className="h-4 w-4 mr-2" />
              Partager
            </button>
            <button
              onClick={() => navigate('/order-history')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiShoppingBag className="h-4 w-4 mr-2" />
              Voir toutes mes commandes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles commandés</h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => {
                const productSnapshot = item.productSnapshot || {};
                const productName = productSnapshot.name || item.name || 'Produit inconnu';
                const productImages = productSnapshot.images || [];
                const productPrice = productSnapshot.price || item.unitPrice || item.price || 0;
                const quantity = item.quantity || 1;
                const totalPrice = item.totalPrice || (productPrice * quantity);
                
                // Essayer différentes approches pour extraire l'URL
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

                return (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={imageAlt || parseProductName(productName)}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="h-full w-full flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
                        <FiPackage className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {parseProductName(productName)}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Quantité: {quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Prix unitaire: {productPrice.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {totalPrice.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{order.subtotal?.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frais de livraison</span>
                <span className="font-medium">{order.deliveryFee?.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA</span>
                <span className="font-medium">{order.taxes?.toLocaleString()} FCFA</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Réduction</span>
                  <span className="font-medium text-green-600">-{order.discount?.toLocaleString()} FCFA</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {order.total?.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="h-5 w-5 mr-2" />
              Adresse de livraison
            </h3>
            {order.delivery?.deliveryAddress ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FiUser className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.delivery.deliveryAddress.firstName} {order.delivery.deliveryAddress.lastName}
                    </p>
                    {order.delivery.deliveryAddress.label && (
                      <p className="text-sm text-gray-500">{order.delivery.deliveryAddress.label}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FiMapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-900">
                      {order.delivery.deliveryAddress.street}
                    </p>
                    <p className="text-gray-900">
                      {order.delivery.deliveryAddress.city}, {order.delivery.deliveryAddress.region}
                    </p>
                    <p className="text-gray-900">
                      {order.delivery.deliveryAddress.country} {order.delivery.deliveryAddress.postalCode}
                    </p>
                  </div>
                </div>
                
                {order.delivery.deliveryAddress.phone && (
                  <div className="flex items-center space-x-3">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                    <p className="text-gray-900">{order.delivery.deliveryAddress.phone}</p>
                  </div>
                )}
                
                {order.delivery.deliveryAddress.deliveryInstructions && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Instructions de livraison:</span><br />
                      {order.delivery.deliveryAddress.deliveryInstructions}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                <p>Aucune adresse de livraison spécifiée</p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiCreditCard className="h-5 w-5 mr-2" />
              Paiement
            </h3>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Méthode:</span> {
                  order.payment?.method === 'mobile-money' ? 'Mobile Money' :
                  order.payment?.method === 'card' ? 'Carte bancaire' :
                  order.payment?.method === 'cash' ? 'Paiement à la livraison' :
                  order.payment?.method === 'bank-transfer' ? 'Virement bancaire' :
                  order.payment?.method
                }
              </p>
              <p>
                <span className="font-medium">Statut:</span> {
                  order.payment?.status === 'pending' ? 'En attente' :
                  order.payment?.status === 'processing' ? 'En cours' :
                  order.payment?.status === 'completed' ? 'Payé' :
                  order.payment?.status === 'failed' ? 'Échoué' :
                  order.payment?.status
                }
              </p>
              {order.payment?.transactionId && (
                <p>
                  <span className="font-medium">Transaction:</span> {order.payment.transactionId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Prochaines étapes</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium">1</span>
              </div>
              <p>Vous recevrez un email de confirmation avec les détails de votre commande.</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium">2</span>
              </div>
              <p>Le producteur préparera votre commande et vous informera de l'expédition.</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium">3</span>
              </div>
              <p>Vous recevrez un numéro de suivi pour suivre votre livraison en temps réel.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
          >
            <FiHome className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate('/order-history')}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiShoppingBag className="mr-2 h-5 w-5" />
            Voir mes commandes
          </button>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default OrderConfirmation;
