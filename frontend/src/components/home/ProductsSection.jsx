import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../products/ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { productService } from '../../services';

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer 6 produits récents
      const response = await productService.getProducts({ limit: 6, sort: 'newest' });
      
      if (response.data.status === 'success') {
        setProducts(response.data.data.products || []);
      }
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
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Produits Récents
        </h2>
        <Link
          to="/products"
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
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar scroll-smooth">
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

