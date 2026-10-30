// Fonctions de gestion du localStorage pour l'authentification

export const saveAuthData = (user, token, tokenExpiry = null) => {
  // Vérification basique du token (structure seulement)
  if (!token || token === 'undefined' || token === 'null') {
    console.warn('Tentative de sauvegarde d\'un token vide');
    return;
  }
  
  const authData = {
    user,
    token,
    lastActivity: new Date().toISOString(),
    tokenExpiry
  };
  
  try {
    localStorage.setItem('harvests_user', JSON.stringify(user));
    localStorage.setItem('harvests_token', token);
    localStorage.setItem('harvests_auth_data', JSON.stringify(authData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('harvests_user');
  localStorage.removeItem('harvests_token');
  localStorage.removeItem('harvests_auth_data');
};
