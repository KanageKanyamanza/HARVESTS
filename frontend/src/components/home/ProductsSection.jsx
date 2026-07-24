import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { FiMapPin } from 'react-icons/fi';
import ProductCard from '../products/ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { productService } from '../../services';
import { useGeoLocation } from '../../hooks/useGeoLocation';

const fallbackProducts = [
  {
    _id: "demo-1",
    name: "Chou pommé frais de Loumbila",
    shortDescription: "Chou frais croquant raccordé directement des champs maraîchers.",
    price: 300,
    unit: "unité",
    category: "vegetables",
    isInStock: true,
    rating: 4.8,
    reviewsCount: 24,
    producer: { farmName: "Ferme Norbert Ilboudo", country: "BF" },
    primaryImage: { url: "https://images.unsplash.com/photo-1598170845058-12f016726b51?w=500&auto=format&fit=crop" }
  },
  {
    _id: "demo-2",
    name: "Oignons rouges & blancs (Sac 25kg)",
    shortDescription: "Oignons locaux récoltés à maturité, séchés et triés à la main.",
    price: 6500,
    unit: "sac 25kg",
    category: "tubers",
    isInStock: true,
    rating: 4.9,
    reviewsCount: 56,
    producer: { farmName: "Coopérative Maraîchère Kadiogo", country: "BF" },
    primaryImage: { url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop" }
  },
  {
    _id: "demo-3",
    name: "Tomates fraîches de saison",
    shortDescription: "Tomates bien mûres et juteuses idéales pour sauces et salades.",
    price: 1500,
    unit: "carton 5kg",
    category: "vegetables",
    isInStock: true,
    rating: 4.7,
    reviewsCount: 19,
    producer: { farmName: "Agro-Ferme Saint François", country: "CI" },
    primaryImage: { url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop" }
  },
  {
    _id: "demo-4",
    name: "Mangues séchées bio de Bobo",
    shortDescription: "Tranches de mangues séchées sans sucre ajouté 100% naturelles.",
    price: 2500,
    unit: "sachet 500g",
    category: "processed-foods",
    isInStock: true,
    rating: 5.0,
    reviewsCount: 42,
    producer: { farmName: "Transformation Fruitière de l'Ouest", country: "BF" },
    primaryImage: { url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop" }
  },
  {
    _id: "demo-5",
    name: "Poulet Fermier Bio local",
    shortDescription: "Poulet de chair élevé en plein air aux céréales locales.",
    price: 3500,
    unit: "pièce",
    category: "poultry",
    isInStock: true,
    rating: 4.8,
    reviewsCount: 31,
    producer: { farmName: "Élevage Avicole Sangoulé", country: "SN" },
    primaryImage: { url: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop" }
  },
  {
    _id: "demo-6",
    name: "Ananas Victoria de Côte d'Ivoire",
    shortDescription: "Ananas très sucré et parfumé, récolté à juste maturité.",
    price: 800,
    unit: "pièce",
    category: "fruits",
    isInStock: true,
    rating: 4.9,
    reviewsCount: 27,
    producer: { farmName: "Vergers de Bonoua", country: "CI" },
    primaryImage: { url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500&auto=format&fit=crop" }
  }
];

// Légumes recherchés par nom pour compléter la section quand il n'y a pas
// assez de produits BIO disponibles.
const PRIORITY_VEGETABLE_TERMS = [
  "Laitue", "Épinard", "Amarante", "Oignons", "Tomates", "Chou", "Carotte", "Aubergine",
];

const AGRI_CATEGORIES = new Set([
  "vegetables", "fruits", "cereals", "tubers", "legumes",
  "spices", "herbs", "nuts", "seeds", "poultry", "meat", "fish"
]);

// Trier pour afficher d'abord les produits agricoles bruts (Légumes, Fruits, Céréales, etc.)
const sortAgriFirst = (items) => {
  return [...items].sort((a, b) => {
    const aIsAgri = AGRI_CATEGORIES.has(a.category) || ["Fraise", "Chou", "Oignons", "Tomates", "Mangues", "Ananas"].some(k => a.name?.includes(k));
    const bIsAgri = AGRI_CATEGORIES.has(b.category) || ["Fraise", "Chou", "Oignons", "Tomates", "Mangues", "Ananas"].some(k => b.name?.includes(k));
    if (aIsAgri && !bIsAgri) return -1;
    if (!aIsAgri && bIsAgri) return 1;
    return 0;
  });
};

// Cache module (survit aux démontages) : 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let sectionCache = null;

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocal, setIsLocal] = useState(false);
  const { countryCode, countryName, detected, loading: geoLoading } = useGeoLocation();

  useEffect(() => {
    if (!geoLoading) {
      loadProducts();
    }
  }, [geoLoading, countryCode]);

  const loadProducts = async () => {
    const cacheKey = countryCode || 'global';
    if (
      sectionCache &&
      sectionCache.key === cacheKey &&
      Date.now() - sectionCache.timestamp < CACHE_DURATION
    ) {
      setProducts(sectionCache.products);
      setIsLocal(sectionCache.isLocal);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // On affiche 12 produits. Priorité aux produits certifiés BIO ; si
      // pas assez de BIO disponibles, on complète avec les autres produits.
      const DISPLAY_COUNT = 12;
      const bioResponse = await productService.getProducts({ limit: DISPLAY_COUNT, sort: 'newest', isBio: 'true' });
      const bioFetched = bioResponse?.data?.data?.products || bioResponse?.data?.products || [];

      let combined = bioFetched;
      if (bioFetched.length < DISPLAY_COUNT) {
        const seen = new Set(bioFetched.map((p) => p._id));
        let filler = [];
        let missing = DISPLAY_COUNT - bioFetched.length;

        // Compléter en priorité avec des légumes courants recherchés par nom
        // (laitue, épinard, amarante, oignons, ...), avant de retomber sur
        // les produits les plus récents en général.
        for (const term of PRIORITY_VEGETABLE_TERMS) {
          if (missing <= 0) break;
          try {
            const searchResponse = await productService.getProducts({ search: term, limit: missing });
            const searchFetched = searchResponse?.data?.data?.products || searchResponse?.data?.products || [];
            for (const p of searchFetched) {
              if (!seen.has(p._id)) {
                seen.add(p._id);
                filler.push(p);
                missing -= 1;
                if (missing <= 0) break;
              }
            }
          } catch {}
        }

        // S'il manque encore des produits, compléter avec les plus récents.
        if (missing > 0) {
          const restResponse = await productService.getProducts({
            limit: missing * 3,
            sort: 'newest',
          });
          const restFetched = restResponse?.data?.data?.products || restResponse?.data?.products || [];
          filler = [...filler, ...restFetched.filter((p) => !seen.has(p._id)).slice(0, missing)];
        }

        combined = [...bioFetched, ...filler];
      }

      // combined est déjà ordonné (BIO d'abord, puis légumes prioritaires,
      // puis les plus récents) : ne pas le re-trier avec sortAgriFirst, sauf
      // pour le jeu de démo de secours qui n'a pas cet ordre.
      const finalProducts = (combined.length > 0 ? combined : sortAgriFirst(fallbackProducts)).slice(0, DISPLAY_COUNT);
      const finalIsLocal = detected && !!countryCode;

      sectionCache = {
        key: cacheKey,
        products: finalProducts,
        isLocal: finalIsLocal,
        timestamp: Date.now(),
      };

      setProducts(finalProducts);
      setIsLocal(finalIsLocal);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setProducts(sortAgriFirst(fallbackProducts).slice(0, 12));
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="md:bg-white my-6 p-0 sm:p-6 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto md:rounded-2xl md:shadow-agri-card md:border border-emerald-100/80 relative z-10" data-aos="fade-up">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A5514] uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4 text-[#31BC2E]" />
            <span>Récoltes Fraîches & Direct Producteur</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14]">
            Produits Agricoles & Récoltes de Saison
          </h2>
          {isLocal && countryName && (
            <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300/60 rounded-full px-3 py-1">
              <FiMapPin className="h-3 w-3 text-emerald-600" />
              Sourcing Local : {countryName}
            </span>
          )}
        </div>
        <Link
          to={isLocal && countryCode ? `/products?country=${countryCode}` : '/products'}
          className="hidden md:flex text-xs sm:text-sm font-bold text-[#1A5514] hover:text-[#31BC2E] transition-colors flex items-center gap-1"
        >
          Voir tout le catalogue →
        </Link>
      </div>

      {/* Contenu - Grille 4 colonnes parfaitement cadrée dans l'écran */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadProducts}
            className="btn bg-primary-500 text-white hover:bg-primary-600"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product._id} className="w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      <div className='md:hidden mx-auto text-center p-2 my-5'>
        <Link
          to={isLocal && countryCode ? `/products?country=${countryCode}` : '/products'}
          className="text-xs sm:text-sm font-bold text-white hover:text-[#31BC2E] transition-colors bg-[#1A5514] rounded-full p-3 w-64 mx-auto flex items-center justify-center gap-1"
        >
          Voir tout le catalogue →
        </Link>
      </div>
    </section>
  );
};

export default ProductsSection;

