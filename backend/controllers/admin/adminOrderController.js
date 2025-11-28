const Order = require('../../models/Order');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// @desc    Obtenir toutes les commandes
// @route   GET /api/v1/admin/orders
// @access  Admin
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'buyer.firstName': { $regex: search, $options: 'i' } },
      { 'buyer.lastName': { $regex: search, $options: 'i' } },
      { 'buyer.email': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les commandes avec populate
  const orders = await Order.find(filter)
    .populate('buyer', 'firstName lastName email phone userType')
    .populate('seller', 'firstName lastName email phone farmName companyName userType')
    .populate('delivery.transporter', 'firstName lastName email phone companyName userType')
    .populate('items.product', 'name images price')
    .populate('segments.seller', 'firstName lastName email phone farmName companyName restaurantName userType')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedOrders = orders.map(order => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.payment?.status || 'pending',
    totalAmount: order.total,
    items: order.items.map(item => {
      // Récupérer les images depuis productSnapshot ou product peuplé
      let images = [];
      if (item.productSnapshot?.images && item.productSnapshot.images.length > 0) {
        images = item.productSnapshot.images;
      } else if (item.product?.images && item.product.images.length > 0) {
        images = item.product.images;
      }
      
      return {
        product: {
          name: item.productSnapshot?.name || item.product?.name || 'Produit supprimé',
          images: images
        },
        productSnapshot: item.productSnapshot,
        quantity: item.quantity,
        price: item.unitPrice
      };
    }),
    customer: {
      firstName: order.buyer?.firstName || 'N/A',
      lastName: order.buyer?.lastName || 'N/A',
      email: order.buyer?.email || 'N/A'
    },
    producer: {
      firstName: order.seller?.firstName || 'N/A',
      lastName: order.seller?.lastName || 'N/A',
      farmName: order.seller?.farmName || order.seller?.companyName || 'N/A'
    },
    segments: order.segments?.map(seg => ({
      _id: seg._id,
      status: seg.status,
      seller: seg.seller ? {
        _id: seg.seller._id,
        firstName: seg.seller.firstName,
        lastName: seg.seller.lastName,
        farmName: seg.seller.farmName,
        companyName: seg.seller.companyName,
        restaurantName: seg.seller.restaurantName,
        userType: seg.seller.userType
      } : null
    })) || [],
    transporter: order.delivery?.transporter ? {
      _id: order.delivery.transporter._id,
      firstName: order.delivery.transporter.firstName || 'N/A',
      lastName: order.delivery.transporter.lastName || 'N/A',
      email: order.delivery.transporter.email || 'N/A',
      phone: order.delivery.transporter.phone || 'N/A',
      companyName: order.delivery.transporter.companyName || null,
      userType: order.delivery.transporter.userType || 'transporter'
    } : null,
    delivery: order.delivery ? {
      deliveryAddress: order.delivery.deliveryAddress
    } : null,
    disputeReason: order.cancellationReason || null,
    createdAt: order.createdAt
  }));

  // Compter le total
  const total = await Order.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      orders: transformedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Obtenir une commande par ID
