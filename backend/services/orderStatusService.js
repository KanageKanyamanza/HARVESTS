const AppError = require('../utils/appError');
const { ensureSegmentsForOrder, updateOrderStatusFromSegments } = require('../utils/orderSegments');

/**
 * Service pour la gestion des statuts de commandes
 */

// Obtenir les transitions de statut valides selon l'acteur
function getValidStatusTransitions(currentStatus, userType) {
  const transitions = {
    pending: {
      producer: ['confirmed', 'cancelled'],
      transformer: ['confirmed', 'cancelled'],
      restaurateur: ['confirmed', 'cancelled'],
      consumer: ['cancelled'],
      admin: ['confirmed', 'preparing', 'ready-for-pickup', 'cancelled']
    },
    confirmed: {
      producer: ['preparing', 'cancelled'],
      transformer: ['preparing', 'cancelled'],
      restaurateur: ['preparing', 'cancelled'],
      admin: ['preparing', 'ready-for-pickup', 'cancelled']
    },
    preparing: {
      producer: ['ready-for-pickup', 'cancelled'],
      transformer: ['ready-for-pickup', 'cancelled'],
      restaurateur: ['ready-for-pickup', 'cancelled'],
      admin: ['ready-for-pickup', 'cancelled']
    },
    'ready-for-pickup': {
      transporter: ['picked-up', 'in-transit'],
      exporter: ['picked-up', 'in-transit'],
      producer: ['cancelled'],
      transformer: ['cancelled'],
      restaurateur: ['cancelled'],
      admin: ['picked-up', 'in-transit', 'delivered', 'cancelled']
    },
    'in-transit': {
      transporter: ['delivered'],
      exporter: ['delivered'],
      admin: ['delivered', 'cancelled']
    },
    delivered: {
      consumer: ['completed'],
      restaurateur: ['completed'],
      admin: ['completed']
    },
    completed: {
      admin: []
    },
    cancelled: {
      admin: []
    },
    refunded: {
      admin: []
    },
    disputed: {
      admin: []
    }
  };

  if (currentStatus === 'picked-up' || currentStatus === 'out-for-delivery') {
    return transitions['in-transit']?.[userType] || [];
  }

  return transitions[currentStatus]?.[userType] || [];
}

// Vérifier les permissions de mise à jour
function checkUpdatePermissions(order, userId, userRole, userType) {
  const sellerIds = new Set();
  if (order.seller) sellerIds.add(order.seller.toString());
  (order.items || []).forEach(item => {
    if (item.seller) sellerIds.add(item.seller.toString());
  });

  const buyerId = order.buyer?.toString?.() || order.buyer?._id?.toString?.();
  const canUpdate =
    sellerIds.has(userId.toString()) ||
    (order.delivery.transporter && order.delivery.transporter.toString() === userId.toString()) ||
    userRole === 'admin' ||
    (buyerId && buyerId === userId.toString());

  if (!canUpdate) {
    throw new AppError('Vous n\'avez pas le droit de modifier cette commande', 403);
  }

  return true;
}

// Résoudre les segments à mettre à jour
function resolveSegmentsForUpdate(order, userId, userType, segmentId) {
  if (segmentId) {
    const segment = order.segments.id(segmentId);
    if (!segment) {
      throw new AppError('Segment de commande introuvable', 404);
    }
    return [segment];
  }

  const sellerTypes = ['producer', 'transformer', 'restaurateur'];

  if (sellerTypes.includes(userType)) {
    const segment = order.segments.find(seg =>
      seg.seller && seg.seller.toString() === userId.toString()
    );
    if (!segment) {
      throw new AppError('Vous n\'avez pas de segment associé à cette commande', 403);
    }
    return [segment];
  }

  return order.segments;
}

// Valider la transition de statut
function validateStatusTransition(currentStatus, newStatus, userType, userRole) {
  if (userRole === 'admin') {
    return true;
  }

  const validTransitions = getValidStatusTransitions(currentStatus, userType);
  
  let statusToCheck = newStatus;
  if ((userType === 'transporter' || userType === 'exporter') && newStatus === 'picked-up') {
    statusToCheck = 'in-transit';
  }
  
  if (!validTransitions.includes(statusToCheck)) {
    throw new AppError(
      `Vous n'avez pas le droit de passer la commande de "${currentStatus}" à "${newStatus}". Transitions autorisées: ${validTransitions.join(', ')}`,
      403
    );
  }

  return true;
}

