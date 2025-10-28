import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CloudinaryImage from '../common/CloudinaryImage';
import LoadingSpinner from '../common/LoadingSpinner';
import { productService } from '../../services';

// Définir les 4 catégories principales à afficher
const MAIN_CATEGORIES = ['fruits', 'vegetables', 'cereals', 'dairy'];

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCategoryLabel = (category) => {
    const labels = {
      'cereals': 'Céréales',
      'vegetables': 'Légumes',
      'fruits': 'Fruits',
      'legumes': 'Légumineuses',
      'tubers': 'Tubercules',
      'spices': 'Épices',
      'herbs': 'Herbes',
      'nuts': 'Noix',
      'seeds': 'Graines',
      'dairy': 'Produits Laitiers',
      'meat': 'Viande',
      'poultry': 'Volaille',
      'fish': 'Poisson',
      'processed-foods': 'Produits Transformés',
      'beverages': 'Boissons',
      'other': 'Autre'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'cereals': '🌾',
      'vegetables': '🥬',
      'fruits': '🍎',
      'legumes': '🫘',
      'tubers': '🥔',
      'spices': '🌶️',
      'herbs': '🌿',
      'nuts': '🥜',
      'seeds': '🌱',
      'dairy': '🥛',
      'meat': '🥩',
      'poultry': '🐔',
      'fish': '🐟',
      'processed-foods': '🥫',
      'beverages': '🥤',
      'other': '📦'
    };
    return icons[category] || '📦';
  };

  const loadCategoryProduct = async (category) => {
    try {
      const response = await productService.getProductsByCategory(category, { limit: 1 });
      if (response.data.status === 'success') {
        const products = response.data.data.products || [];
        if (products.length > 0) {
          setCategoryProducts(prev => ({
            ...prev,
            [category]: products[0]
          }));
        }
      }
    } catch (error) {
      console.error(`Erreur lors du chargement du produit pour ${category}:`, error);
    }
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger un produit pour chaque catégorie principale
      const productsPromises = MAIN_CATEGORIES.map(category =>
        loadCategoryProduct(category)
      );
      
      await Promise.all(productsPromises);
      setCategories(MAIN_CATEGORIES);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError('Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Debug: Logs pour comprendre le problème d'affichage
  console.log('🔍 CategoriesSection - loading:', loading, 'categories:', categories, 'categoryProducts:', categoryProducts);

  // Ne pas afficher la section s'il y a une erreur de chargement
  if (!loading && categories.length === 0) {
    console.log('❌ CategoriesSection cachée - categories.length === 0');
    return null;
  }

  return (
    <section className="py-20 bg-harvests-light">
      <div className="container-xl">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Catégories Populaires
          </h2>
          {/* CTA pour voir toutes les catégories */}
          <div className="flex justify-end">
            <Link
              to="/categories"
              className="font-semibold inline-flex items-center text-primary-500 hover:text-primary-600 hover:underline hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              Voir Toutes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="mb-5 text-center">
          <p className="text-sm text-gray-600">
            Explorez nos catégories de produits frais et de qualité
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
              onClick={loadCategories}
              className="btn bg-primary-500 text-white hover:bg-primary-600"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const product = categoryProducts[category];
              const primaryImage = product?.images?.find(img => img.isPrimary) || product?.images?.[0];
              
              return (
                <Link
                  key={category}
                  to={`/categories/${category}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image du produit */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-harvests-light">
                    {primaryImage ? (
                      <CloudinaryImage
                        src={primaryImage.url}
                        alt={getCategoryLabel(category)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        width={400}
                        height={300}
                        quality="auto"
                        crop="fill"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {getCategoryIcon(category)}
                      </div>
                    )}
                    {/* Overlay avec icône */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center justify-between text-white">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {getCategoryLabel(category)}
                            </h3>
                            <p className="text-xs text-white/80">
                              Découvrir la catégorie
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;