// @route   GET /api/v1/admin/orders/:id
// @access  Admin
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone address userType')
    .populate('seller', 'firstName lastName email phone farmName companyName userType')
    .populate({
      path: 'items.product',
      select: 'name images description price',
    })
    .populate({
      path: 'segments.seller',
      select: 'firstName lastName email phone farmName companyName restaurantName userType'
    })
    .populate('delivery.transporter', 'firstName lastName email phone companyName');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Fonction pour transformer un item
  const transformItem = (item) => {
    let images = [];
    if (item.productSnapshot?.images && Array.isArray(item.productSnapshot.images) && item.productSnapshot.images.length > 0) {
      images = item.productSnapshot.images;
    } else if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
      images = item.product.images;
    }
    const productName = item.productSnapshot?.name || item.product?.name || 'Produit supprimé';
    
    return {
      _id: item._id,
      product: {
        name: productName,
        images: images,
        description: item.productSnapshot?.description || item.product?.description || ''
      },
      productSnapshot: item.productSnapshot,
      quantity: item.quantity,
      price: item.unitPrice,
      totalPrice: item.totalPrice,
      status: item.status || 'pending'
    };
  };

  // Transformer les segments avec leurs items et statuts
  const transformedSegments = (order.segments || []).map(segment => {
    const seller = segment.seller;
    const sellerName = seller?.farmName || seller?.companyName || seller?.restaurantName || 
      (seller?.firstName && seller?.lastName ? `${seller.firstName} ${seller.lastName}` : 'Vendeur');
    
    return {
      _id: segment._id,
      seller: {
        _id: seller?._id,
        name: sellerName,
        firstName: seller?.firstName,
        lastName: seller?.lastName,
        email: seller?.email,
        phone: seller?.phone,
        userType: seller?.userType
      },
      status: segment.status || 'pending',
      subtotal: segment.subtotal,
      deliveryFee: segment.deliveryFee,
      total: segment.total,
      items: (segment.items || []).map(transformItem),
      history: segment.history || []
    };
  });

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedOrder = {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.payment?.status || 'pending',
    totalAmount: order.total,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    taxes: order.taxes,
    discount: order.discount,
    items: order.items.map(transformItem),
    segments: transformedSegments,
    isMultiVendor: transformedSegments.length > 1,
    customer: {
      firstName: order.buyer?.firstName || 'N/A',
      lastName: order.buyer?.lastName || 'N/A',
      email: order.buyer?.email || 'N/A',
      phone: order.buyer?.phone || 'N/A',
      address: order.buyer?.address || 'N/A'
    },
    producer: {
      firstName: order.seller?.firstName || 'N/A',
      lastName: order.seller?.lastName || 'N/A',
      farmName: order.seller?.farmName || order.seller?.companyName || 'N/A',
      email: order.seller?.email || 'N/A',
      phone: order.seller?.phone || 'N/A'
    },
    transporter: order.delivery?.transporter ? {
      firstName: order.delivery.transporter.firstName || 'N/A',
      lastName: order.delivery.transporter.lastName || 'N/A',
      email: order.delivery.transporter.email || 'N/A',
      phone: order.delivery.transporter.phone || 'N/A',
      companyName: order.delivery.transporter.companyName || 'N/A'
    } : null,
    disputeReason: order.cancellationReason || null,
    createdAt: order.createdAt,
    delivery: order.delivery,
    payment: order.payment,
    statusHistory: order.statusHistory
  };

  res.status(200).json({
    status: 'success',
    data: { order: transformedOrder }
  });
});

// @desc    Mettre à jour le statut d'une commande
// @route   PATCH /api/v1/admin/orders/:id/status
// @access  Admin
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Utiliser la méthode du modèle pour mettre à jour le statut
  await order.updateStatus(status, req.admin._id, null, notes);

  // Récupérer la commande mise à jour avec les populations
  const updatedOrder = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone userType')
    .populate('seller', 'firstName lastName email phone farmName companyName userType')
    .populate('items.product', 'name images price');

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedOrder = {
    _id: updatedOrder._id,
    orderNumber: updatedOrder.orderNumber,
    status: updatedOrder.status,
    paymentStatus: updatedOrder.payment.status,
    totalAmount: updatedOrder.total,
    items: updatedOrder.items.map(item => ({
      product: {
        name: item.productSnapshot?.name || item.product?.name || 'Produit supprimé',
        images: item.productSnapshot?.images || item.product?.images || []
      },
      quantity: item.quantity,
      price: item.unitPrice
    })),
    customer: {
      firstName: updatedOrder.buyer?.firstName || 'N/A',
      lastName: updatedOrder.buyer?.lastName || 'N/A',
      email: updatedOrder.buyer?.email || 'N/A'
    },
    producer: {
      firstName: updatedOrder.seller?.firstName || 'N/A',
      lastName: updatedOrder.seller?.lastName || 'N/A',
      farmName: updatedOrder.seller?.farmName || updatedOrder.seller?.companyName || 'N/A'
    },
    disputeReason: updatedOrder.cancellationReason || null,
    createdAt: updatedOrder.createdAt
  };

  res.status(200).json({
    status: 'success',
    message: 'Statut de la commande mis à jour avec succès',
    data: { order: transformedOrder }
  });
});

