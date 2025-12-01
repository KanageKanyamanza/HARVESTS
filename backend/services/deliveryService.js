const { normalizeCountry } = require('../utils/countryMapper');

/**
 * Service pour le calcul des frais de livraison
 */

function normalizeString(value) {
  return (value || '').toString().trim().toLowerCase();
}

function removeDiacritics(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeCountryValue(value) {
  const countryName = normalizeCountry(value);
  if (!countryName) return null;
  return countryName.toLowerCase().trim();
}

function normalizeCity(value) {
  const str = normalizeString(value);
  if (!str) return null;
  return removeDiacritics(str);
}

function isSameCity(seller, deliveryAddress) {
  const sellerCountry = normalizeCountryValue(seller?.country);
  const deliveryCountry = normalizeCountryValue(deliveryAddress?.country);

  if (!sellerCountry || !deliveryCountry) {
    return true;
  }

  if (sellerCountry !== deliveryCountry) {
    return false;
  }

  const sellerCity = normalizeCity(seller?.city || seller?.region);
  const deliveryCity = normalizeCity(deliveryAddress?.city);

  if (!sellerCity || !deliveryCity) {
    return true;
  }

  return sellerCity === deliveryCity;
}

function isSameCountry(seller, deliveryAddress) {
  const sellerCountry = normalizeCountryValue(seller?.country);
  const deliveryCountry = normalizeCountryValue(deliveryAddress?.country);

  if (!sellerCountry || !deliveryCountry) {
    return true;
  }

  return sellerCountry === deliveryCountry;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Rayon de la terre en km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function computeMaxDistanceKm(sellerLocations, deliveryAddress) {
  const destinationCoords = deliveryAddress?.coordinates;
  if (!destinationCoords?.latitude || !destinationCoords?.longitude) {
    return 0;
  }

  let maxDistance = 0;

  for (const seller of sellerLocations) {
    const coords = seller?.coordinates;
    if (!coords?.latitude || !coords?.longitude) {
      continue;
    }

    const distance = haversineDistance(
      coords.latitude,
      coords.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude
    );

    if (distance > maxDistance) {
      maxDistance = distance;
    }
  }

  return maxDistance;
}

function calculateDeliveryFee(items, deliveryAddress, sellerLocations = [], deliveryMethod = 'standard-delivery') {
  const method = deliveryMethod || 'standard-delivery';

  const toAmount = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  const methodLabels = {
    pickup: 'retrait sur place',
    'standard-delivery': 'livraison standard',
    'express-delivery': 'livraison express',
    'same-day': 'livraison jour même',
    'scheduled': 'livraison programmée'
  };

  const localFees = {
    pickup: toAmount(process.env.DELIVERY_FEE_PICKUP_LOCAL, 0),
    'standard-delivery': toAmount(process.env.DELIVERY_FEE_STANDARD_LOCAL, 2000),
    'express-delivery': toAmount(process.env.DELIVERY_FEE_EXPRESS_LOCAL, 5000),
    'same-day': toAmount(process.env.DELIVERY_FEE_SAME_DAY_LOCAL, 7000),
    'scheduled': toAmount(process.env.DELIVERY_FEE_SCHEDULED_LOCAL, 3000)
  };

  const localFee = localFees[method] ?? localFees['standard-delivery'];
  const methodKey = method.replace(/-/g, '_').toUpperCase();

  const intercityBaseDefault = toAmount(process.env.DELIVERY_FEE_INTERCITY_BASE, localFee);
  const intercityMethodBase = toAmount(process.env[`DELIVERY_FEE_INTERCITY_${methodKey}`], intercityBaseDefault);
  const perKm = toAmount(process.env.DELIVERY_FEE_PER_KM, 0);
  const internationalBaseDefault = toAmount(process.env.DELIVERY_FEE_INTERNATIONAL_BASE, intercityBaseDefault + 3000);
  const internationalMethodBase = toAmount(process.env[`DELIVERY_FEE_INTERNATIONAL_${methodKey}`], internationalBaseDefault);

  const result = {
    amount: localFee,
    scope: 'local',
    method,
    reason: `Livraison locale (${methodLabels[method] || method})`
  };

  if (!deliveryAddress || !Array.isArray(sellerLocations) || sellerLocations.length === 0) {
    result.reason = 'Adresse ou vendeurs manquants : application du forfait local.';
    return result;
  }

  const allSameCity = sellerLocations.every((seller) => isSameCity(seller, deliveryAddress));
  if (allSameCity) {
    result.amount = localFee;
    result.scope = 'local';
    result.reason = `Tous les vendeurs et l'adresse de livraison sont dans la même ville (${methodLabels[method] || method}).`;
    return result;
  }

  const allSameCountry = sellerLocations.every((seller) => isSameCountry(seller, deliveryAddress));
  if (allSameCountry) {
    const maxDistance = computeMaxDistanceKm(sellerLocations, deliveryAddress);
    const variableFee = maxDistance > 0 && perKm > 0 ? perKm * maxDistance : 0;
    result.amount = Math.round(intercityMethodBase + variableFee);
    result.scope = 'domestic';
    if (maxDistance > 0 && perKm > 0) {
      result.reason = `Livraison inter-ville (${methodLabels[method] || method}) : distance maximale estimée ${maxDistance.toFixed(1)} km.`;
    } else {
      result.reason = `Livraison inter-ville (${methodLabels[method] || method}) : application du forfait national.`;
    }
    return result;
  }

  result.amount = Math.round(internationalMethodBase);
  result.scope = 'international';
  result.reason = `Livraison internationale (${methodLabels[method] || method}) : au moins un vendeur se trouve dans un autre pays.`;
  return result;
}

function calculateEstimatedDelivery(deliveryMethod) {
  const now = new Date();
  const deliveryDays = {
    'same-day': 0,
    'express-delivery': 1,
    'standard-delivery': 3,
    'scheduled': 7,
    'pickup': 0
  };

  const days = deliveryDays[deliveryMethod] || 3;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

module.exports = {
  calculateDeliveryFee,
  calculateEstimatedDelivery,
  isSameCity,
  isSameCountry,
  computeMaxDistanceKm
};

