// Script pour nettoyer l'authentification
console.log('🧹 Nettoyage de l\'authentification...');

// Supprimer tous les tokens et données d'auth
localStorage.removeItem('harvests_token');
localStorage.removeItem('harvests_user');
localStorage.removeItem('harvests_auth_data');

console.log('✅ Authentification nettoyée');
console.log('🔄 Veuillez vous reconnecter');

// Rediriger vers la page de connexion
window.location.href = '/login';