// @desc    Mettre à jour le statut de paiement d'une commande
// @route   PATCH /api/v1/admin/orders/:id/payment-status
// @access  Admin
exports.updateOrderPaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentStatus, transactionId, paidAt } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier l'état avant de mettre à jour
  const wasCompleted = order.payment.status === 'completed' || order.payment.status === 'succeeded';
  const isNowCompleted = paymentStatus === 'completed';
  
  // Mettre à jour le statut de paiement
  order.payment.status = paymentStatus;
  if (transactionId) order.payment.transactionId = transactionId;
  if (paidAt) order.payment.paidAt = new Date(paidAt);
  else if (paymentStatus === 'completed') order.payment.paidAt = new Date();
  
  await order.save();

  // Si le paiement est confirmé et la commande est en attente, la confirmer
  if (isNowCompleted && order.status === 'pending') {
    await order.updateStatus('confirmed', req.admin._id, 'Paiement confirmé');
  }

  // Créer un paiement pour les frais de livraison si le paiement vient d'être complété et qu'il y a un livreur
  if (isNowCompleted && !wasCompleted && order.delivery?.transporter) {
    const transporterId = order.delivery.transporter._id || order.delivery.transporter;
    const deliveryFee = order.deliveryFee || order.delivery?.deliveryFee || 0;
    
    if (transporterId && deliveryFee > 0) {
      const Payment = require('../../models/Payment');
      
      // Vérifier si un paiement existe déjà
      const existingPayment = await Payment.findOne({
        order: order._id,
        user: transporterId,
        type: 'payout',
        'metadata.deliveryFee': true
      });
      
      if (!existingPayment) {
        const mongoose = require('mongoose');
        const transporterPayment = await Payment.create({
          paymentId: new mongoose.Types.ObjectId().toString(),
          order: order._id,
          user: transporterId,
          amount: deliveryFee,
          currency: order.currency || 'XAF',
          method: 'cash',
          provider: 'cash-on-delivery',
          type: 'payout',
          status: 'completed',
          metadata: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            deliveryFee: true
          },
          paidAt: new Date()
        });
        
        // Notifier le transporteur
        const Notification = require('../../models/Notification');
        await Notification.createNotification({
          recipient: transporterId,
          type: 'payout_processed',
          category: 'payment',
          title: 'Frais de livraison reçus',
          message: `Vous avez reçu ${deliveryFee} ${order.currency || 'XAF'} de frais de livraison pour la commande ${order.orderNumber}`,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            amount: deliveryFee,
            currency: order.currency || 'XAF',
            paymentId: transporterPayment.paymentId
          },
          channels: {
            inApp: { enabled: true },
            email: { enabled: true },
            push: { enabled: true }
          }
        });
      }
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Statut de paiement mis à jour avec succès',
    data: { 
      orderId: order._id,
      paymentStatus: order.payment.status,
      paidAt: order.payment.paidAt
    }
  });
});

// @desc    Annuler une commande
// @route   POST /api/v1/admin/orders/:id/cancel
// @access  Admin
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Utiliser la méthode du modèle pour annuler la commande
  await order.updateStatus('cancelled', req.admin._id, reason);

  // Récupérer la commande mise à jour avec les populations
  const updatedOrder = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone userType')
    .populate('seller', 'firstName lastName email phone farmName companyName userType')
    .populate('items.product', 'name images price');

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedOrder = {
    _id: updatedOrder._id,
    orderNumber: updatedOrder.orderNumber,
    status: updatedOrder.status,
    paymentStatus: updatedOrder.payment.status,
    totalAmount: updatedOrder.total,
    items: updatedOrder.items.map(item => ({
      product: {
        name: item.productSnapshot?.name || item.product?.name || 'Produit supprimé',
        images: item.productSnapshot?.images || item.product?.images || []
      },
      quantity: item.quantity,
      price: item.unitPrice
    })),
    customer: {
      firstName: updatedOrder.buyer?.firstName || 'N/A',
      lastName: updatedOrder.buyer?.lastName || 'N/A',
      email: updatedOrder.buyer?.email || 'N/A'
    },
    producer: {
      firstName: updatedOrder.seller?.firstName || 'N/A',
      lastName: updatedOrder.seller?.lastName || 'N/A',
      farmName: updatedOrder.seller?.farmName || updatedOrder.seller?.companyName || 'N/A'
    },
    disputeReason: updatedOrder.cancellationReason || null,
    createdAt: updatedOrder.createdAt
  };

  res.status(200).json({
    status: 'success',
    message: 'Commande annulée avec succès',
    data: { order: transformedOrder }
  });
});