// Mettre à jour le statut d'une commande (fonction complète)
async function updateOrderStatus(order, status, user, options = {}) {
  const AppError = require('../utils/appError');
  const { ensureSegmentsForOrder, updateOrderStatusFromSegments } = require('../utils/orderSegments');
  const orderNotificationService = require('./orderNotificationService');
  
  const { segmentId, itemIds, reason, note } = options;
  const now = new Date();

  // Vérifier les permissions
  const sellerIds = new Set();
  if (order.seller) sellerIds.add(order.seller.toString());
  (order.items || []).forEach(item => {
    if (item.seller) sellerIds.add(item.seller.toString());
  });

  const buyerId = order.buyer?.toString?.() || order.buyer?._id?.toString?.();
  const canUpdate =
    sellerIds.has(user._id.toString()) ||
    (order.delivery.transporter && order.delivery.transporter.toString() === user._id.toString()) ||
    user.role === 'admin' ||
    (buyerId && buyerId === user._id.toString());

  if (!canUpdate) {
    throw new AppError('Vous n\'avez pas le droit de modifier cette commande', 403);
  }

  // Vérifier le statut actuel
  const currentOrderStatus = order.status || 'pending';
  const userType = user.userType || user.role;
  const sellerTypes = ['producer', 'transformer', 'restaurateur'];
  let currentStatusToCheck = currentOrderStatus;
  
  // Vérifier si l'utilisateur est le buyer
  const isBuyer = buyerId && buyerId === user._id.toString();
  
  // Si l'utilisateur est un seller type ET qu'il est effectivement le seller (pas seulement le buyer)
  if (sellerTypes.includes(userType) && !isBuyer) {
    const sellerSegment = order.segments?.find(seg =>
      seg.seller && seg.seller.toString() === user._id.toString()
    );
    if (sellerSegment) {
      currentStatusToCheck = sellerSegment.status || 'pending';
    }
  }
  
  if (currentStatusToCheck === status && !itemIds?.length) {
    return { order, changed: false };
  }

  // Valider les transitions
  if (userType !== 'admin' && user.role !== 'admin') {
    const validTransitions = getValidStatusTransitions(currentStatusToCheck, userType);
    let statusToCheck = status;
    if ((userType === 'transporter' || userType === 'exporter') && status === 'picked-up') {
      statusToCheck = 'in-transit';
    }
    
    if (!validTransitions.includes(statusToCheck) && !itemIds?.length) {
      throw new AppError(
        `Vous n'avez pas le droit de passer la commande de "${currentStatusToCheck}" à "${status}". Transitions autorisées: ${validTransitions.join(', ')}`,
        403
      );
    }
  }

  // Créer les segments si nécessaire
  const segmentCreated = ensureSegmentsForOrder(order);
  if (segmentCreated) {
    await order.save();
  }

  // Résoudre les segments à mettre à jour
  let targetSegments;
  if (segmentId) {
    const segment = order.segments.id(segmentId);
    if (!segment) {
      throw new AppError('Segment de commande introuvable', 404);
    }
    targetSegments = [segment];
  } else if (sellerTypes.includes(userType) && !isBuyer) {
    // Si l'utilisateur est un seller type ET qu'il est effectivement le seller (pas seulement le buyer)
    const segment = order.segments.find(seg =>
      seg.seller && seg.seller.toString() === user._id.toString()
    );
    if (!segment) {
      throw new AppError('Vous n\'avez pas de segment associé à cette commande', 403);
    }
    targetSegments = [segment];
  } else {
    // Si l'utilisateur est le buyer ou un autre type, mettre à jour tous les segments
    targetSegments = order.segments;
  }

  // Traiter les items si spécifiés
  const rawItemIds = Array.isArray(itemIds) ? itemIds : (itemIds ? [itemIds] : []);
  const itemIdSet = new Set(rawItemIds.map((id) => id.toString()));
  const isItemScoped = itemIdSet.size > 0;
  const baseItemsById = new Map();
  (order.items || []).forEach((orderItem) => {
    if (orderItem && orderItem._id) {
      baseItemsById.set(orderItem._id.toString(), orderItem);
    }
  });

  const itemsEquivalent = (segmentItem, baseItem) => {
    if (!segmentItem || !baseItem) return false;
    const productMatches = segmentItem.product && baseItem.product &&
      segmentItem.product.toString() === baseItem.product.toString();
    const sellerMatches = (!segmentItem.seller || !baseItem.seller) ||
      (segmentItem.seller.toString() === baseItem.seller.toString());
    const quantityMatches = Number(segmentItem.quantity) === Number(baseItem.quantity);
    const unitPriceMatches = Number(segmentItem.unitPrice) === Number(baseItem.unitPrice);
    const variantMatches = (!segmentItem.variant && !baseItem.variant) ||
      (segmentItem.variant && baseItem.variant && segmentItem.variant.toString() === baseItem.variant.toString());
    return productMatches && sellerMatches && quantityMatches && unitPriceMatches && variantMatches;
  };

  const findBaseItemForSegmentItem = (segmentItem) => {
    if (!segmentItem) return null;
    if (segmentItem._id && baseItemsById.has(segmentItem._id.toString())) {
      return baseItemsById.get(segmentItem._id.toString());
    }
    for (const baseItem of baseItemsById.values()) {
      if (itemsEquivalent(segmentItem, baseItem)) {
        return baseItem;
      }
    }
    return null;
  };

  let itemUpdatesCount = 0;
  const updateItemStatus = (item, shouldCount = true, expectedBefore = null) => {
    if (!item) return false;
    const currentItemStatus = item.status || 'pending';
    if (expectedBefore && currentItemStatus !== expectedBefore) return false;
    if (currentItemStatus === status) return false;

    const allowedItemTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready-for-pickup', 'cancelled'],
      'ready-for-pickup': ['in-transit', 'cancelled'],
      'in-transit': ['delivered', 'cancelled'],
      delivered: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      rejected: [],
      refunded: [],
      disputed: []
    };

    const allowedTargets = allowedItemTransitions[currentItemStatus] || [];
    if (!allowedTargets.includes(status)) {
      throw new AppError(`Transition d'article invalide: ${currentItemStatus} -> ${status}`, 400);
    }

    item.status = status;
    item.statusHistory = item.statusHistory || [];
    item.statusHistory.push({
      status,
      timestamp: now,
      updatedBy: user._id,
      reason,
      note
    });

    if (shouldCount) itemUpdatesCount += 1;
    return true;
  };

  const segmentsToUpdate = [];
  const segmentsTouchedByItems = new Set();
  let itemMatchedCount = 0;

  if (isItemScoped) {
    for (const segment of targetSegments) {
      const directMatches = segment.items.filter((item) =>
        item && item._id && itemIdSet.has(item._id.toString())
      );

      const fallbackMatches = new Map();
      const usedSegmentItems = new Set();
      if (directMatches.length === 0) {
        for (const itemId of itemIdSet) {
          const baseItem = baseItemsById.get(itemId);
          if (!baseItem) continue;
          const candidate = segment.items.find((segmentItem) => {
            if (usedSegmentItems.has(segmentItem)) return false;
            if (segmentItem && segmentItem._id && segmentItem._id.toString() === itemId) return true;
            return itemsEquivalent(segmentItem, baseItem);
          });
          if (candidate) {
            fallbackMatches.set(itemId, candidate);
            usedSegmentItems.add(candidate);
          }
        }
      }

      const itemsToProcess = directMatches.length > 0 ? directMatches : Array.from(fallbackMatches.values());
      if (itemsToProcess.length === 0) continue;

      segmentsTouchedByItems.add(segment._id.toString());

      itemsToProcess.forEach((item) => {
        itemMatchedCount += 1;
        const currentItemStatus = item.status || 'pending';
        if (currentItemStatus === status) return;

        const allowedItemTransitions = {
          pending: ['confirmed', 'cancelled'],
          confirmed: ['preparing', 'cancelled'],
          preparing: ['ready-for-pickup', 'cancelled'],
          'ready-for-pickup': ['in-transit', 'cancelled'],
          'in-transit': ['delivered', 'cancelled'],
          delivered: ['completed', 'cancelled'],
          completed: [],
          cancelled: [],
          rejected: [],
          refunded: [],
          disputed: []
        };
        const allowedTargets = allowedItemTransitions[currentItemStatus] || [];
        if (!allowedTargets.includes(status)) {
          throw new AppError(`Transition d'article invalide: ${currentItemStatus} -> ${status}`, 400);
        }

        const updatedSegmentItem = updateItemStatus(item, true);
        if (updatedSegmentItem) {
          const baseItem = findBaseItemForSegmentItem(item);
          if (baseItem && baseItem !== item) {
            updateItemStatus(baseItem, false, segment.status);
          }
        }
      });
    }

    if (itemMatchedCount === 0) {
      throw new AppError('Aucun article correspondant trouvé pour cette commande', 404);
    }

    if (['confirmed', 'preparing', 'ready-for-pickup', 'in-transit', 'delivered', 'completed', 'cancelled'].includes(status)) {
      for (const segment of targetSegments) {
        if (!segmentsTouchedByItems.has(segment._id.toString())) continue;
        const currentSegmentStatus = segment.status || 'pending';
        if (currentSegmentStatus === status) continue;

        const segmentAllowedTransitions = {
          pending: ['confirmed', 'cancelled'],
          confirmed: ['preparing', 'cancelled'],
          preparing: ['ready-for-pickup', 'cancelled'],
          'ready-for-pickup': ['in-transit', 'cancelled'],
          'in-transit': ['delivered', 'cancelled'],
          delivered: ['completed', 'cancelled'],
          completed: [],
          cancelled: []
        };
        const allowed = (segmentAllowedTransitions[currentSegmentStatus] || []).includes(status);
        if (!allowed) continue;

        const allItemsHaveStatus = segment.items.every(
          (segmentItem) => (segmentItem.status || 'pending') === status
        );

        if (allItemsHaveStatus && segment.status !== status) {
          segmentsToUpdate.push(segment);
        }
      }
    }
  } else {
    // Si l'utilisateur est le buyer et qu'il n'y a pas de segments spécifiques à mettre à jour,
    // on gérera cela plus tard dans la logique
    if (isBuyer && targetSegments.length === 0) {
      // Pas de segments à mettre à jour pour le buyer, on passera directement à la mise à jour du statut principal
    } else {
      for (const segment of targetSegments) {
        const currentStatus = segment.status || order.status;
        if (currentStatus === status) continue;
        const validTransitions = getValidStatusTransitions(currentStatus, userType);
        if (!validTransitions.includes(status)) {
          throw new AppError(`Transition de statut invalide: ${currentStatus} -> ${status}`, 400);
        }
        segmentsToUpdate.push(segment);
      }
    }
  }

  if (itemUpdatesCount > 0) {
    order.markModified('items');
  }

  // Si l'utilisateur est le buyer et qu'il marque la commande comme terminée,
  // mettre à jour directement le statut de la commande principale
  if (isBuyer && status === 'completed' && segmentsToUpdate.length === 0 && itemUpdatesCount === 0) {
    if (order.status !== 'completed') {
      order.status = 'completed';
      order.completedAt = now;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: 'completed',
        timestamp: now,
        updatedBy: user._id,
        reason: reason || 'Commande terminée par le client',
        note: note || 'Commande marquée comme terminée'
      });
      await order.save();
      return { order, changed: true };
    }
    return { order, changed: false };
  }

  if (segmentsToUpdate.length === 0 && itemUpdatesCount === 0) {
    return { order, changed: false };
  }

  let segmentStatusChanged = false;

  for (const segment of segmentsToUpdate) {
    if (segment.status === status) continue;
    const previousSegmentStatus = segment.status || 'pending';
    segment.status = status;
    segment.history = segment.history || [];
    segment.history.push({
      status,
      timestamp: now,
      updatedBy: user._id,
      reason,
      note
    });
    segmentStatusChanged = true;

    const segmentItems = segment.items || [];
    segmentItems.forEach((segmentItem) => {
      // Si le segment passe à 'completed', mettre à jour tous les articles à 'completed'
      // même s'ils n'ont pas encore le statut 'delivered'
      if (status === 'completed') {
        const currentItemStatus = segmentItem.status || 'pending';
        if (currentItemStatus !== 'completed') {
          segmentItem.status = 'completed';
          segmentItem.statusHistory = segmentItem.statusHistory || [];
          segmentItem.statusHistory.push({
            status: 'completed',
            timestamp: now,
            updatedBy: user._id,
            reason: reason || 'Commande terminée',
            note: note || 'Article marqué comme terminé avec la commande'
          });
          itemUpdatesCount += 1;
          
          // Mettre à jour aussi l'article de base
          const baseItem = findBaseItemForSegmentItem(segmentItem);
          if (baseItem && baseItem !== segmentItem && baseItem.status !== 'completed') {
            baseItem.status = 'completed';
            baseItem.statusHistory = baseItem.statusHistory || [];
            baseItem.statusHistory.push({
              status: 'completed',
              timestamp: now,
              updatedBy: user._id,
              reason: reason || 'Commande terminée',
              note: note || 'Article marqué comme terminé avec la commande'
            });
          }
        }
      } else {
        // Pour les autres statuts, utiliser la logique normale de transition
        const updated = updateItemStatus(segmentItem, true, previousSegmentStatus);
        if (updated) {
          const baseItem = findBaseItemForSegmentItem(segmentItem);
          if (baseItem && baseItem !== segmentItem) {
            updateItemStatus(baseItem, false, previousSegmentStatus);
          }
        }
      }
    });
  }

  const previousOrderStatus = order.status;
  let orderStatusChanged = false;

  if (segmentStatusChanged) {
    const newAggregatedStatus = updateOrderStatusFromSegments(order, order.status);
    if (newAggregatedStatus !== previousOrderStatus) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: newAggregatedStatus,
        timestamp: now,
        updatedBy: user._id,
        reason,
        note
      });
      orderStatusChanged = true;
    }
  }

  if (itemUpdatesCount > 0 || segmentStatusChanged || orderStatusChanged) {
    order.modifiedBy = user._id;
    await order.save();
  }

  if (segmentStatusChanged) {
    await orderNotificationService.sendStatusNotifications(order, status);
  }

  return { order, changed: true };
}

module.exports = {
  getValidStatusTransitions,
  checkUpdatePermissions,
  resolveSegmentsForUpdate,
  validateStatusTransition,
  updateOrderStatus,
  ensureSegmentsForOrder,
  updateOrderStatusFromSegments
};

