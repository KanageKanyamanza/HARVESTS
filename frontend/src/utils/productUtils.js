/**
 * Utilitaires pour les produits
 */

/**
 * Parse un nom de produit qui peut être une chaîne simple ou un objet de traduction
 * @param {string|object} name - Le nom du produit (string ou {fr: string, en: string})
 * @param {string} language - La langue préférée ('fr' ou 'en')
 * @returns {string} - Le nom du produit dans la langue demandée
 */
export const parseProductName = (name, language = 'fr') => {
  if (!name) return 'Produit';
  
  // Si c'est déjà une chaîne simple (pas de traduction), la retourner
  if (typeof name === 'string' && !name.startsWith('{')) {
    return name;
  }
  
  // Si c'est une chaîne JSON (objet de traduction)
  if (typeof name === 'string' && name.startsWith('{')) {
    try {
      // Essayer de parser directement
      let parsed = JSON.parse(name);
      return parsed[language] || parsed.fr || parsed.en || 'Produit';
    } catch (error) {
      try {
        // Corriger les guillemets simples en guillemets doubles
        const correctedJson = name
          .replace(/'/g, '"')  // Remplacer tous les ' par "
          .replace(/(\w+):/g, '"$1":'); // Ajouter des guillemets autour des clés
        
        const parsed = JSON.parse(correctedJson);
        return parsed[language] || parsed.fr || parsed.en || 'Produit';
      } catch (secondError) {
        // Fallback : extraire le nom français avec une regex
        const frenchMatch = name.match(/fr:\s*['"]([^'"]+)['"]/);
        if (frenchMatch) {
          return frenchMatch[1];
        }
        
        // Fallback final
        return 'Produit';
      }
    }
  }
  
  // Si c'est déjà un objet
  if (typeof name === 'object' && name !== null) {
    return name[language] || name.fr || name.en || 'Produit';
  }
  
  return 'Produit';
};

/**
 * Parse une description de produit qui peut être une chaîne simple ou un objet de traduction
 * @param {string|object} description - La description du produit
 * @param {string} language - La langue préférée ('fr' ou 'en')
 * @returns {string} - La description du produit dans la langue demandée
 */
export const parseProductDescription = (description, language = 'fr') => {
  if (!description) return '';
  
  // Si c'est déjà une chaîne simple, la retourner
  if (typeof description === 'string') {
    return description;
  }
  
  // Si c'est un objet de traduction
  if (typeof description === 'object' && description !== null) {
    // Essayer de parser si c'est une chaîne JSON
    if (typeof description === 'string' && description.startsWith('{')) {
      try {
        const parsed = JSON.parse(description);
        return parsed[language] || parsed.fr || parsed.en || '';
      } catch (error) {
        console.warn('Erreur lors du parsing de la description de produit:', error);
        return '';
      }
    }
    
    // Si c'est déjà un objet
    return description[language] || description.fr || description.en || '';
  }
  
  return '';
};
