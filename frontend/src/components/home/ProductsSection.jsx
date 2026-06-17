import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FiMapPin } from 'react-icons/fi';
import ProductCard from '../products/ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { productService } from '../../services';
import { useGeoLocation } from '../../hooks/useGeoLocation';

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
    try {
      setLoading(true);
      setError(null);

      // Récupérer local et global et fusionner (locaux d'abord)
      const [localResp, allResp] = await Promise.all([
        productService.getProducts({ limit: 6, sort: 'newest', useLocation: 'true' }),
        productService.getProducts({ limit: 6, sort: 'newest', useLocation: 'false' }),
      ]);

      const localList = localResp?.data?.status === 'success' ? localResp.data.data.products || [] : [];
      const allList = allResp?.data?.status === 'success' ? allResp.data.data.products || [] : [];

      const seen = new Set();
      const merged = [];
      for (const p of localList) { merged.push(p); seen.add(p._id); }
      for (const p of allList) { if (!seen.has(p._id)) merged.push(p); }

      const finalProducts = merged.slice(0, 6);

      setProducts(finalProducts);
      setIsLocal(detected && countryCode && localList.length > 0);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  // Ne pas afficher la section s'il n'y a pas de produits
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white mb-8 p-4 sm:p-6 mx-4 sm:mx-6 lg:mx-8 max-w-[1500px] lg:mx-auto rounded-sm shadow-sm relative z-10" data-aos="fade-up">
      {/* En-tête */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Produits Récents
          </h2>
          {isLocal && countryName && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              <FiMapPin className="h-3 w-3" />
              {countryName}
            </span>
          )}
        </div>
        <Link
          to={isLocal && countryCode ? `/products?country=${countryCode}` : '/products'}
          className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
        >
          Voir Tous
        </Link>
      </div>

      {/* Contenu */}
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
        <div className="relative">
          {/* Scrollable container */}
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide scroll-smooth">
            {products.map((product) => (
              <div key={product._id} className="min-w-[200px] max-w-[200px] sm:min-w-[240px] sm:max-w-[240px] snap-start flex-none">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsSection;

