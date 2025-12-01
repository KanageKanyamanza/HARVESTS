/**
 * Utilitaires pour le formatage des commandes
 */

function formatOrderForSeller(orderDoc, sellerId) {
  if (!orderDoc) {
    throw new Error('orderDoc est requis');
  }
  
  if (typeof orderDoc.toObject !== 'function') {
    throw new Error('orderDoc doit être un document Mongoose valide');
  }
  
  const orderObj = orderDoc.toObject({ virtuals: true });
  const sellerIdStr = sellerId?.toString?.();

  const sellerSegment = (orderDoc.segments || []).find((segment) => {
    const rawSeller = segment.seller;
    const segmentSellerId =
      rawSeller?._id?.toString?.() ||
      (typeof rawSeller?.toString === 'function' ? rawSeller.toString() : null);
    return segmentSellerId && segmentSellerId === sellerIdStr;
  });

  const matchesSeller = (item) => {
    const directSeller =
      item.seller?._id?.toString?.() ||
      item.seller?.toString?.();
    const producerId =
      item.productSnapshot?.producer?._id?.toString?.() ||
      item.productSnapshot?.producer?.toString?.();
    const transformerId =
      item.productSnapshot?.transformer?._id?.toString?.() ||
      item.productSnapshot?.transformer?.toString?.();
    const restaurateurId =
      item.productSnapshot?.restaurateur?._id?.toString?.() ||
      item.productSnapshot?.restaurateur?.toString?.();

    return (
      (directSeller && directSeller === sellerIdStr) ||
      (producerId && producerId === sellerIdStr) ||
      (transformerId && transformerId === sellerIdStr) ||
      (restaurateurId && restaurateurId === sellerIdStr)
    );
  };

  const segmentItems = sellerSegment
    ? ((typeof sellerSegment.toObject === 'function' ? sellerSegment.toObject() : sellerSegment).items || []).map((item) =>
        typeof item.toObject === 'function' ? item.toObject() : item
      )
    : null;

  const sellerItemsSource = segmentItems || (orderObj.items || []).filter(matchesSeller);
  const sellerItems = sellerItemsSource.map((item) =>
    typeof item.toObject === 'function' ? item.toObject() : item
  );
  const sellerItemStatuses = sellerItems.map((item) => item.status || 'pending');

  const STATUS_ORDER = [
    'pending',
    'confirmed',
    'preparing',
    'ready-for-pickup',
    'in-transit',
    'delivered',
    'completed',
    'cancelled',
    'refunded',
    'disputed'
  ];
  const getStatusPriority = (status) => {
    const idx = STATUS_ORDER.indexOf(status);
    return idx === -1 ? STATUS_ORDER.length : idx;
  };
  const derivedStatus = sellerItemStatuses.length
    ? sellerItemStatuses.reduce((acc, status) =>
        getStatusPriority(status) < getStatusPriority(acc) ? status : acc
      , sellerItemStatuses[0])
    : orderObj.status;
  const sellerSubtotal = sellerItems.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + unitPrice * quantity;
  }, 0);

  orderObj.originalTotals = {
    subtotal: orderObj.subtotal,
    deliveryFee: orderObj.deliveryFee,
    taxes: orderObj.taxes,
    discount: orderObj.discount,
    total: orderObj.total,
    deliveryFeeDetail: orderObj.deliveryFeeDetail || orderObj.delivery?.feeDetail || null
  };

  orderObj.items = sellerItems;
  orderObj.subtotal = sellerSubtotal;
  orderObj.deliveryFee = 0;
  orderObj.taxes = 0;
  orderObj.discount = 0;
  orderObj.total = sellerSubtotal;
  orderObj.deliveryFeeDetail = null;
  orderObj.isSellerView = true;
  if (orderObj.delivery) {
    orderObj.delivery.deliveryFee = 0;
    orderObj.delivery.feeDetail = null;
  }
  orderObj.role = 'seller';

  if (sellerSegment) {
    const segmentObj = typeof sellerSegment.toObject === 'function'
      ? sellerSegment.toObject()
      : sellerSegment;

    orderObj.status = segmentObj.status;
    orderObj.segment = {
      id: segmentObj._id?.toString?.() || segmentObj._id,
      status: segmentObj.status,
      subtotal: segmentObj.subtotal,
      deliveryFee: segmentObj.deliveryFee,
      discount: segmentObj.discount,
      taxes: segmentObj.taxes,
      total: segmentObj.total,
      history: segmentObj.history || [],
      items: sellerItems
    };

    if (segmentObj.seller) {
      const sellerData = typeof segmentObj.seller?.toObject === 'function'
        ? segmentObj.seller.toObject()
        : segmentObj.seller;
      orderObj.segment.seller = sellerData;
    }
  } else {
    orderObj.status = derivedStatus;
    orderObj.segment = {
      id: null,
      status: derivedStatus,
      items: sellerItems
    };
  }

  return orderObj;
}

module.exports = {
  formatOrderForSeller
};

