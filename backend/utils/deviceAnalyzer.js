/**
 * Utilitaires pour analyser les appareils et navigateurs
 */

/**
 * Analyse l'appareil depuis le User-Agent
 * @param {string} userAgent - User-Agent string
 * @returns {object} Informations sur l'appareil
 */
function analyzeDevice(userAgent) {
  if (!userAgent) {
    return {
      type: 'desktop',
      brand: 'Unknown',
      model: 'Unknown',
      os: 'Unknown',
      osVersion: 'Unknown',
      browser: 'Unknown',
      browserVersion: 'Unknown'
    };
  }

  const ua = userAgent.toLowerCase();
  
  // Détection du type d'appareil
  let type = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    type = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    type = 'tablet';
  }

  // Détection du système d'exploitation
  let os = 'Unknown';
  let osVersion = 'Unknown';
  
  if (ua.includes('windows')) {
    os = 'Windows';
    const match = ua.match(/windows nt (\d+\.\d+)/);
    if (match) {
      const version = parseFloat(match[1]);
      if (version === 10.0) osVersion = '10';
      else if (version === 6.3) osVersion = '8.1';
      else if (version === 6.2) osVersion = '8';
      else if (version === 6.1) osVersion = '7';
      else osVersion = match[1];
    }
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    os = 'macOS';
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (ua.includes('android')) {
    os = 'Android';
    const match = ua.match(/android (\d+\.\d+)/);
    if (match) osVersion = match[1];
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    const match = ua.match(/os (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // Détection du navigateur
  let browser = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('edg')) {
    browser = 'Edge';
    const match = ua.match(/edg\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
    const match = ua.match(/(?:opera|opr)\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }

  // Détection de la marque et du modèle (pour mobile)
  let brand = 'Unknown';
  let model = 'Unknown';
  
  if (type === 'mobile' || type === 'tablet') {
    if (ua.includes('iphone')) {
      brand = 'Apple';
      const match = ua.match(/iphone\s*os\s*(\d+[._]\d+)/);
      if (match) model = `iPhone (iOS ${match[1].replace('_', '.')})`;
      else model = 'iPhone';
    } else if (ua.includes('ipad')) {
      brand = 'Apple';
      model = 'iPad';
    } else if (ua.includes('android')) {
      const match = ua.match(/(?:^|\s)([a-z]+)\s+(?:build|mobile)/i);
      if (match) {
        brand = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      } else {
        brand = 'Android';
      }
      model = 'Android Device';
    } else if (ua.includes('samsung')) {
      brand = 'Samsung';
      model = 'Samsung Device';
    }
  } else {
    brand = os;
    model = `${os} ${osVersion}`;
  }

  return {
    type,
    brand,
    model,
    os,
    osVersion,
    browser,
    browserVersion
  };
}

/**
 * Extrait le domaine du référent
 * @param {string} referrer - URL du référent
 * @returns {string|null} Domaine du référent
 */
function extractReferrerDomain(referrer) {
  if (!referrer) return null;
  
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch (e) {
    return null;
  }
}

/**
 * Extrait les paramètres UTM de l'URL
 * @param {string} url - URL complète
 * @returns {object} Paramètres UTM
 */
function extractUTMParameters(url) {
  if (!url) return {};
  
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    return {
      utmSource: params.get('utm_source') || null,
      utmMedium: params.get('utm_medium') || null,
      utmCampaign: params.get('utm_campaign') || null
    };
  } catch (e) {
    return {};
  }
}

/**
 * Génère un ID de session unique
 * @returns {string} Session ID
 */
function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Détermine si une visite est un rebond
 * @param {object} visit - Objet de visite
 * @returns {boolean} True si rebond
 */
function isBounce(visit) {
  return (visit.timeOnPage < 30) || (visit.scrollDepth < 10);
}

module.exports = {
  analyzeDevice,
  extractReferrerDomain,
  extractUTMParameters,
  generateSessionId,
  isBounce
};

