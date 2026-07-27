import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { productService } from '../services';

/**
 * Hook personnalisé pour gérer les produits et leurs filtres
 * Modifié pour afficher séparément les produits producteurs/transformateurs et restaurateurs
 */
const getSortParam = (sortBy) => {
  switch (sortBy) {
    case "price_asc":
      return "price";
    case "price_desc":
      return "-price";
    case "rating":
      return "-stats.views";
    case "newest":
    default:
      return "-createdAt";
  }
};

/**
 * Hook personnalisé pour gérer les produits et leurs filtres
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

  // Filtres et recherche (initialisés depuis l'URL)
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
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
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

      const baseProducerParams = {
        page: currentPage,
        limit: 12,
        userType: 'producer,transformer',
        sort: getSortParam(sortBy),
      };

      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") baseProducerParams.search = debouncedSearchQuery.trim();
      if (selectedCategory && selectedCategory !== "") baseProducerParams.category = selectedCategory;
      if (isBio) baseProducerParams.isBio = 'true';
      if (debouncedPriceRange.min) baseProducerParams.minPrice = debouncedPriceRange.min;
      if (debouncedPriceRange.max) baseProducerParams.maxPrice = debouncedPriceRange.max;

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

  // Synchroniser la catégorie de route /categories/:category
  useEffect(() => {
    if (categoryFromRoute && categoryFromRoute !== selectedCategory) {
      setSelectedCategory(categoryFromRoute);
    }
  }, [categoryFromRoute]);

  // Charger les données
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // Debounce pour la recherche textuelle
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce pour les prix
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);

    return () => clearTimeout(timer);
  }, [priceRange]);

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("page");

    switch (filterType) {
      case "category":
        setSelectedCategory(value);
        if (value) newParams.set("category", value);
        else newParams.delete("category");
        break;
      case "country":
        setSelectedCountry(value);
        if (value) newParams.set("country", value);
        else newParams.delete("country");
        break;
      case "sort":
        setSortBy(value);
        if (value && value !== "newest") newParams.set("sort", value);
        else newParams.delete("sort");
        break;
      case "priceMin":
        setPriceRange((prev) => ({ ...prev, min: value }));
        if (value) newParams.set("minPrice", value);
        else newParams.delete("minPrice");
        break;
      case "priceMax":
        setPriceRange((prev) => ({ ...prev, max: value }));
        if (value) newParams.set("maxPrice", value);
        else newParams.delete("maxPrice");
        break;
      case "bio":
        setIsBio(value);
        if (value) newParams.set("bio", "true");
        else newParams.delete("bio");
        break;
      default:
        break;
    }

    setSearchParams(newParams, { replace: true });
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("page");
    if (query && query.trim() !== "") {
      newParams.set("q", query.trim());
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams, { replace: true });
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
    setSearchQuery: handleSearchChange,
    selectedCategory,
    selectedCountry,
    sortBy,
    isFeatured,
    isBio,
    priceRange,
    currentPage,
    setCurrentPage: (page) => {
      setCurrentPage(page);
      const newParams = new URLSearchParams(searchParams);
      if (page > 1) newParams.set("page", page.toString());
      else newParams.delete("page");
      setSearchParams(newParams, { replace: true });
    },
    totalPages,
    totalProducts,
    handleFilterChange,
    clearFilters,
    loadProducts
  };
};
