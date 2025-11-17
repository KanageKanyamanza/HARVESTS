import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services';
import { useAuth } from './useAuth';

/**
 * Hook personnalisé pour récupérer les produits basés sur la localisation
 * @param {object} options - Options de configuration
 * @returns {object} État et fonctions pour gérer les produits basés sur la localisation
 */
export const useLocationBasedProducts = (options = {}) => {
  const {
    enabled = true,
    autoLoad = true,
    page = 1,
    limit = 20,
    category = null,
    subcategory = null,
    radius = null
  } = options;

  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /**
   * Charge les produits basés sur la localisation
   */
  const loadProducts = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        ...(radius && { radius })
      };

      const response = await productService.getProductsByLocation(params);

      if (response.data.status === 'success') {
        setProducts(response.data.data.products || []);
        setLocation(response.data.data.location || null);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des produits basés sur la localisation:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, category, subcategory, radius]);

  /**
   * Charge les produits avec détection automatique de localisation
   * Utilise l'endpoint getAllProducts avec useLocation=true
   */
  const loadProductsWithAutoLocation = useCallback(async (additionalParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        useLocation: 'true', // Activer la détection automatique
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        ...additionalParams
      };

      const response = await productService.getProducts(params);

      if (response.data.status === 'success') {
        setProducts(response.data.data.products || []);
        setLocation(response.data.data.location || null);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, category, subcategory]);

  // Chargement automatique si activé
  useEffect(() => {
    if (autoLoad && enabled) {
      loadProducts();
    }
  }, [autoLoad, enabled, loadProducts]);

  return {
    products,
    loading,
    error,
    location,
    totalPages,
    total,
    loadProducts,
    loadProductsWithAutoLocation,
    refetch: loadProducts
  };
};

