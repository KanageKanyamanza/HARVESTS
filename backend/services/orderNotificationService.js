const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { buildOrderUrl } = require('./orderService');

/**
 * Service pour les notifications de commandes
 */

async function sendStatusNotifications(order, newStatus) {
  const User = mongoose.model('User');
  
  // Notifications pour l'acheteur
  const buyerNotifications = {
    confirmed: {
      type: 'order_confirmed',
      category: 'order',
      title: 'Commande confirmée',
      message: `Votre commande ${order.orderNumber} a été confirmée par le vendeur`
    },
    preparing: {
      type: 'order_preparing',
      category: 'order',
      title: 'Commande en préparation',
      message: `Votre commande ${order.orderNumber} est en cours de préparation`
    },
    'ready-for-pickup': {
      type: 'order_ready_for_pickup',
      category: 'order',
      title: 'Commande prête',
      message: `Votre commande ${order.orderNumber} est prête pour la collecte`
    },
    'in-transit': {
      type: 'order_in_transit',
      category: 'order',
      title: 'Commande en transit',
      message: `Votre commande ${order.orderNumber} est en route`
    },
    delivered: {
      type: 'order_delivered',
      category: 'order',
      title: 'Commande livrée',
      message: `Votre commande ${order.orderNumber} a été livrée`
    },
    completed: {
      type: 'order_completed',
      category: 'order',
      title: 'Commande terminée',
      message: `Votre commande ${order.orderNumber} est terminée. Merci pour votre achat !`
    },
    cancelled: {
      type: 'order_cancelled',
      category: 'order',
      title: 'Commande annulée',
      message: `Votre commande ${order.orderNumber} a été annulée`
    },
    refunded: {
      type: 'order_refunded',
      category: 'order',
      title: 'Commande remboursée',
      message: `Votre commande ${order.orderNumber} a été remboursée`
    },
    disputed: {
      type: 'order_disputed',
      category: 'order',
      title: 'Commande en litige',
      message: `Un litige a été ouvert pour votre commande ${order.orderNumber}`
    }
  };

  // Notifications pour les vendeurs
  const sellerNotifications = {
    confirmed: {
      type: 'order_confirmed_seller',
      category: 'order',
      title: 'Commande confirmée',
      message: `Vous avez confirmé la commande ${order.orderNumber}`
    },
    preparing: {
      type: 'order_preparing_seller',
      category: 'order',
      title: 'Commande en préparation',
      message: `La commande ${order.orderNumber} est maintenant en préparation`
    },
    'ready-for-pickup': {
      type: 'order_ready_for_pickup_seller',
      category: 'order',
      title: 'Commande prête pour collecte',
      message: `La commande ${order.orderNumber} est prête pour la collecte par le transporteur`
    },
    'in-transit': {
      type: 'order_in_transit_seller',
      category: 'order',
      title: 'Commande en transit',
      message: `La commande ${order.orderNumber} a été prise en charge par le transporteur`
    },
    delivered: {
      type: 'order_delivered_seller',
      category: 'order',
      title: 'Commande livrée',
      message: `La commande ${order.orderNumber} a été livrée au client`
    },
    completed: {
      type: 'order_completed_seller',
      category: 'order',
      title: 'Commande terminée',
      message: `La commande ${order.orderNumber} est terminée. Paiement reçu.`
    },
    cancelled: {
      type: 'order_cancelled_seller',
      category: 'order',
      title: 'Commande annulée',
      message: `La commande ${order.orderNumber} a été annulée`
    }
  };

  // Notifications pour le transporteur
  const transporterNotifications = {
    confirmed: {
      type: 'order_confirmed_transporter',
      category: 'order',
      title: 'Commande confirmée',
      message: `La commande ${order.orderNumber} a été confirmée. Préparez-vous pour la collecte.`
    },
    preparing: {
      type: 'order_preparing_transporter',
      category: 'order',
      title: 'Commande en préparation',
      message: `La commande ${order.orderNumber} est en cours de préparation par le vendeur.`
    },
    'ready-for-pickup': {
      type: 'order_ready_for_pickup_transporter',
      category: 'order',
      title: 'Nouvelle collecte disponible',
      message: `Une commande ${order.orderNumber} est prête pour collecte`
    },
    'in-transit': {
      type: 'order_in_transit_transporter',
      category: 'order',
      title: 'Commande en transit',
      message: `Vous transportez la commande ${order.orderNumber}`
    },
    delivered: {
      type: 'order_delivered_transporter',
      category: 'order',
      title: 'Livraison effectuée',
      message: `Vous avez livré la commande ${order.orderNumber} avec succès`
    },
    completed: {
      type: 'order_completed_transporter',
      category: 'order',
      title: 'Commande terminée',
      message: `La commande ${order.orderNumber} est terminée. Les frais de livraison vous seront versés.`
    },
    cancelled: {
      type: 'order_cancelled_transporter',
      category: 'order',
      title: 'Commande annulée',
      message: `La commande ${order.orderNumber} a été annulée`
    },
    disputed: {
      type: 'order_disputed_transporter',
      category: 'order',
      title: 'Commande en litige',
      message: `Un litige a été ouvert pour la commande ${order.orderNumber}`
    }
  };

  const getIdString = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    if (typeof value === 'object' && typeof value.toString === 'function') {
      return value.toString();
    }
    return null;
  };

  const sellerIds = new Set();
  const pushSellerId = (value) => {
    const id = getIdString(value);
    if (id) {
      sellerIds.add(id);
    }
  };

  pushSellerId(order.seller);

  const segmentInfoMap = new Map();
  (order.segments || []).forEach(segment => {
    const sellerKey = getIdString(segment?.seller);
    if (sellerKey) {
      pushSellerId(sellerKey);
      segmentInfoMap.set(sellerKey, {
        status: segment.status || null,
        segmentId: segment._id?.toString?.() || null
      });
    }
  });

  (order.items || []).forEach(item => {
    pushSellerId(item?.seller);
  });

  const sellerInfoCache = new Map();
  const getSellerInfo = async (sellerId) => {
    if (!sellerId) return null;
    if (sellerInfoCache.has(sellerId)) {
      return sellerInfoCache.get(sellerId);
    }

    const seller = await User.findById(sellerId).select('firstName lastName companyName farmName restaurantName businessName name userType');
    if (!seller) {
      sellerInfoCache.set(sellerId, null);
      return null;
    }

    const displayName = seller.farmName || seller.companyName || seller.restaurantName || seller.businessName || seller.name || `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Vendeur';
    const info = {
      id: sellerId,
      name: displayName,
      userType: seller.userType || null
    };
    sellerInfoCache.set(sellerId, info);
    return info;
  };

  const items = Array.isArray(order.items) ? order.items : [];
  const productsDetails = [];

  for (const item of items) {
    const images = item.productSnapshot?.images || [];
    const productName = item.productSnapshot?.name || 'Produit';
    const productDescription = item.productSnapshot?.description || '';

    const sellerId = getIdString(item.seller) || getIdString(item.productSnapshot?.producer) || getIdString(item.productSnapshot?.transformer) || getIdString(item.productSnapshot?.restaurateur);
    const sellerInfo = sellerId ? await getSellerInfo(sellerId) : null;
    const segmentInfo = sellerId ? segmentInfoMap.get(sellerId) : null;
    if (segmentInfo && sellerInfo?.name) {
      segmentInfoMap.set(sellerId, {
        ...segmentInfo,
        sellerName: sellerInfo.name
      });
    }

    const productStatus = item.status || segmentInfo?.status || order.status || newStatus || 'pending';

    productsDetails.push({
      name: productName,
      description: productDescription,
      images: Array.isArray(images) ? images : [],
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || 0,
      status: productStatus,
      seller: sellerId ? {
        id: sellerId,
        name: sellerInfo?.name || null,
        type: sellerInfo?.userType || null
      } : null,
      segment: segmentInfo ? {
        id: segmentInfo.segmentId || null,
        status: segmentInfo.status || null,
        sellerId,
        sellerName: segmentInfo.sellerName || sellerInfo?.name || null
      } : null
    });
  }

  // Notifier l'acheteur
  const buyerNotification = buyerNotifications[newStatus];
  if (buyerNotification && order.buyer) {
    const buyerId = order.buyer._id || order.buyer;
    const buyerOrderUrl = await buildOrderUrl(buyerId, order._id);
    await Notification.createNotification({
      recipient: order.buyer,
      ...buyerNotification,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: order.currency,
        status: newStatus,
        products: productsDetails
      },
      actions: [{
        type: 'view',
        label: 'Voir la commande',
        url: buyerOrderUrl
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
  }

  // Récupérer les informations du client
  let buyerInfo = null;
  if (order.buyer) {
    const buyerId = order.buyer._id || order.buyer;
    const buyer = await User.findById(buyerId).select('firstName lastName email phone');
    if (buyer) {
      buyerInfo = {
        firstName: buyer.firstName || '',
        lastName: buyer.lastName || '',
        fullName: `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Client',
        email: buyer.email || '',
        phone: buyer.phone || ''
      };
    }
  }

  // Notifier tous les vendeurs concernés
  const sellerNotification = sellerNotifications[newStatus];
  if (sellerNotification && sellerIds.size > 0) {
    const sellerNotificationsPromises = Array.from(sellerIds).map(async (sellerId) => {
      const sellerOrderUrl = await buildOrderUrl(sellerId, order._id);
      const segmentInfo = segmentInfoMap.get(sellerId) || null;
      const sellerProducts = productsDetails.filter((product) => product.seller?.id === sellerId);
      const productsForSeller = sellerProducts.length > 0 ? sellerProducts : productsDetails;
      const sellerAmount = productsForSeller.reduce((sum, product) => sum + (Number(product.totalPrice) || 0), 0);
      return Notification.createNotification({
        recipient: sellerId,
        ...sellerNotification,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: sellerAmount || order.total,
          currency: order.currency,
          status: segmentInfo?.status || newStatus,
          buyer: buyerInfo,
          segment: segmentInfo ? {
            id: segmentInfo.segmentId || null,
            status: segmentInfo.status || null,
            sellerId,
            sellerName: segmentInfo.sellerName || sellerProducts[0]?.seller?.name || null
          } : null,
          products: productsForSeller
        },
        actions: [{
          type: 'view',
          label: 'Voir la commande',
          url: sellerOrderUrl
        }],
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: true }
        }
      });
    });
    await Promise.all(sellerNotificationsPromises);
  }

  // Notifier le transporteur si applicable
  const transporterNotification = transporterNotifications[newStatus];
  if (transporterNotification && order.delivery?.transporter) {
    const transporterId = order.delivery.transporter._id || order.delivery.transporter;
    const transporterOrderUrl = await buildOrderUrl(transporterId, order._id);
    
    const transporter = await User.findById(transporterId).select('firstName lastName companyName email phone userType');
    const transporterName = transporter?.companyName || 
      (transporter?.firstName && transporter?.lastName ? `${transporter.firstName} ${transporter.lastName}` : 'Livreur');
    
    await Notification.createNotification({
      recipient: order.delivery.transporter,
      ...transporterNotification,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: newStatus,
        amount: order.deliveryFee || order.delivery?.deliveryFee || 0,
        currency: order.currency,
        deliveryFee: order.deliveryFee || order.delivery?.deliveryFee || 0,
        buyer: buyerInfo
      },
      actions: [{
        type: 'view',
        label: 'Voir la commande',
        url: transporterOrderUrl
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
  }
}

module.exports = {
  sendStatusNotifications
};

