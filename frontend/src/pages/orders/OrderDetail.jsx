import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { consumerService, producerService, transformerService, orderService } from '../../services';
import { parseProductName } from '../../utils/productUtils';
import ModularDashboardLayout from '../../components/layout/ModularDashboardLayout';
import {
  FiArrowLeft,
  FiShoppingBag,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';

const OrderDetail = () => {
  const { id, orderId } = useParams();
  const orderIdParam = id || orderId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderIdParam || !user) {
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        // Utiliser le service approprié selon le type d'utilisateur
        if (user.userType === 'consumer') {
          response = await consumerService.getMyOrder(orderIdParam);
        } else if (user.userType === 'producer') {
          response = await producerService.getOrder(orderIdParam);
        } else if (user.userType === 'transformer') {
          response = await transformerService.getMyOrder(orderIdParam);
        } else {
          // Pour les autres types d'utilisateurs (admin, etc.), utiliser le service général
          response = await orderService.getOrder(orderIdParam);
        }
        
        if (response.data.status === 'success') {
          setOrder(response.data.data.order);
        } else {
          setError('Commande non trouvée');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails de la commande:', error);
        setError('Erreur lors du chargement des détails de la commande');
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderIdParam, user, navigate]);

  const updateOrderStatus = async (newStatus) => {
    if (!order || updating) return;
    
    try {
      setUpdating(true);
      
      // Utiliser le service approprié selon le type d'utilisateur
      let response;
      if (user.userType === 'producer') {
        response = await producerService.updateOrderStatus(order._id, { status: newStatus });
      } else if (user.userType === 'transformer') {
        response = await transformerService.updateOrderStatus(order._id, { status: newStatus });
      } else {
        // Pour les autres types d'utilisateurs, utiliser le service général
        response = await orderService.updateOrderStatus(order._id, { status: newStatus });
      }
      
      if (response.data.status === 'success') {
        // Mettre à jour l'état local
        setOrder(prevOrder => ({
          ...prevOrder,
          status: newStatus
        }));
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut vers ${newStatus}:`, error);
    } finally {
      setUpdating(false);
    }
  };

  const confirmOrder = () => updateOrderStatus('confirmed');
  const cancelOrder = () => updateOrderStatus('cancelled');
  const shipOrder = () => updateOrderStatus('in-transit');

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        color: 'text-yellow-600 bg-yellow-100', 
        text: 'En attente', 
        icon: FiClock,
        description: 'Votre commande est en attente de confirmation'
      },
      'confirmed': { 
        color: 'text-blue-600 bg-blue-100', 
        text: 'Confirmée', 
        icon: FiCheckCircle,
        description: 'Votre commande a été confirmée et est en préparation'
      },
      'preparing': { 
        color: 'text-purple-600 bg-purple-100', 
        text: 'En préparation', 
        icon: FiPackage,
        description: 'Votre commande est en cours de préparation'
      },
      'ready-for-pickup': { 
        color: 'text-orange-600 bg-orange-100', 
        text: 'Prête pour collecte', 
        icon: FiPackage,
        description: 'Votre commande est prête pour la collecte'
      },
      'in-transit': { 
        color: 'text-indigo-600 bg-indigo-100', 
        text: 'En transit', 
        icon: FiTruck,
        description: 'Votre commande a été expédiée et est en route'
      },
      'out-for-delivery': { 
        color: 'text-blue-600 bg-blue-100', 
        text: 'En cours de livraison', 
        icon: FiTruck,
        description: 'Votre commande est en cours de livraison'
      },
      'delivered': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Livrée', 
        icon: FiCheckCircle,
        description: 'Votre commande a été livrée avec succès'
      },
      'completed': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Terminée', 
        icon: FiCheckCircle,
        description: 'Votre commande a été terminée avec succès'
      },
      'cancelled': { 
        color: 'text-red-600 bg-red-100', 
        text: 'Annulée', 
        icon: FiXCircle,
        description: 'Votre commande a été annulée'
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

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('fr-FR') || '0';
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiAlertCircle className="mx-auto h-16 w-16 text-red-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {error || 'Commande non trouvée'}
            </h3>
            <p className="mt-2 text-gray-600">
              La commande que vous recherchez n'existe pas ou vous n'avez pas l'autorisation de la voir.
            </p>
            <div className="mt-6">
              <Link
                to={user?.userType === 'consumer' ? '/order-history' : 
                    user?.userType === 'producer' ? '/producer/orders' : 
                    user?.userType === 'transformer' ? '/transformer/orders' :
                    '/dashboard'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Retour aux commandes
              </Link>
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
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center space-x-4">
              <Link
                to={user?.userType === 'consumer' ? '/order-history' : 
                    user?.userType === 'producer' ? '/producer/orders' : 
                    user?.userType === 'transformer' ? '/transformer/orders' :
                    '/dashboard'}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-gray-600">
                  Passée le {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusConfig.color}`}>
                <StatusIcon className="h-5 w-5 mr-2" />
                {statusConfig.text}
              </span>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiRefreshCw className="h-4 w-4 mr-1" />
                Actualiser
              </button>
              {(user?.userType === 'producer' || user?.userType === 'transformer') && (
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={confirmOrder}
                        disabled={updating}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheckCircle className="h-4 w-4 mr-1" />
                        {updating ? 'Confirmation...' : 'Confirmer'}
                      </button>
                      <button
                        onClick={cancelOrder}
                        disabled={updating}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiXCircle className="h-4 w-4 mr-1" />
                        Annuler
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={shipOrder}
                      disabled={updating}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiTruck className="h-4 w-4 mr-1" />
                      {updating ? 'Expédition...' : 'Expédier'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Description */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start space-x-3">
            <StatusIcon className="h-6 w-6 text-gray-400 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {(user?.userType === 'producer' || user?.userType === 'transformer') ? 'Statut de la commande' : 'Statut de votre commande'}
              </h3>
              <p className="text-gray-600 mt-1">{statusConfig.description}</p>
              {order.delivery?.estimatedDeliveryDate && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <p className="text-sm text-gray-500 mt-2">
                  <FiCalendar className="inline h-4 w-4 mr-1" />
                  Livraison prévue: {formatDate(order.delivery.estimatedDeliveryDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Articles commandés */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Articles commandés</h3>
              <div className="space-y-4">
                 {order.items?.map((item, index) => {
                   const productSnapshot = item.productSnapshot || {};
                   const productName = productSnapshot.name || item.name || 'Produit inconnu';
                   const productImages = productSnapshot.images || [];
                   const productPrice = productSnapshot.price || item.unitPrice || item.price || 0;
                   const productUnit = productSnapshot.unit || item.unit || 'unité';
                   const quantity = item.quantity || 1;
                   const totalPrice = item.totalPrice || (productPrice * quantity);
                   
                   // Gestion des images - productSnapshot.images contient des chaînes JSON
                   let imageUrl = null;
                   let imageAlt = null;
                   
                   if (productImages && productImages.length > 0) {
                     const firstImg = productImages[0];
                     
                     // Si c'est une chaîne JSON, la parser
                     if (typeof firstImg === 'string') {
                       try {
                         const parsedImg = JSON.parse(firstImg);
                         if (parsedImg && parsedImg.url) {
                           imageUrl = parsedImg.url;
                           imageAlt = parsedImg.alt || parseProductName(productName);
                         }
                       } catch {
                         // Si ce n'est pas du JSON valide, essayer l'extraction par regex
                         const urlMatch = firstImg.match(/url:\s*['"]([^'"]+)['"]/);
                         if (urlMatch && urlMatch[1]) {
                           imageUrl = urlMatch[1];
                           
                           // Chercher l'alt dans la chaîne avec une regex
                           const altMatch = firstImg.match(/alt:\s*['"]([^'"]*)['"]/);
                           if (altMatch && altMatch[1]) {
                             imageAlt = altMatch[1];
                           } else {
                             imageAlt = parseProductName(productName);
                           }
                         }
                         // Si ce n'est toujours pas trouvé, traiter comme une URL directe
                         else if (firstImg.startsWith('http')) {
                           imageUrl = firstImg;
                           imageAlt = parseProductName(productName);
                         }
                       }
                     }
                     // Si c'est un objet avec une propriété url (fallback)
                     else if (firstImg && typeof firstImg === 'object' && firstImg.url) {
                       imageUrl = firstImg.url;
                       imageAlt = firstImg.alt || parseProductName(productName);
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
                          Quantité: {quantity} {productUnit}
                        </p>
                        <p className="text-sm text-gray-500">
                          Prix unitaire: {productPrice.toLocaleString('fr-FR')} FCFA / {productUnit}
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
          </div>

          {/* Informations de livraison et résumé */}
          <div className="space-y-6">
            {/* Adresse de livraison ou informations client */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {(user?.userType === 'producer' || user?.userType === 'transformer') ? 'Informations client' : 'Adresse de livraison'}
              </h3>
              {(user?.userType === 'producer' || user?.userType === 'transformer') ? (
                // Affichage pour les producteurs - informations de l'acheteur
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FiUser className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.buyer?.firstName} {order.buyer?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{order.buyer?.email}</p>
                    </div>
                  </div>
                  
                  {order.buyer?.phone && (
                    <div className="flex items-center space-x-3">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                      <p className="text-gray-900">{order.buyer.phone}</p>
                    </div>
                  )}
                  
                  {order.delivery?.deliveryAddress && (
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
                  )}
                </div>
              ) : order.delivery?.deliveryAddress ? (
                // Affichage pour les consommateurs - adresse de livraison
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
                        <strong>Instructions:</strong> {order.delivery.deliveryAddress.deliveryInstructions}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">Adresse de livraison non disponible</p>
              )}
            </div>

            {/* Résumé de la commande */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé de la commande</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.subtotal || (order.total - (order.delivery?.deliveryFee || 0) + (order.couponDiscount || 0)))} FCFA
                  </span>
                </div>
                
                {order.delivery?.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="text-gray-900">
                      {formatCurrency(order.delivery.deliveryFee)} FCFA
                    </span>
                  </div>
                )}
                
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>-{formatCurrency(order.couponDiscount)} FCFA</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-medium text-gray-900">
                      {formatCurrency(order.total)} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de livraison</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FiTruck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.delivery?.method === 'express-delivery' ? 'Livraison Express' : 'Livraison Standard'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Statut: {order.delivery?.status || 'En attente'}
                    </p>
                  </div>
                </div>
                
                {order.delivery?.estimatedDeliveryDate && (
                  <div className="flex items-center space-x-3">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date de livraison prévue</p>
                      <p className="text-sm text-gray-500">{formatDate(order.delivery.estimatedDeliveryDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default OrderDetail;
