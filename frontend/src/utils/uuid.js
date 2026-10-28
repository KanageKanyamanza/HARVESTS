// Utilitaire pour générer des IDs uniques
export const generateUniqueId = () => {
  // Combinaison de timestamp, random et compteur pour garantir l'unicité
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  const counter = (generateUniqueId.counter = (generateUniqueId.counter || 0) + 1);
  
  return `${timestamp}-${randomPart}-${counter.toString(36)}`;
};
