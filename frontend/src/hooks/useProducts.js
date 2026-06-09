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
  const [isBio, setIsBio] = useState(searchParams.get("bio") === "true");
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get("country") || "");
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
      // If a specific country is selected (including zones), request that country with useLocation=false
      // If selectedCountry === 'MY_ZONE' -> only local products
      // If no country selected -> fetch both all and local, then merge with local first
      const baseProducerParams = {
        page: currentPage,
        limit: 12, // User requested 12
        userType: 'producer,transformer',
        sort: sortBy === "newest" ? "-createdAt" : sortBy,
      };

      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") baseProducerParams.search = debouncedSearchQuery.trim();
      if (selectedCategory && selectedCategory !== "") baseProducerParams.category = selectedCategory;
      if (isBio) baseProducerParams.isBio = 'true';
      if (debouncedPriceRange.min) baseProducerParams.minPrice = debouncedPriceRange.min;
      if (debouncedPriceRange.max) baseProducerParams.maxPrice = debouncedPriceRange.max;

      // 2. Fetch Restaurateur products (latest 12)
      const restaurateurParams = {
        page: 1,
        limit: 12,
        userType: 'restaurateur',
        sort: '-createdAt'
      };

      if (selectedCountry && selectedCountry !== "") {
        restaurateurParams.country = selectedCountry;
      }

      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") {
        restaurateurParams.search = debouncedSearchQuery.trim();
      }

      if (isBio) restaurateurParams.isBio = 'true';

      let producerList = [];
      let total = 0;
      let pages = 1;

      if (selectedCountry === "MY_ZONE") {
        const localParams = { ...baseProducerParams, useLocation: 'true' };
        const producerRes = await productService.getProducts(localParams);
        if (producerRes.data.status === "success") {
          producerList = producerRes.data.data.products || [];
          pages = producerRes.data.totalPages || 1;
          total = producerRes.data.total || 0;
        }
      } else if (!selectedCountry) {
        // fetch all and local, merge local first
        const [allRes, localRes] = await Promise.all([
          productService.getProducts({ ...baseProducerParams, useLocation: 'false' }),
          productService.getProducts({ ...baseProducerParams, useLocation: 'true' }),
        ]);
        const allList = allRes.data.status === 'success' ? allRes.data.data.products || [] : [];
        const localList = localRes.data.status === 'success' ? localRes.data.data.products || [] : [];

        const seen = new Set();
        const merged = [];
        for (const p of localList) { merged.push({ ...p, isLocal: true }); seen.add(p._id); }
        for (const p of allList) { if (!seen.has(p._id)) merged.push(p); }
        producerList = merged;
        pages = allRes.data.totalPages || 1;
        total = allRes.data.total || merged.length;
      } else {
        const countryParams = { ...baseProducerParams, useLocation: 'false', country: selectedCountry };
        const producerRes = await productService.getProducts(countryParams);
        if (producerRes.data.status === "success") {
          producerList = producerRes.data.data.products || [];
          pages = producerRes.data.totalPages || 1;
          total = producerRes.data.total || 0;
        }
      }

      // Restaurateur products (still per-country or default)
      const [_, restaurateurRes] = await Promise.all([
        Promise.resolve(),
        productService.getProducts(restaurateurParams)
      ]);

      if (restaurateurRes.data.status === "success") {
        setRestaurateurProducts(restaurateurRes.data.data.products || []);
      }

      setProducts(producerList);
      setTotalPages(pages);
      setTotalProducts(total);

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
    isFeatured,
    isBio,
    selectedCountry
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
    const urlBio = searchParams.get("bio") === "true";
    const urlPriceRange = {
      min: searchParams.get("minPrice") || "",
      max: searchParams.get("maxPrice") || "",
    };
    const urlCountry = searchParams.get("country") || "";
    const urlPage = parseInt(searchParams.get("page")) || 1;

    setSearchQuery(urlSearchQuery);
    setSelectedCategory(urlCategory);
    setSortBy(urlSort);
    setIsFeatured(urlFeatured);
    setIsBio(urlBio);
    setPriceRange(urlPriceRange);
    setSelectedCountry(urlCountry);
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
    const hasActiveFilters = debouncedSearchQuery || selectedCategory || selectedCountry || debouncedPriceRange.min || debouncedPriceRange.max || isFeatured || isBio;
    
    if (hasActiveFilters || currentPage > 1) {
      setIsSearching(true);
      loadProducts().finally(() => setIsSearching(false));
    }
  }, [debouncedSearchQuery, selectedCategory, selectedCountry, sortBy, isFeatured, isBio, debouncedPriceRange.min, debouncedPriceRange.max, currentPage, loadProducts]);

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    switch (filterType) {
      case "category":
        setSelectedCategory(value);
        break;
      case "country":
        setSelectedCountry(value);
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
      case "bio":
        setIsBio(value);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCountry("");
    setSortBy("newest");
    setIsFeatured(false);
    setIsBio(false);
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
    selectedCountry,
    sortBy,
    isFeatured,
    isBio,
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
