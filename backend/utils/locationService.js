/**
 * Service de géolocalisation pour les produits et services
 * Détecte la localisation de l'utilisateur (connecté ou non) via IP ou adresse
 */

const { getClientIP, getLocationInfo } = require('./visitorUtils');

/**
 * Récupère la localisation de l'utilisateur
 * Priorité : Adresse utilisateur connecté > IP
 * @param {object} req - Objet de requête Express
 * @returns {Promise<object>} Informations de localisation { country, region, city, coordinates }
 */
async function getUserLocation(req) {
  // Si l'utilisateur est connecté et a une adresse
  if (req.user) {
    const user = req.user;
    
    // Priorité 1 : Adresse complète de l'utilisateur
    if (user.address || user.city || user.region || user.country) {
      return {
        country: user.country || null,
        region: user.region || null,
        city: user.city || null,
        address: user.address || null,
        coordinates: user.coordinates || null,
        source: 'user_address'
      };
    }
    
    // Priorité 2 : Coordonnées GPS de l'utilisateur
    if (user.coordinates && user.coordinates.latitude && user.coordinates.longitude) {
      return {
        country: user.country || null,
        region: user.region || null,
        city: user.city || null,
        coordinates: user.coordinates,
        source: 'user_coordinates'
      };
    }
  }
  
  // Priorité 3 : Géolocalisation par IP
  const ipAddress = getClientIP(req);
  const locationInfo = await getLocationInfo(ipAddress);
  
  return {
    country: locationInfo.country !== 'Unknown' ? locationInfo.country : null,
    region: locationInfo.region !== 'Unknown' ? locationInfo.region : null,
    city: locationInfo.city !== 'Unknown' ? locationInfo.city : null,
    coordinates: null,
    source: 'ip_geolocation',
    ipAddress: ipAddress
  };
}

/**
 * Normalise le nom d'une région pour la recherche
 * @param {string} region - Nom de la région
 * @returns {string} Région normalisée
 */
function normalizeRegion(region) {
  if (!region) return null;
  
  // Normaliser les noms de régions du Sénégal
  const regionMap = {
    'dakar': 'Dakar',
    'thies': 'Thiès',
    'thies': 'Thiès',
    'saint-louis': 'Saint-Louis',
    'kaolack': 'Kaolack',
    'ziguinchor': 'Ziguinchor',
    'tambacounda': 'Tambacounda',
    'kolda': 'Kolda',
    'matam': 'Matam',
    'fatick': 'Fatick',
    'kaffrine': 'Kaffrine',
    'kedougou': 'Kédougou',
    'sedhiou': 'Sédhiou',
    'louga': 'Louga',
    'diourbel': 'Diourbel'
  };
  
  const normalized = region.toLowerCase().trim();
  return regionMap[normalized] || region;
}

/**
 * Normalise le nom d'une ville pour la recherche
 * @param {string} city - Nom de la ville
 * @returns {string} Ville normalisée
 */
function normalizeCity(city) {
  if (!city) return null;
  return city.trim();
}

/**
 * Crée une requête MongoDB pour filtrer par localisation
 * @param {object} location - Informations de localisation
 * @param {object} options - Options de recherche
 * @param {string} type - Type d'entité: 'producer', 'transporter', 'transformer', 'exporter'
 * @returns {object} Requête MongoDB
 */
function buildLocationQuery(location, options = {}, type = 'producer') {
  const { 
    prioritizeRegion = true, 
    prioritizeCity = true,
    radius = null // Rayon en km pour recherche par coordonnées
  } = options;
  
  const query = {};
  
  // Déterminer les préfixes de champs selon le type
  let addressPrefix = 'address';
  let directPrefix = '';
  
  if (type === 'producer' || type === 'transformer' || type === 'exporter') {
    addressPrefix = 'address';
    directPrefix = '';
  } else if (type === 'transporter') {
    addressPrefix = 'serviceAreas';
    directPrefix = '';
  }
  
  // Si on a des coordonnées et un rayon, utiliser la recherche géospatiale
  if (location.coordinates && location.coordinates.latitude && location.coordinates.longitude && radius) {
    const coordField = type === 'transporter' 
      ? 'serviceAreas.coordinates' 
      : `${addressPrefix}.coordinates`;
    query[coordField] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [location.coordinates.longitude, location.coordinates.latitude]
        },
        $maxDistance: radius * 1000 // Convertir en mètres
      }
    };
    return query;
  }
  
  // Sinon, utiliser les filtres par région/ville
  const orConditions = [];
  
  // Priorité 1 : Même ville
  if (prioritizeCity && location.city) {
    const normalizedCity = normalizeCity(location.city);
    if (type === 'transporter') {
      orConditions.push(
        { 'serviceAreas.cities': { $in: [new RegExp(normalizedCity, 'i')] } },
        { city: { $regex: normalizedCity, $options: 'i' } }
      );
    } else {
      orConditions.push(
        { [`${addressPrefix}.city`]: { $regex: normalizedCity, $options: 'i' } },
        { city: { $regex: normalizedCity, $options: 'i' } }
      );
    }
  }
  
  // Priorité 2 : Même région
  if (prioritizeRegion && location.region) {
    const normalizedRegion = normalizeRegion(location.region);
    if (type === 'transporter') {
      orConditions.push(
        { 'serviceAreas.region': { $regex: normalizedRegion, $options: 'i' } },
        { region: { $regex: normalizedRegion, $options: 'i' } }
      );
    } else {
      orConditions.push(
        { [`${addressPrefix}.region`]: { $regex: normalizedRegion, $options: 'i' } },
        { region: { $regex: normalizedRegion, $options: 'i' } }
      );
    }
  }
  
  // Priorité 3 : Même pays
  if (location.country) {
    if (type === 'transporter') {
      orConditions.push(
        { country: { $regex: location.country, $options: 'i' } }
      );
    } else {
      orConditions.push(
        { [`${addressPrefix}.country`]: { $regex: location.country, $options: 'i' } },
        { country: { $regex: location.country, $options: 'i' } }
      );
    }
  }
  
  if (orConditions.length > 0) {
    query.$or = orConditions;
  }
  
  return query;
}

module.exports = {
  getUserLocation,
  normalizeRegion,
  normalizeCity,
  buildLocationQuery
};

