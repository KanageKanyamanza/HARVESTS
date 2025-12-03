const mongoose = require('mongoose');
const { toPlainText } = require('../../utils/localization');
const { buildFrontendUrl } = require('./notificationHelpers');

// Méthodes pour créer des notifications spécifiques
function addNotificationCreators(notificationSchema) {
  notificationSchema.statics.notifyOrderCreated = async function(order) {
    const User = mongoose.model('User');
    const sellerIds = new Set();

    const getIdString = (value) => {
      if (!value) return null;
      if (typeof value === 'string') return value;
      if (value._id) return value._id.toString();
      if (typeof value === 'object' && typeof value.toString === 'function') {
        return value.toString();
      }
      return null;
    };

    const pushSellerId = (value) => {
      const id = getIdString(value);
      if (id) {
        sellerIds.add(id);
      }
    };

    pushSellerId(order.seller);

    const segmentInfoMap = new Map();

    (order.segments || []).forEach((segment) => {
      const sellerKey = getIdString(segment?.seller);
      if (sellerKey) {
        pushSellerId(sellerKey);
        segmentInfoMap.set(sellerKey, {
          status: segment.status || null,
          segmentId: segment._id?.toString?.() || null
        });
      }
    });

    if (sellerIds.size === 0 && Array.isArray(order.items)) {
      order.items.forEach((item) => pushSellerId(item?.seller));
    }

    // Récupérer les informations du client (buyer)
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

    // Préparer les détails des produits avec segments et vendeurs
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

    const productsDetails = [];
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
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

        const productStatus = item.status || segmentInfo?.status || order.status || 'pending';

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
    }

    const notifications = [];

    // Fonction pour construire l'URL de commande selon le type d'utilisateur
    const buildOrderUrl = async (userId) => {
      const user = await User.findById(userId).select('userType');
      if (!user) {
        // Par défaut, utiliser /consumer/orders/ si l'utilisateur n'est pas trouvé
        return buildFrontendUrl(`/consumer/orders/${order._id}`);
      }
      
      const userType = user.userType;
      // Mapper les types d'utilisateurs aux routes appropriées
      const routeMap = {
        'consumer': '/consumer/orders',
        'restaurateur': '/restaurateur/orders',
        'producer': '/producer/orders',
        'transformer': '/transformer/orders',
        'exporter': '/exporter/orders',
        'transporter': '/transporter/orders'
      };
      
      const baseRoute = routeMap[userType] || '/consumer/orders';
      return buildFrontendUrl(`${baseRoute}/${order._id}`);
    };

    // Notifier tous les vendeurs concernés
    if (sellerIds.size > 0) {
      const sellerNotificationsPromises = Array.from(sellerIds).map(async (sellerId) => {
        const orderUrl = await buildOrderUrl(sellerId);
        const sellerInfo = await getSellerInfo(sellerId);
        const segmentInfo = segmentInfoMap.get(sellerId) || null;
        const sellerProducts = productsDetails.filter((product) => product.seller?.id === sellerId);
        const productsForSeller = sellerProducts.length > 0 ? sellerProducts : productsDetails;
        const sellerAmount = productsForSeller.reduce((sum, product) => sum + (Number(product.totalPrice) || 0), 0);
        return this.createNotification({
          recipient: sellerId,
          type: 'order_created',
          category: 'order',
          title: 'Nouvelle commande reçue',
          message: `Vous avez reçu une nouvelle commande (${order.orderNumber}) d'un montant de ${sellerAmount || order.total} ${order.currency}${buyerInfo ? ` de ${buyerInfo.fullName}` : ''}`,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            amount: sellerAmount || order.total,
            currency: order.currency,
            buyer: buyerInfo,
            status: segmentInfo?.status || order.status,
            segment: segmentInfo ? {
              id: segmentInfo.segmentId || null,
              status: segmentInfo.status || null,
              sellerId,
              sellerName: segmentInfo.sellerName || sellerProducts[0]?.seller?.name || sellerInfo?.name || null
            } : null,
            products: productsForSeller
          },
          actions: [{
            type: 'view',
            label: 'Voir la commande',
            url: orderUrl
          }],
          channels: {
            inApp: { enabled: true },
            email: { enabled: true },
            push: { enabled: true }
          }
        });
      });
      const sellerNotifications = await Promise.all(sellerNotificationsPromises);
      notifications.push(...sellerNotifications);
    }

    // Notifier l'acheteur de la création de sa commande
    if (order.buyer) {
      const buyerId = order.buyer._id || order.buyer;
      const orderUrl = await buildOrderUrl(buyerId);
      const buyerNotification = this.createNotification({
        recipient: order.buyer,
        type: 'order_created_buyer',
        category: 'order',
        title: 'Commande créée avec succès',
        message: `Votre commande ${order.orderNumber} a été créée avec succès. Montant total : ${order.total} ${order.currency}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.total,
          currency: order.currency,
          status: order.status || 'pending',
          products: productsDetails
        },
        actions: [{
          type: 'view',
          label: 'Voir ma commande',
          url: orderUrl
        }],
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: true }
        }
      });
      notifications.push(buyerNotification);
    }

    // Notifier le livreur (transporter/exporter) si assigné lors de la création
    if (order.delivery?.transporter) {
      const transporterId = order.delivery.transporter._id || order.delivery.transporter;
      const transporterOrderUrl = await buildOrderUrl(transporterId);
      
      const User = mongoose.model('User');
      const transporter = await User.findById(transporterId).select('firstName lastName companyName userType');
      const transporterName = transporter?.companyName || 
        (transporter?.firstName && transporter?.lastName ? `${transporter.firstName} ${transporter.lastName}` : 'Livreur');
      
      const transporterNotification = this.createNotification({
        recipient: transporterId,
        type: 'order_created_transporter',
        category: 'order',
        title: 'Nouvelle commande assignée',
        message: `Une nouvelle commande ${order.orderNumber} vous a été assignée. Frais de livraison : ${order.deliveryFee || order.delivery?.deliveryFee || 0} ${order.currency}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.deliveryFee || order.delivery?.deliveryFee || 0,
          currency: order.currency,
          deliveryFee: order.deliveryFee || order.delivery?.deliveryFee || 0,
          status: order.status || 'pending',
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
      notifications.push(transporterNotification);
    }

    return Promise.all(notifications);
  };

  notificationSchema.statics.notifyProductApproved = function(product, explicitOwner = null) {
    const ownersMap = new Map();

    const registerOwner = (candidate) => {
      if (!candidate) return;

      if (Array.isArray(candidate)) {
        candidate.forEach(registerOwner);
        return;
      }

      const ownerId = candidate._id || candidate;
      if (!ownerId) return;

      const key = ownerId.toString();
      if (!ownersMap.has(key)) {
        ownersMap.set(key, candidate);
      }
    };

    registerOwner(explicitOwner);
    registerOwner(product.producer);
    registerOwner(product.transformer);
    registerOwner(product.restaurateur);

    if (ownersMap.size === 0) {
      console.warn('Notification produit approuvé : aucun propriétaire identifié', {
        productId: product?._id?.toString()
      });
      return Promise.resolve([]);
    }

    const localizedName = toPlainText(product?.name, 'Produit');

    const notifications = Array.from(ownersMap.keys()).map((ownerId) => this.createNotification({
      recipient: ownerId,
      type: 'product_approved',
      category: 'product',
      title: 'Produit approuvé',
      message: `Votre produit "${localizedName}" a été approuvé et est maintenant visible sur la marketplace`,
      data: {
        productId: product._id,
        productName: localizedName
      },
      actions: [{
        type: 'view',
        label: 'Voir le produit',
        url: buildFrontendUrl(`/products/${product.slug || product._id}`)
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true }
      }
    }));

    return Promise.all(notifications);
  };
}

module.exports = addNotificationCreators;

