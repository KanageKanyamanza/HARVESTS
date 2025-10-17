import React from 'react';
import { Link } from 'react-router-dom';
import { parseProductName } from '../../utils/productUtils';
import {
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiPackage,
  FiCalendar,
  FiUser,
  FiMapPin
} from 'react-icons/fi';

const OrderList = ({ 
  orders = [], 
  userType = 'consumer', 
  onUpdateStatus,
  loading = false,
  updatingOrders = new Set()
}) => {
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
    return configs[status] || configs['pending'];
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
      // Côté consumer : afficher les infos du vendeur
      const seller = order.seller;
      if (seller) {
        const name = seller.firstName && seller.lastName 
          ? `${seller.firstName} ${seller.lastName}` 
          : seller.farmName || seller.companyName || seller.name || 'Vendeur';
        return { name, email: seller.email, phone: seller.phone };
      }
      return { name: 'Vendeur inconnu' };
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
        
        const statusConfig = getStatusConfig(order.status);
        const StatusIcon = statusConfig.icon;
        const clientInfo = getClientInfo(order);

        return (
          <div key={order._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600">
                  {userType === 'producer' || userType === 'transformer' ? 'Client' : 'Vendeur'} • {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusConfig.text}
                </span>
                <Link
                  to={userType === 'transformer' ? `/transformer/orders/${order._id}` : `/orders/${order._id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
                >
                  <FiEye className="h-4 w-4 mr-1" />
                  Voir
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Articles</h4>
                <div className="space-y-2">
                  {order.items?.map((item, index) => {
                    // Récupération sécurisée des données du produit
                    const productSnapshot = item.productSnapshot || {};
                    const productName = productSnapshot.name || item.name || 'Produit inconnu';
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
                    
                    return (
                      <div key={index} className="flex items-center space-x-3">
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
                          <div className="h-full w-full flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
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
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {userType === 'producer' || userType === 'transformer' ? 'Client' : 'Vendeur'}
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <FiUser className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{clientInfo.name}</span>
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
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Total: </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {order.total?.toLocaleString('fr-FR')} FCFA
                  </span>
                  {order.delivery?.deliveryFee > 0 && (
                    <span className="text-xs text-gray-500 block">
                      Frais de livraison: {order.delivery.deliveryFee.toLocaleString('fr-FR')} FCFA
                    </span>
                  )}
                </div>
                
                {(userType === 'producer' || userType === 'transformer') && onUpdateStatus && (
                  <div className="flex space-x-2">
                    {order.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(order._id, 'confirmed')}
                          disabled={updatingOrders.has(order._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiCheckCircle className="h-4 w-4 mr-2" />
                          {updatingOrders.has(order._id) ? 'Confirmation...' : 'Confirmer'}
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(order._id, 'cancelled')}
                          disabled={updatingOrders.has(order._id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiXCircle className="h-4 w-4 mr-2" />
                          Annuler
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'preparing')}
                        disabled={updatingOrders.has(order._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTruck className="h-4 w-4 mr-2" />
                        {updatingOrders.has(order._id) ? 'Préparation...' : 'Commencer préparation'}
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'in-transit')}
                        disabled={updatingOrders.has(order._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTruck className="h-4 w-4 mr-2" />
                        {updatingOrders.has(order._id) ? 'Expédition...' : 'Expédier'}
                      </button>
                    )}
                    {order.status === 'in-transit' && (
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'delivered')}
                        disabled={updatingOrders.has(order._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheckCircle className="h-4 w-4 mr-2" />
                        {updatingOrders.has(order._id) ? 'Livraison...' : 'Marquer livrée'}
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'completed')}
                        disabled={updatingOrders.has(order._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheckCircle className="h-4 w-4 mr-2" />
                        {updatingOrders.has(order._id) ? 'Finalisation...' : 'Marquer terminée'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;
