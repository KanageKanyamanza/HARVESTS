import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { productService } from '../services';

/**
 * Hook personnalisé pour gérer les produits et leurs filtres
 * Modifié pour afficher séparément les produits producteurs/transformateurs et restaurateurs
 */
export const useProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: categoryFromRoute } = useParams();

  // États
  const [products, setProducts] = useState([]);
  const [restaurateurProducts, setRestaurateurProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromRoute || searchParams.get("category") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [isFeatured, setIsFeatured] = useState(
    searchParams.get("featured") === "true"
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // États debouncés
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedPriceRange, setDebouncedPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Producer/Transformer products (paginated)
      const producerParams = {
        page: currentPage,
        limit: 12, // User requested 12
        userType: 'producer,transformer',
        sort: sortBy === "newest" ? "-createdAt" : sortBy,
        useLocation: 'true'
      };

      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") {
        producerParams.search = debouncedSearchQuery.trim();
      }
      
      if (selectedCategory && selectedCategory !== "") {
        producerParams.category = selectedCategory;
      }

      if (debouncedPriceRange.min) producerParams.minPrice = debouncedPriceRange.min;
      if (debouncedPriceRange.max) producerParams.maxPrice = debouncedPriceRange.max;

      // 2. Fetch Restaurateur products (latest 12, not paginated here for simplicity as requested)
      const restaurateurParams = {
        page: 1,
        limit: 12,
        userType: 'restaurateur',
        sort: '-createdAt'
      };

      const [producerRes, restaurateurRes] = await Promise.all([
        productService.getProducts(producerParams),
        productService.getProducts(restaurateurParams)
      ]);

      if (producerRes.data.status === "success") {
        setProducts(producerRes.data.data.products || []);
        // Check where totalPages is located in the response
        setTotalPages(producerRes.data.totalPages || 1);
        setTotalProducts(producerRes.data.total || 0);
      }

      if (restaurateurRes.data.status === "success") {
        setRestaurateurProducts(restaurateurRes.data.data.products || []);
      }

    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      setError("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    selectedCategory,
    sortBy,
    debouncedPriceRange,
    debouncedSearchQuery,
    isFeatured
  ]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await productService.getCategories();
      if (response.data.status === "success") {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  }, []);

  // Synchroniser les paramètres URL avec l'état local
  useEffect(() => {
    const urlSearchQuery = searchParams.get("q") || "";
    const urlCategory = categoryFromRoute || searchParams.get("category") || "";
    const urlSort = searchParams.get("sort") || "newest";
    const urlFeatured = searchParams.get("featured") === "true";
    const urlPriceRange = {
      min: searchParams.get("minPrice") || "",
      max: searchParams.get("maxPrice") || "",
    };
    const urlPage = parseInt(searchParams.get("page")) || 1;

    setSearchQuery(urlSearchQuery);
    setSelectedCategory(urlCategory);
    setSortBy(urlSort);
    setIsFeatured(urlFeatured);
    setPriceRange(urlPriceRange);
    setCurrentPage(urlPage);

    setDebouncedSearchQuery(urlSearchQuery);
    setDebouncedPriceRange(urlPriceRange);
  }, [searchParams, categoryFromRoute]);

  // Charger les données
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // Debounce pour la recherche textuelle
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce pour les prix
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 800);

    return () => clearTimeout(timer);
  }, [priceRange]);

  // Recherche avec debounce
  useEffect(() => {
    const hasActiveFilters = debouncedSearchQuery || selectedCategory || debouncedPriceRange.min || debouncedPriceRange.max || isFeatured;
    
    if (hasActiveFilters || currentPage > 1) {
      setIsSearching(true);
      loadProducts().finally(() => setIsSearching(false));
    }
  }, [debouncedSearchQuery, selectedCategory, sortBy, isFeatured, debouncedPriceRange.min, debouncedPriceRange.max, currentPage, loadProducts]);

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    switch (filterType) {
      case "category":
        setSelectedCategory(value);
        break;
      case "sort":
        setSortBy(value);
        break;
      case "priceMin":
        setPriceRange((prev) => ({ ...prev, min: value }));
        break;
      case "priceMax":
        setPriceRange((prev) => ({ ...prev, max: value }));
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("newest");
    setIsFeatured(false);
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
    setSearchParams({});
  };

  return {
    products,
    restaurateurProducts,
    categories,
    loading,
    error,
    isSearching,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    sortBy,
    isFeatured,
    priceRange,
    currentPage,
    setCurrentPage,
    totalPages,
    totalProducts,
    handleFilterChange,
    clearFilters,
    loadProducts
  };
};
