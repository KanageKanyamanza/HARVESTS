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
  return {
    amount: 0,
    scope: 'local',
    method: deliveryMethod || 'standard-delivery',
    reason: 'Livraison gratuite sur toute la plateforme.'
  };
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

