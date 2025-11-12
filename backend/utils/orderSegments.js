const mongoose = require('mongoose');

const PROGRESS_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready-for-pickup',
  'in-transit',
  'delivered',
  'completed'
];

const STATUS_PRIORITY = PROGRESS_STATUSES.reduce((acc, status, index) => {
  acc[status] = index;
  return acc;
}, {
  cancelled: Number.MAX_SAFE_INTEGER - 2,
  refunded: Number.MAX_SAFE_INTEGER - 1,
  disputed: Number.MAX_SAFE_INTEGER
});

const cloneItem = (item) => {
  if (!item) return item;
  if (typeof item.toObject === 'function') {
    return item.toObject();
  }
  return JSON.parse(JSON.stringify(item));
};

const DEFAULT_ITEM_STATUS = 'pending';

const createSegmentsFromItems = (items = [], options = {}) => {
  const { defaultStatus = 'pending' } = options;
  const segmentsMap = new Map();

  items.forEach((rawItem) => {
    const item = cloneItem(rawItem);
    const itemStatus = item.status || DEFAULT_ITEM_STATUS;
    item.status = itemStatus;

    if (rawItem && rawItem._id) {
      const rawId = rawItem._id.toString
        ? rawItem._id.toString()
        : String(rawItem._id);
      if (mongoose.Types.ObjectId.isValid(rawId)) {
        item._id = new mongoose.Types.ObjectId(rawId);
      } else {
        item._id = rawItem._id;
      }
    } else if (!item._id) {
      item._id = new mongoose.Types.ObjectId();
    }

    if (!Array.isArray(item.statusHistory) || item.statusHistory.length === 0) {
      item.statusHistory = [{
        status: itemStatus,
        timestamp: new Date()
      }];
    }

    const sellerKey = item.seller ? item.seller.toString() : 'unknown';

    if (!segmentsMap.has(sellerKey)) {
      segmentsMap.set(sellerKey, {
        seller: item.seller ? new mongoose.Types.ObjectId(item.seller) : null,
        items: []
      });
    }

    segmentsMap.get(sellerKey).items.push(item);
  });

  const segments = Array.from(segmentsMap.values()).map((segment) => {
    const subtotal = segment.items.reduce((sum, segmentItem) => {
      const unitPrice = Number(segmentItem.unitPrice) || 0;
      const quantity = Number(segmentItem.quantity) || 0;
      return sum + unitPrice * quantity;
    }, 0);

    return {
      seller: segment.seller,
      status: defaultStatus,
      subtotal,
      deliveryFee: 0,
      discount: 0,
      taxes: 0,
      total: subtotal,
      items: segment.items,
      history: [{
        status: defaultStatus,
        timestamp: new Date()
      }]
    };
  });

  return segments;
};

const aggregateOrderStatus = (segments = [], fallback = 'pending') => {
  if (!segments || segments.length === 0) {
    return fallback;
  }

  const statuses = segments.map((segment) => segment.status || fallback);
  const uniqueStatuses = new Set(statuses);

  if (uniqueStatuses.size === 1) {
    return statuses[0];
  }

  if (uniqueStatuses.size === 0) {
    return fallback;
  }

  // Si toutes les commandes sont annulées
  if (uniqueStatuses.size === 1 && uniqueStatuses.has('cancelled')) {
    return 'cancelled';
  }

  // Choisir le statut le moins avancé pour représenter l'état global
  const orderedStatuses = statuses
    .map((status) => ({
      status,
      priority: STATUS_PRIORITY[status] ?? Number.MAX_SAFE_INTEGER
    }))
    .sort((a, b) => a.priority - b.priority);

  return orderedStatuses[0].status;
};

const ensureSegmentsForOrder = (orderDoc) => {
  if (!orderDoc) {
    return false;
  }

  const items = orderDoc.items || [];
  if (!items.length) {
    return false;
  }

  if (orderDoc.segments && orderDoc.segments.length > 0) {
    return false;
  }

  const defaultStatus = orderDoc.status || 'pending';
  const segments = createSegmentsFromItems(items, { defaultStatus });
  orderDoc.segments = segments;
  if (typeof orderDoc.markModified === 'function') {
    orderDoc.markModified('segments');
  }

  return true;
};

const updateOrderStatusFromSegments = (orderDoc, fallback = 'pending') => {
  const status = aggregateOrderStatus(orderDoc.segments, fallback);
  orderDoc.status = status;
  return status;
};

module.exports = {
  PROGRESS_STATUSES,
  STATUS_PRIORITY,
  createSegmentsFromItems,
  aggregateOrderStatus,
  ensureSegmentsForOrder,
  updateOrderStatusFromSegments
};

