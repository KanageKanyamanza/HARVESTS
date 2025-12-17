import { useRef, useCallback } from 'react';

/**
 * Hook pour gérer le cache des appels API
 * @param {number} cacheDuration - Durée du cache en millisecondes (défaut: 5 minutes)
 * @returns {Object} - Objet avec les fonctions de gestion du cache
 */
export const useApiCache = (cacheDuration = 5 * 60 * 1000) => {
  const cacheRef = useRef(new Map());

  /**
   * Récupère les données du cache si elles existent et sont encore valides
   * @param {string} key - Clé de cache
   * @returns {Object|null} - Données en cache ou null
   */
  const getCachedData = useCallback((key) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cacheDuration) {
      // Cache expiré, le supprimer
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  }, [cacheDuration]);

  /**
   * Met des données en cache
   * @param {string} key - Clé de cache
   * @param {*} data - Données à mettre en cache
   */
  const setCachedData = useCallback((key, data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Vide le cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Supprime une entrée spécifique du cache
   * @param {string} key - Clé à supprimer
   */
  const removeCachedData = useCallback((key) => {
    cacheRef.current.delete(key);
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    removeCachedData
  };
};

