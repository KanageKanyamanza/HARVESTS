/**
 * Utilitaires pour gérer les visiteurs et leur géolocalisation
 */

const axios = require('axios');

/**
 * Récupère l'IP réelle du client (gère les proxies)
 * @param {object} req - Objet de requête Express
 * @returns {string} Adresse IP
 */
function getClientIP(req) {
  // Vérifier les headers de proxy
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0].trim();
  }
  
  // Vérifier le header X-Real-IP
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // IP directe
  return req.ip || req.connection.remoteAddress || '127.0.0.1';
}

/**
 * Récupère les informations sur l'appareil depuis le User-Agent
 * @param {string} userAgent - User-Agent string
 * @returns {object} Informations sur l'appareil
 */
function getDeviceInfo(userAgent) {
  const { analyzeDevice } = require('./deviceAnalyzer');
  return analyzeDevice(userAgent);
}

/**
 * Récupère les informations de géolocalisation depuis l'IP
 * @param {string} ipAddress - Adresse IP
 * @returns {Promise<object>} Informations de géolocalisation
 */
async function getLocationInfo(ipAddress) {
  // Ignorer les IPs locales
  if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
    return {
      country: 'Local',
      region: 'Local',
      city: 'Local'
    };
  }

  try {
    // Essayer ipapi.co en premier (1000 requêtes/jour gratuites)
    try {
      const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`, {
        timeout: 5000
      });
      
      if (response.data && !response.data.error) {
        return {
          country: response.data.country_name || response.data.country || 'Unknown',
          region: response.data.region || response.data.region_code || 'Unknown',
          city: response.data.city || 'Unknown'
        };
      }
    } catch (ipapiError) {
      console.log('📝 [BLOG VISITOR] ipapi.co failed, trying fallback...');
    }

    // Fallback vers ip-api.com (gratuit)
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
      timeout: 5000
    });
    
    if (response.data && response.data.status === 'success') {
      return {
        country: response.data.country || 'Unknown',
        region: response.data.regionName || response.data.region || 'Unknown',
        city: response.data.city || 'Unknown'
      };
    }
  } catch (error) {
    console.error('📝 [BLOG VISITOR] Error getting location info:', error.message);
  }

  // Retour par défaut
  return {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown'
  };
}

module.exports = {
  getClientIP,
  getDeviceInfo,
  getLocationInfo
};

