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
    <section className="py-20 bg-harvests-light" data-aos="fade-up">
      <div className="container-xl">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Produits Récents
          </h2>
          {/* CTA pour voir tous les produits */}
          <div className="flex whitespace-nowrap justify-end">
            <Link
              to="/products"
              className="font-semibold inline-flex items-center text-primary-500 hover:text-primary-600 hover:underline hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              Voir Tous
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="mb-5 text-center">
          <p className="text-sm text-gray-600">
            Découvrez les derniers produits ajoutés par nos producteurs
          </p>
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
          <>
            {/* Grille de produits */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;

