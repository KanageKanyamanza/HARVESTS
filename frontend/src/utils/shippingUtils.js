const toAmount = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const LOCAL_FEES = {
  pickup: toAmount(import.meta.env.VITE_DELIVERY_FEE_PICKUP_LOCAL, 0),
  'standard-delivery': toAmount(import.meta.env.VITE_DELIVERY_FEE_STANDARD_LOCAL, 2000),
  'express-delivery': toAmount(import.meta.env.VITE_DELIVERY_FEE_EXPRESS_LOCAL, 5000),
  'same-day': toAmount(import.meta.env.VITE_DELIVERY_FEE_SAME_DAY_LOCAL, 7000),
  'scheduled': toAmount(import.meta.env.VITE_DELIVERY_FEE_SCHEDULED_LOCAL, 3000)
};

const STANDARD_FALLBACK = LOCAL_FEES['standard-delivery'] ?? 2000;

export const estimateDeliveryFee = (
  cartItems = [],
  deliveryMethod = 'standard-delivery',
  deliveryAddress = null
) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return 0;
  }

  const method = deliveryMethod || 'standard-delivery';
  return LOCAL_FEES[method] ?? STANDARD_FALLBACK;
};

