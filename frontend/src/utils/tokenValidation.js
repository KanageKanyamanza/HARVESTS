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
    // Vérifier que les parties sont en base64 valide
    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Vérifier l'expiration si présente
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= payload.exp) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
