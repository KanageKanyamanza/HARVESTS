import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { consumerService, producerService, transformerService, restaurateurService, orderService } from '../../services';
import { adminService } from '../../services/adminService';
import { parseProductName } from '../../utils/productUtils';
import CloudinaryImage from '../../components/common/CloudinaryImage';
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
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // Vérifier si on est dans le contexte admin
  const isAdminContext = location.pathname.startsWith('/admin/orders');

  const loadOrderDetails = useCallback(async () => {
    if (!orderIdParam || !user) {
      navigate('/dashboard');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;

      if (isAdminContext) {
        response = await adminService.getOrderById(orderIdParam);
        if (response.status === 'success' && response.data && response.data.order) {
          setOrder(response.data.order);
        } else {
          setError('Commande non trouvée');
        }
      } else {
        if (user.userType === 'consumer') {
          response = await consumerService.getMyOrder(orderIdParam);
        } else if (user.userType === 'producer') {
          response = await producerService.getOrder(orderIdParam);
        } else if (user.userType === 'transformer') {
          response = await transformerService.getMyOrder(orderIdParam);
        } else if (user.userType === 'restaurateur') {
          response = await restaurateurService.getOrder(orderIdParam);
        } else {
          response = await orderService.getOrder(orderIdParam);
        }

        if (response.data.status === 'success') {
          const fetchedOrder = response.data.data.order;
          if (!fetchedOrder.segment && fetchedOrder.items?.length) {
            console.warn('[Harvests] Commande sans segment détectée, elle sera régénérée côté backend.');
          }
          setOrder(fetchedOrder);
        } else {
          setError('Commande non trouvée');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la commande:', error);
      setError('Erreur lors du chargement des détails de la commande');
    } finally {
      setLoading(false);
    }
  }, [orderIdParam, user, navigate, isAdminContext]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const updateOrderStatus = async (newStatus, options = {}) => {
    if (!order || updating) return;

    try {
      setUpdating(true);

      let response;
      const payload = {
        status: newStatus,
        segmentId: order.segment?.id || order.segment?._id,
        ...(options.itemId ? { itemId: options.itemId } : {}),
        ...(options.itemIds ? { itemIds: options.itemIds } : {})
      };

      if (isAdminContext) {
        response = await adminService.updateOrderStatus(order._id, newStatus);
      } else if (user.userType === 'producer') {
        response = await producerService.updateOrderStatus(order._id, payload);
      } else if (user.userType === 'transformer') {
        response = await transformerService.updateOrderStatus(order._id, payload);
      } else if (user.userType === 'restaurateur') {
        response = await restaurateurService.updateOrderStatus(order._id, payload);
      } else {
        response = await orderService.updateOrderStatus(order._id, payload);
      }

      // Gérer la réponse selon le contexte (admin ou utilisateur normal)
      const isSuccess = isAdminContext 
        ? (response.status === 'success' || response.success)
        : response.data.status === 'success';
      
      if (isSuccess) {
        await loadOrderDetails();
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut vers ${newStatus}:`, error);
    } finally {
      setUpdating(false);
    }
  };

  const confirmOrder = () => updateOrderStatus('confirmed');
  const cancelOrder = () => updateOrderStatus('cancelled');
  const prepareOrder = () => updateOrderStatus('preparing');
  const readyOrder = () => updateOrderStatus('ready-for-pickup');
  const shipOrder = () => updateOrderStatus('in-transit');
  const deliverOrder = () => updateOrderStatus('delivered');
  const completeOrder = () => updateOrderStatus('completed');

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

  const getItemStatusConfig = (status = 'pending') => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-700',
        text: 'En attente'
      },
      confirmed: {
        color: 'bg-green-100 text-green-700',
        text: 'Confirmé'
      },
      preparing: {
        color: 'bg-purple-100 text-purple-700',
        text: 'En préparation'
      },
      'ready-for-pickup': {
        color: 'bg-orange-100 text-orange-700',
        text: 'Prête pour collecte'
      },
      'in-transit': {
        color: 'bg-blue-100 text-blue-700',
        text: 'En transit'
      },
      delivered: {
        color: 'bg-green-100 text-green-700',
        text: 'Livré'
      },
      completed: {
        color: 'bg-emerald-100 text-emerald-700',
        text: 'Terminé'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-600',
        text: 'Annulé'
      },
      rejected: {
        color: 'bg-red-100 text-red-600',
        text: 'Rejeté'
      },
      refunded: {
        color: 'bg-red-100 text-red-600',
        text: 'Remboursé'
      },
      disputed: {
        color: 'bg-red-100 text-red-600',
        text: 'En litige'
      }
    };

    return configs[status] || configs.pending;
  };

  const isAdmin = user?.role === 'admin' || user?.userType === 'admin';
  const buyerId =
    order?.buyer?._id?.toString?.() ||
    order?.buyer?.id?.toString?.() ||
    (typeof order?.buyer?.toString === 'function' ? order.buyer.toString() : null);
  const userId = user?._id?.toString?.() || user?.id?.toString?.();
  const isBuyerView = user?.userType === 'consumer' && buyerId && userId && buyerId === userId;

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
      <div>
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
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
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
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSellerView = ['producer', 'transformer', 'restaurateur'].includes(user?.userType);
  const displayedStatus = order.segment?.status || order.status;
  const statusConfig = getStatusConfig(displayedStatus);
  const StatusIcon = statusConfig.icon;
  const deliveryFee = order.originalTotals?.deliveryFee ?? order.deliveryFee ?? order.delivery?.deliveryFee ?? 0;
  const deliveryDetail = order.originalTotals?.deliveryFeeDetail || order.deliveryFeeDetail || order.delivery?.feeDetail || null;
  const deliveryMethodLabels = {
    pickup: 'Retrait sur place',
    'standard-delivery': 'Livraison standard',
    'express-delivery': 'Livraison express',
    'same-day': 'Livraison jour même',
    'scheduled': 'Livraison programmée'
  };

  return (
    <div>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
            <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </button>
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
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
              >
                <FiRefreshCw className="h-4 w-4 mr-1" />
                Actualiser
              </button>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                {isSellerView && displayedStatus === 'pending' && (
                  <button
                    onClick={cancelOrder}
                    disabled={updating}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiXCircle className="h-4 w-4 mr-1" />
                    Annuler
                  </button>
                )}
                {isSellerView && displayedStatus === 'confirmed' && (
                  <button
                    onClick={prepareOrder}
                    disabled={updating}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTruck className="h-4 w-4 mr-1" />
                    {updating ? 'Préparation...' : 'Commencer préparation'}
                  </button>
                )}
                {isSellerView && displayedStatus === 'preparing' && (
                  <button
                    onClick={readyOrder}
                    disabled={updating}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTruck className="h-4 w-4 mr-1" />
                    {updating ? 'Préparation...' : 'Prête pour collecte'}
                  </button>
                )}
                {isSellerView && displayedStatus === 'ready-for-pickup' && (
                  <button
                    onClick={shipOrder}
                    disabled={updating}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTruck className="h-4 w-4 mr-1" />
                    {updating ? 'Expédition...' : 'Expédier'}
                  </button>
                )}
                {isAdmin && displayedStatus === 'in-transit' && (
                  <button
                    onClick={deliverOrder}
                    disabled={updating}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCheckCircle className="h-4 w-4 mr-1" />
                    {updating ? 'Confirmation...' : 'Confirmer la livraison'}
                  </button>
                )}
                {isBuyerView && displayedStatus === 'delivered' && (
                  <button
                    onClick={completeOrder}
                    disabled={updating}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCheckCircle className="h-4 w-4 mr-1" />
                    {updating ? 'Validation...' : 'Marquer terminée'}
                  </button>
                )}
              </div>
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
                {(isSellerView ? (order.segment?.items || order.items || []) : (order.items || [])).map((item, index) => {
                   // Gérer différentes structures de données (admin vs utilisateur normal)
                   const productData = item.product || item.productSnapshot || {};
                   const productSnapshot = item.productSnapshot || {};
                   const productName = productData.name || productSnapshot.name || item.name || 'Produit inconnu';
                   const productImages = productData.images || productSnapshot.images || item.images || [];
                   const productPrice = productSnapshot.price || item.price || item.unitPrice || 0;
                   const productUnit = productSnapshot.unit || item.unit || 'unité';
                   const quantity = item.quantity || 1;
                   const totalPrice = item.totalPrice || (productPrice * quantity);
                   
                   // Gestion des images - peut être un tableau de strings, objets, ou URLs
                   let imageUrl = null;
                   let imageAlt = null;
                   
                   if (productImages && productImages.length > 0) {
                     const firstImg = productImages[0];
                     
                     // Si c'est une chaîne
                     if (typeof firstImg === 'string') {
                       // Si c'est une URL directe (commence par http)
                       if (firstImg.startsWith('http') || firstImg.startsWith('//')) {
                         imageUrl = firstImg;
                         imageAlt = parseProductName(productName);
                       } 
                       // Si c'est une chaîne JSON, la parser
                       else {
                         try {
                           const parsedImg = JSON.parse(firstImg);
                           if (parsedImg && parsedImg.url) {
                             imageUrl = parsedImg.url;
                             imageAlt = parsedImg.alt || parseProductName(productName);
                           } else if (parsedImg && typeof parsedImg === 'string') {
                             imageUrl = parsedImg;
                             imageAlt = parseProductName(productName);
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
                         }
                       }
                     }
                     // Si c'est un objet avec une propriété url
                     else if (firstImg && typeof firstImg === 'object') {
                       if (firstImg.url) {
                         imageUrl = firstImg.url;
                         imageAlt = firstImg.alt || parseProductName(productName);
                       } else if (firstImg.secure_url) {
                         imageUrl = firstImg.secure_url;
                         imageAlt = firstImg.alt || parseProductName(productName);
                       } else if (firstImg.public_id) {
                         // Cloudinary public_id, construire l'URL
                         imageUrl = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'harvests'}/image/upload/${firstImg.public_id}`;
                         imageAlt = firstImg.alt || parseProductName(productName);
                       }
                     }
                   }
                   

                  const currentSegmentStatus = order.segment?.status || order.status;
                  const itemStatus = item.status || 'pending';
                  const itemStatusConfig = getItemStatusConfig(itemStatus);
                  const itemId = item._id || item.id || `${order._id}-${index}`;
                  const canConfirmItem = Boolean(
                    isSellerView &&
                    currentSegmentStatus === 'pending' &&
                    itemStatus === 'pending' &&
                    item._id
                  );

                  return (
                    <div key={itemId} className="p-4 border border-gray-200 rounded-lg bg-gray-50/40">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                            {imageUrl ? (
                              <CloudinaryImage
                                src={imageUrl}
                                alt={imageAlt || parseProductName(productName)}
                                className="h-full w-full object-cover"
                                fallback={
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FiPackage className="h-8 w-8 text-gray-400" />
                                  </div>
                                }
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <FiPackage className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
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
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            Total: {totalPrice.toLocaleString('fr-FR')} FCFA
                          </p>
                          <div className="flex items-center flex-wrap gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${itemStatusConfig.color}`}
                            >
                              {itemStatusConfig.text}
                            </span>
                            {canConfirmItem && (
                              <button
                                onClick={() => updateOrderStatus('confirmed', { itemId: item._id })}
                                disabled={updating}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiCheckCircle className="h-3.5 w-3.5 mr-1" />
                                {updating ? 'Confirmation...' : 'Confirmer'}
                              </button>
                            )}
                          </div>
                        </div>
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
                    <div className="mt-3 p-3 bg-harvests-light rounded-md">
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
                    {formatCurrency(
                      isSellerView
                        ? (order.segment?.subtotal ?? order.subtotal ?? 0)
                        : (order.subtotal ?? order.originalTotals?.subtotal ?? (order.total - deliveryFee + (order.couponDiscount || 0)))
                    )} FCFA
                  </span>
                </div>
                
                {((!isSellerView && deliveryFee > 0) || (isSellerView && (order.segment?.deliveryFee ?? 0) > 0)) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="text-gray-900">
                      {formatCurrency(isSellerView ? (order.segment?.deliveryFee ?? 0) : deliveryFee)} FCFA
                    </span>
                  </div>
                )}
                {deliveryFee > 0 && !isSellerView && deliveryDetail?.reason && (
                  <p className="text-xs text-gray-500 text-right">
                    {deliveryDetail.reason}
                  </p>
                )}
                
                {(order.couponDiscount > 0 || (isSellerView && order.segment?.discount > 0)) && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>
                      -{formatCurrency(
                        isSellerView
                          ? (order.segment?.discount ?? 0)
                          : (order.couponDiscount ?? 0)
                      )} FCFA
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-medium text-gray-900">
                      {formatCurrency(
                        isSellerView
                          ? (order.segment?.total ?? order.segment?.subtotal ?? order.subtotal ?? 0)
                          : (order.total ?? 0)
                      )} FCFA
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
                      {deliveryMethodLabels[order.delivery?.method] || 'Mode de livraison'}
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
    </div>
  );
};

export default OrderDetail;
