// Utilitaire pour générer des IDs uniques
export const generateUniqueId = () => {
  // Combinaison de timestamp, random et compteur pour garantir l'unicité
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  const counter = (generateUniqueId.counter = (generateUniqueId.counter || 0) + 1);
  
  return `${timestamp}-${randomPart}-${counter.toString(36)}`;
};

// Alternative avec crypto API si disponible
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback pour les navigateurs qui ne supportent pas crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
