import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CloudinaryImage from '../common/CloudinaryImage';
import LoadingSpinner from '../common/LoadingSpinner';
import { productService } from '../../services';

// Catégories par défaut si l'API échoue
const DEFAULT_CATEGORIES = ['fruits', 'vegetables', 'cereals', 'meat', 'dairy', 'fish', 'poultry', 'processed-foods'];

const CategoriesSection = () => {
  const [allCategories, setAllCategories] = useState(DEFAULT_CATEGORIES);
  const [displayedCategories, setDisplayedCategories] = useState(DEFAULT_CATEGORIES.slice(0, 4));
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryIndex, setCategoryIndex] = useState(0);

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

      // Charger les catégories depuis l'API
      const response = await productService.getCategories();
      if (response.data.status === 'success' && response.data.data?.length > 0) {
        const cats = response.data.data;
        setAllCategories(cats);
        
        // Afficher les 4 premières catégories
        const initialCats = cats.slice(0, 4);
        setDisplayedCategories(initialCats);
        
        // Charger un produit pour chaque catégorie affichée
        await Promise.all(initialCats.map(category => loadCategoryProduct(category)));
      } else {
        // Utiliser les catégories par défaut
        await Promise.all(displayedCategories.map(category => loadCategoryProduct(category)));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      // Utiliser les catégories par défaut en cas d'erreur
      await Promise.all(displayedCategories.map(category => loadCategoryProduct(category)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Rotation des catégories toutes les 3 minutes
  useEffect(() => {
    if (allCategories.length <= 4) return;

    const interval = setInterval(() => {
      setCategoryIndex(prev => {
        const newIndex = (prev + 4) % allCategories.length;
        const newCats = [];
        for (let i = 0; i < 4 && i < allCategories.length; i++) {
          newCats.push(allCategories[(newIndex + i) % allCategories.length]);
        }
        setDisplayedCategories(newCats);
        
        // Charger les produits pour les nouvelles catégories
        newCats.forEach(cat => {
          if (!categoryProducts[cat]) {
            loadCategoryProduct(cat);
          }
        });
        
        return newIndex;
      });
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, [allCategories, categoryProducts]);


  return (
    <section className="py-20 bg-harvests-light">
      <div className="container-xl">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Catégories Populaires
          </h2>
          {/* CTA pour voir toutes les catégories */}
          <div className="flex whitespace-nowrap justify-end">
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
            {displayedCategories.map((category) => {
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

