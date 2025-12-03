// Fonction utilitaire pour construire une URL complète du frontend
function buildFrontendUrl(path) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.harvests.site';
  // Supprimer le slash final de l'URL du frontend si présent
  const baseUrl = frontendUrl.replace(/\/$/, '');
  // S'assurer que le chemin commence par un slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

module.exports = { buildFrontendUrl };

