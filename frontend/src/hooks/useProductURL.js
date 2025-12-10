import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook pour synchroniser les filtres avec l'URL
 */
export const useProductURL = (
  debouncedSearchQuery,
  selectedCategory,
  sortBy,
  isFeatured,
  debouncedPriceRange,
  currentPage
) => {
  const navigate = useNavigate();

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("q", debouncedSearchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (isFeatured) params.set("featured", "true");
    if (debouncedPriceRange.min) params.set("minPrice", debouncedPriceRange.min);
    if (debouncedPriceRange.max) params.set("maxPrice", debouncedPriceRange.max);
    if (currentPage > 1) params.set("page", currentPage);

    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  }, [debouncedSearchQuery, selectedCategory, sortBy, isFeatured, debouncedPriceRange.min, debouncedPriceRange.max, currentPage, navigate]);

  // Mise à jour de l'URL avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL();
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [updateURL]);
};

