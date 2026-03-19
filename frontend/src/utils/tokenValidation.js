// Fonction centralisée pour vérifier la validité d'un token JWT
export const isValidToken = (token) => {
  if (!token || token === 'undefined' || token === 'null') {
    return false;
  }
  
  // Vérifier la structure JWT (3 parties séparées par des points)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    return false;
  }
  
  try {
    // Remplacer les caractères base64url par du base64 standard pour atob()
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Décoder le payload
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    
    // Vérifier l'expiration si présente
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= payload.exp) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur décodage token:', error);
    return false;
  }
};
