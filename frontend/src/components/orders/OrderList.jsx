import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { parseProductName } from '../../utils/productUtils';
import { toPlainText } from '../../utils/textHelpers';
import {
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiPackage,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const OrderList = ({
  orders = [],
  userType = 'consumer',
  onUpdateStatus,
  loading = false,
  updatingOrders = new Set()
}) => {
  // Référence pour suivre les IDs de commandes déjà initialisées
  const initializedOrderIds = useRef(new Set());

  // Par défaut, toutes les commandes sont réduites
  const [collapsedOrders, setCollapsedOrders] = useState(() => {
    const initialCollapsed = new Set();
    orders.forEach(order => {
      if (order && order._id) {
        initialCollapsed.add(order._id);
        initializedOrderIds.current.add(order._id);
      }
    });
    return initialCollapsed;
  });

  // Synchroniser l'état collapsed avec les nouvelles commandes qui arrivent
  // Ne réinitialise que les nouvelles commandes, préserve l'état des commandes existantes
  useEffect(() => {
    setCollapsedOrders(prev => {
      const newSet = new Set(prev);
      // Ajouter uniquement les nouvelles commandes (pas encore initialisées) à l'état collapsed par défaut
      orders.forEach(order => {
        if (order && order._id && !initializedOrderIds.current.has(order._id)) {
          newSet.add(order._id);
          initializedOrderIds.current.add(order._id);
        }
      });
      // Supprimer les commandes qui n'existent plus
      const orderIds = new Set(orders.map(order => order?._id).filter(Boolean));
      newSet.forEach(orderId => {
        if (!orderIds.has(orderId)) {
          newSet.delete(orderId);
          initializedOrderIds.current.delete(orderId);
        }
      });
      return newSet;
    });
  }, [orders]);

  const toggleCollapse = (orderId) => {
    setCollapsedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };
  const isSellerView = ['producer', 'transformer', 'restaurateur'].includes(userType);

  const extractSellerDetails = (order) => {
    const sellersMap = new Map();

    const addSeller = (rawSeller) => {
      if (!rawSeller) return;

      if (typeof rawSeller === 'string') {
        // Impossible de récupérer le nom sans données supplémentaires
        return;
      }

      const sellerObj = typeof rawSeller === 'object' && rawSeller !== null
        ? rawSeller
        : null;

      if (!sellerObj) return;

      const id = sellerObj._id || sellerObj.id || (typeof sellerObj.toString === 'function' ? sellerObj.toString() : null);
      const rawName = sellerObj.farmName
        || sellerObj.companyName
        || (sellerObj.firstName && sellerObj.lastName
          ? `${sellerObj.firstName} ${sellerObj.lastName}`
          : sellerObj.firstName || sellerObj.lastName || sellerObj.name);
      const displayName = toPlainText(rawName, '');

      if (!displayName) return;

      const key = id || displayName;
      if (!sellersMap.has(key)) {
        sellersMap.set(key, {
          id: key,
          name: displayName,
          email: sellerObj.email || null,
          phone: sellerObj.phone || null
        });
      }
    };

    if (order?.segment?.seller) {
      addSeller(order.segment.seller);
    }

    if (Array.isArray(order?.segments)) {
      order.segments.forEach((segment) => addSeller(segment?.seller));
    }

    if (order?.seller) {
      addSeller(order.seller);
    }

    if (Array.isArray(order?.items)) {
      order.items.forEach((item) => addSeller(item?.seller));
    }

    return Array.from(sellersMap.values());
  };

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
      'preparing': { 
        color: 'text-purple-600 bg-purple-100', 
        text: 'En préparation', 
        icon: FiPackage 
      },
      'ready-for-pickup': { 
        color: 'text-orange-600 bg-orange-100', 
        text: 'Prête pour collecte', 
        icon: FiPackage 
      },
      'in-transit': { 
        color: 'text-indigo-600 bg-indigo-100', 
        text: 'En transit', 
        icon: FiTruck 
      },
      'out-for-delivery': { 
        color: 'text-blue-600 bg-blue-100', 
        text: 'En cours de livraison', 
        icon: FiTruck 
      },
      'delivered': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Livrée', 
        icon: FiCheckCircle 
      },
      'completed': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Terminée', 
        icon: FiCheckCircle 
      },
      'cancelled': { 
        color: 'text-red-600 bg-red-100', 
        text: 'Annulée', 
        icon: FiXCircle 
      }
    };
    return configs[status] || configs.pending;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getClientInfo = (order) => {
    const sellers = extractSellerDetails(order);

    if (userType === 'producer' || userType === 'transformer') {
      // Côté producteur/transformateur : afficher les infos du client
      const buyer = order.buyer;
      if (buyer) {
        const name = buyer.firstName && buyer.lastName 
          ? `${buyer.firstName} ${buyer.lastName}` 
          : buyer.name || 'Client';
        return { name, email: buyer.email, phone: buyer.phone };
      }
      return { name: 'Client inconnu' };
    } else {
      // Côté consumer : afficher les informations des vendeurs
      if (sellers.length === 1) {
        return sellers[0];
      }

      if (sellers.length > 1) {
        return {
          name: sellers.map((seller) => seller.name).join(', ')
        };
      }

      return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FiPackage className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {userType === 'producer' || userType === 'transformer' ? 'Aucune commande reçue' : 'Aucune commande'}
        </h3>
        <p className="mt-2 text-gray-600">
          {userType === 'producer' || userType === 'transformer'
            ? 'Vous n\'avez pas encore reçu de commandes.'
            : 'Commencez vos achats pour voir vos commandes ici.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        if (!order || !order._id) return null;
        
        const segmentStatus = order.segment?.status || order.status;
        const statusConfig = getStatusConfig(segmentStatus);
        const StatusIcon = statusConfig.icon;
        const clientInfo = getClientInfo(order) || {};
        const hasClientInfo =
          Boolean(clientInfo.name) ||
          Boolean(clientInfo.email) ||
          Boolean(clientInfo.phone);
        const orderItems = isSellerView
          ? (order.segment?.items || order.items || [])
          : (order.items || []);
        const displayedSubtotal = isSellerView
          ? (order.segment?.subtotal ?? order.subtotal ?? 0)
          : (order.subtotal ?? 0);
        const displayedTotal = isSellerView
          ? (order.segment?.total ?? displayedSubtotal ?? 0)
          : (order.total ?? 0);
        const segmentId = order.segment?.id || order.segment?._id;
        const isOrderUpdating = updatingOrders.has(order._id);

        const isCollapsed = collapsedOrders.has(order._id);

        return (
          <div key={order._id} className="bg-white rounded-lg shadow">
            {/* En-tête de la commande - toujours visible */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleCollapse(order._id)}
                      className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                      title={isCollapsed ? 'Développer' : 'Réduire'}
                    >
                      {isCollapsed ? (
                        <FiChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiChevronUp className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {userType === 'producer' || userType === 'transformer' ? 'Client' : 'Vendeur'} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  {/* Résumé minimal quand collapsed */}
                  {isCollapsed && (
                    <div className="mt-3 ml-8 flex items-center space-x-4 text-sm text-gray-600">
                      <span>{orderItems.length} article{orderItems.length > 1 ? 's' : ''}</span>
                      <span className="font-medium text-gray-900">
                        {displayedTotal.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {statusConfig.text}
                  </span>
                  
                  {/* Boutons de mise à jour de statut - visibles même quand collapsed */}
                  {(isSellerView || userType === 'transporter' || userType === 'exporter') && onUpdateStatus && (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Actions pour les transporteurs/exportateurs */}
                      {(userType === 'transporter' || userType === 'exporter') && (
                        <>
                          {segmentStatus === 'ready-for-pickup' && (
                            <button 
                              onClick={() => onUpdateStatus(order, 'ready-for-pickup', segmentId)}
                              disabled={updatingOrders.has(order._id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiTruck className="h-4 w-4 mr-1" />
                              {updatingOrders.has(order._id) ? 'Collecte...' : 'Collecter'}
                            </button>
                          )}
                          {(order.delivery?.status === 'picked-up') && segmentStatus !== 'in-transit' && segmentStatus !== 'delivered' && (
                            <button 
                              onClick={() => onUpdateStatus(order, 'in-transit', segmentId)}
                              disabled={updatingOrders.has(order._id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiTruck className="h-4 w-4 mr-1" />
                              {updatingOrders.has(order._id) ? 'En cours...' : 'En transit'}
                            </button>
                          )}
                          {segmentStatus === 'in-transit' && (
                            <button 
                              onClick={() => onUpdateStatus(order, 'delivered', segmentId)}
                              disabled={updatingOrders.has(order._id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiCheckCircle className="h-4 w-4 mr-1" />
                              {updatingOrders.has(order._id) ? 'Livraison...' : 'Livrer'}
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Actions pour les vendeurs */}
                      {isSellerView && (
                        <>
                          {segmentStatus === 'pending' && (
                            <button 
                              onClick={() => onUpdateStatus(order, 'cancelled', segmentId)}
                              disabled={updatingOrders.has(order._id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiXCircle className="h-4 w-4 mr-1" />
                              Annuler
                            </button>
                          )}
                          {segmentStatus === 'confirmed' && (
                            <button 
                              onClick={() => onUpdateStatus(order, 'preparing', segmentId)}
                              disabled={updatingOrders.has(order._id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiTruck className="h-4 w-4 mr-1" />
                              {updatingOrders.has(order._id) ? 'Préparation...' : 'Préparer'}
                            </button>
                          )}
                          {segmentStatus === 'preparing' && (
                            <button 
                              onClick={() => onUpdateStatus(order, 'ready-for-pickup', segmentId)}
                              disabled={updatingOrders.has(order._id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiTruck className="h-4 w-4 mr-1" />
                              {updatingOrders.has(order._id) ? 'Préparation...' : 'Prête'}
                            </button>
                          )}
                          {segmentStatus === 'ready-for-pickup' && (
                            <button 
                              onClick={() => onUpdateStatus(order, 'cancelled', segmentId)}
                              disabled={updatingOrders.has(order._id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiXCircle className="h-4 w-4 mr-1" />
                              Annuler
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  <Link
                    to={`/${userType}/orders/${order._id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
                  >
                    <FiEye className="h-4 w-4 mr-1" />
                    Voir
                  </Link>
                </div>
              </div>
            </div>

            {/* Contenu détaillé - masqué si collapsed */}
            {!isCollapsed && (
              <div className="p-6">
                <div className="flex flex-wrap md:flex-row justify-around gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Articles</h4>
                <div className="space-y-2">
                  {orderItems.map((item, index) => {
                    // Récupération sécurisée des données du produit
                    const productSnapshot = item.productSnapshot || {};
                    const productName = toPlainText(productSnapshot.name ?? item.name, 'Produit inconnu');
                    const productImages = productSnapshot.images || [];
                    
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
                    
                    const productPrice = productSnapshot.price || item.unitPrice || item.price || 0;
                    const quantity = item.quantity || 1;
                    const totalPrice = item.totalPrice || (productPrice * quantity);
                    
                    const itemStatus = item.status || 'pending';
                    const itemStatusConfig = getItemStatusConfig(itemStatus);
                    const itemId = item._id || item.id || `${order._id}-${index}`;
                    const canConfirmItem = Boolean(
                      isSellerView &&
                      segmentStatus === 'pending' &&
                      itemStatus === 'pending' &&
                      onUpdateStatus &&
                      item._id
                    );

                    return (
                      <div
                        key={itemId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-md p-3 bg-gray-50/30"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
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
                            <div
                              className="h-full w-full flex items-center justify-center"
                              style={{ display: imageUrl ? 'none' : 'flex' }}
                            >
                              <FiPackage className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-900 font-medium block truncate">
                              {parseProductName(productName)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Quantité: {quantity} • {totalPrice.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${itemStatusConfig.color}`}
                          >
                            {itemStatusConfig.text}
                          </span>
                          {canConfirmItem && (
                            <button
                              onClick={() => onUpdateStatus(order, 'confirmed', segmentId, { itemId: item._id })}
                              disabled={isOrderUpdating}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiCheckCircle className="h-3.5 w-3.5 mr-1" />
                              {isOrderUpdating ? 'Confirmation...' : 'Confirmer'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {(isSellerView || hasClientInfo) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {userType === 'producer' || userType === 'transformer' ? 'Client' : 'Vendeur'}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <FiUser className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {clientInfo.name ||
                          (isSellerView ? 'Client inconnu' : 'Vendeur non disponible')}
                      </span>
                    </div>
                    {clientInfo.email && (
                      <div className="text-xs text-gray-500">
                        {clientInfo.email}
                      </div>
                    )}
                    {clientInfo.phone && (
                      <div className="text-xs text-gray-500">
                        {clientInfo.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Livraison</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {order.delivery?.deliveryAddress ? (
                    <>
                      <div className="flex items-start">
                        <FiMapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {order.delivery.deliveryAddress.firstName && order.delivery.deliveryAddress.lastName && 
                              `${order.delivery.deliveryAddress.firstName} ${order.delivery.deliveryAddress.lastName}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.delivery.deliveryAddress.street && `${order.delivery.deliveryAddress.street}, `}
                            {order.delivery.deliveryAddress.city || 'Ville non spécifiée'}
                            {order.delivery.deliveryAddress.region && `, ${order.delivery.deliveryAddress.region}`}
                          </p>
                        </div>
                      </div>
                      {order.delivery.deliveryAddress.phone && (
                        <p className="text-xs text-gray-500">
                          Tél: {order.delivery.deliveryAddress.phone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Adresse de livraison non disponible</p>
                  )}
                  <p className="flex items-center">
                    <FiTruck className="h-4 w-4 mr-1" />
                    {order.delivery?.method === 'express-delivery' ? 'Livraison Express' : 'Livraison Standard'}
                  </p>
                  {order.delivery?.estimatedDeliveryDate && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <FiCalendar className="h-3 w-3 mr-1" />
                      Livraison prévue: {formatDate(order.delivery.estimatedDeliveryDate)}
                    </p>
                  )}
                  {order.deliveryFee > 0 && (userType === 'transporter' || userType === 'exporter') && (
                    <p className="text-xs font-medium text-green-600 flex items-center mt-2">
                      💰 Frais de livraison: {order.deliveryFee.toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                  {/* Timeline de livraison */}
                  {order.delivery?.timeline && order.delivery.timeline.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Historique de livraison:</p>
                      <div className="space-y-2">
                        {order.delivery.timeline.map((event, idx) => (
                          <div key={idx} className="flex items-start text-xs">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                            <div className="flex-1">
                              <p className="text-gray-700 font-medium">
                                {event.status === 'picked-up' ? 'Collectée' : 
                                 event.status === 'in-transit' ? 'En transit' : 
                                 event.status === 'delivered' ? 'Livrée' : 
                                 event.status}
                              </p>
                              <p className="text-gray-500">
                                {formatDate(event.timestamp)}
                                {event.location && ` • ${event.location}`}
                              </p>
                              {event.note && (
                                <p className="text-gray-400 italic mt-1">{event.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Total: </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {displayedTotal.toLocaleString('fr-FR')} FCFA
                      </span>
                      {order.delivery?.deliveryFee > 0 && (
                        <span className="text-xs text-gray-500 block">
                          Frais de livraison: {order.delivery.deliveryFee.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </div>
                    
                    {(isSellerView || userType === 'transporter' || userType === 'exporter') && onUpdateStatus && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                    {/* Actions pour les transporteurs/exportateurs - Limitées selon les règles métier */}
                    {(userType === 'transporter' || userType === 'exporter') && (
                      <>
                        {/* Livreurs peuvent collecter seulement quand la commande est prête pour collecte */}
                        {segmentStatus === 'ready-for-pickup' && (
                          <button 
                            onClick={() => onUpdateStatus(order, 'ready-for-pickup', segmentId)}
                            disabled={updatingOrders.has(order._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiTruck className="h-4 w-4 mr-2" />
                            {updatingOrders.has(order._id) ? 'Collecte...' : 'Marquer collectée'}
                          </button>
                        )}
                        {/* Livreurs peuvent mettre en transit seulement après avoir collecté et pas encore en transit */}
                        {(order.delivery?.status === 'picked-up') && segmentStatus !== 'in-transit' && segmentStatus !== 'delivered' && (
                          <button 
                            onClick={() => onUpdateStatus(order, 'in-transit', segmentId)}
                            disabled={updatingOrders.has(order._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiTruck className="h-4 w-4 mr-2" />
                            {updatingOrders.has(order._id) ? 'En cours...' : 'Marquer en transit'}
                          </button>
                        )}
                        {/* Livreurs peuvent livrer seulement quand en transit */}
                        {segmentStatus === 'in-transit' && (
                          <button 
                            onClick={() => onUpdateStatus(order, 'delivered', segmentId)}
                            disabled={updatingOrders.has(order._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiCheckCircle className="h-4 w-4 mr-2" />
                            {updatingOrders.has(order._id) ? 'Livraison...' : 'Marquer livrée'}
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Actions pour les vendeurs */}
                    {isSellerView && (
                      <>
                        {segmentStatus === 'pending' && (
                          <button 
                            onClick={() => onUpdateStatus(order, 'cancelled', segmentId)}
                            disabled={updatingOrders.has(order._id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiXCircle className="h-4 w-4 mr-2" />
                            Annuler
                          </button>
                        )}
                        {segmentStatus === 'confirmed' && (
                          <button 
                            onClick={() => onUpdateStatus(order, 'preparing', segmentId)}
                            disabled={updatingOrders.has(order._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiTruck className="h-4 w-4 mr-2" />
                            {updatingOrders.has(order._id) ? 'Préparation...' : 'Commencer préparation'}
                          </button>
                        )}
                        {segmentStatus === 'preparing' && (
                          <button 
                            onClick={() => onUpdateStatus(order, 'ready-for-pickup', segmentId)}
                            disabled={updatingOrders.has(order._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiTruck className="h-4 w-4 mr-2" />
                            {updatingOrders.has(order._id) ? 'Préparation...' : 'Prête pour collecte'}
                          </button>
                        )}
                        {/* Vendeurs peuvent annuler jusqu'à ce que la commande soit en transit */}
                        {segmentStatus === 'ready-for-pickup' && (
                          <button 
                            onClick={() => onUpdateStatus(order, 'cancelled', segmentId)}
                            disabled={updatingOrders.has(order._id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiXCircle className="h-4 w-4 mr-2" />
                            Annuler
                          </button>
                        )}
                        {/* Vendeurs ne peuvent plus rien faire une fois que la commande est en transit */}
                      </>
                    )}
                  </div>
                )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;
