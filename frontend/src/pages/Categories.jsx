import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services';
import CloudinaryImage from '../components/common/CloudinaryImage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Wheat, Carrot, Apple, Bean, Flame, Leaf, Sprout, Milk, Beef, Drumstick, Fish, Archive, CupSoda, Package as PackageLucide } from "lucide-react";
import { FiGrid, FiList, FiPackage, FiStar, FiArrowRight, FiSearch } from 'react-icons/fi';

const ALL_CATEGORIES = [
  "fruits", "vegetables", "cereals", "meat", "dairy", "fish",
  "poultry", "processed-foods", "legumes", "tubers", "spices",
  "herbs", "nuts", "seeds", "beverages", "other",
];

const LABELS = {
  cereals: 'Céréales', vegetables: 'Légumes', fruits: 'Fruits',
  legumes: 'Légumineuses', tubers: 'Tubercules', spices: 'Épices',
  herbs: 'Herbes', grains: 'Grains', nuts: 'Noix', seeds: 'Graines',
  dairy: 'Produits laitiers', meat: 'Viande', poultry: 'Volaille',
  fish: 'Poisson', 'processed-foods': 'Aliments transformés',
  beverages: 'Boissons', other: 'Autres',
};

const DESCRIPTIONS = {
  cereals: 'Riz, maïs, mil, sorgho et autres céréales locales',
  vegetables: 'Légumes frais cultivés localement',
  fruits: 'Fruits de saison et tropicaux',
  legumes: 'Haricots, pois, lentilles et autres légumineuses',
  tubers: 'Manioc, igname, patate douce et autres tubercules',
  spices: 'Épices et condiments pour vos plats',
  herbs: 'Herbes aromatiques et médicinales',
  nuts: 'Noix, amandes et autres fruits à coque',
  seeds: 'Graines diverses pour la cuisine',
  dairy: 'Produits laitiers frais',
  meat: 'Viande fraîche de qualité',
  poultry: 'Volaille et œufs',
  fish: 'Poisson frais et fruits de mer',
  'processed-foods': 'Aliments transformés locaux',
  beverages: 'Boissons naturelles et jus',
  other: 'Autres produits agricoles',
};

const ICONS = {
  cereals: Wheat, vegetables: Carrot, fruits: Apple, legumes: Bean,
  tubers: Carrot, spices: Flame, herbs: Leaf, grains: Wheat,
  nuts: PackageLucide, seeds: Sprout, dairy: Milk, meat: Beef,
  poultry: Drumstick, fish: Fish, 'processed-foods': Archive,
  beverages: CupSoda, other: PackageLucide,
};

const SCROLL_SPEED = 0.5;

const Categories = () => {
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const scrollRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      let cats = ALL_CATEGORIES;
      try {
        const resp = await productService.getCategories();
        if (resp.data.status === 'success' && resp.data.data?.length > 0) {
          cats = resp.data.data;
        }
      } catch {}

      // Charger 4 produits par catégorie en parallèle
      const results = await Promise.allSettled(
        cats.map((cat) => productService.getProductsByCategory(cat, { limit: 4 }))
      );

      const products = {};
      const visible = [];
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const prods = result.value?.data?.data?.products || [];
          if (prods.length > 0) {
            products[cats[i]] = prods;
            visible.push(cats[i]);
          }
        }
      });

      setCategoryProducts(products);
      setVisibleCategories(visible);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  // Défilement automatique lent pour la section populaires
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || visibleCategories.length === 0) return;

    posRef.current = 0;
    const ITEM_W = 160 + 16; // width + gap

    const tick = () => {
      if (!pausedRef.current) {
        posRef.current += SCROLL_SPEED;
        const half = ITEM_W * visibleCategories.length;
        if (posRef.current >= half) posRef.current = 0;
        el.scrollLeft = posRef.current;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [visibleCategories]);

  const getCategoryIcon = (category) => {
    const Icon = ICONS[category] || PackageLucide;
    return <Icon className="w-[1em] h-[1em]" />;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

  const filteredCategories = visibleCategories.filter((cat) => {
    if (!searchQuery) return true;
    return (LABELS[cat] || cat).toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harvests-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nos Catégories</h1>
          <p className="text-gray-600">Explorez nos catégories de produits frais et de qualité</p>
        </div>

        {/* Barre de recherche + vue */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une catégorie..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Grille de catégories */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button onClick={loadCategories} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Réessayer
            </button>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            {filteredCategories.map((category) => {
              const products = categoryProducts[category] || [];

              return (
                <div key={category} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <Link to={`/categories/${category}`}>
                    {viewMode === 'grid' ? (
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{getCategoryIcon(category)}</div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{LABELS[category] || category}</h3>
                              <p className="text-sm text-gray-600">{DESCRIPTIONS[category] || 'Produits de qualité'}</p>
                            </div>
                          </div>
                          <FiArrowRight className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Produits populaires</span>
                            <span className="text-sm text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 [&>*:only-child]:col-span-2 [&>*:only-child]:w-1/2 [&>*:only-child]:mx-auto">
                            {products.slice(0, 4).map((product) => {
                              const productName = product.name?.fr || product.name?.en || product.name;
                              const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                              return (
                                <div key={product._id} className="group">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                                    {primaryImage ? (
                                      <CloudinaryImage
                                        src={primaryImage.url}
                                        alt={productName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        width={100} height={100} quality="auto" crop="fit"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FiPackage className="h-6 w-6" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs">
                                    <p className="font-medium text-gray-900 truncate">{productName}</p>
                                    <p className="text-green-600 font-semibold">{formatPrice(product.price)}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Voir tous les produits</span>
                          <FiArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex p-6">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-2xl">{getCategoryIcon(category)}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{LABELS[category] || category}</h3>
                            <p className="text-sm text-gray-600 mb-2">{DESCRIPTIONS[category] || 'Produits de qualité'}</p>
                            <div className="flex flex-wrap items-center sm:space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <FiPackage className="h-4 w-4 mr-1" />
                                {products.length} produit{products.length > 1 ? 's' : ''}
                              </span>
                              {products.length > 0 && (
                                <span className="flex items-center">
                                  <FiStar className="h-4 w-4 mr-1" />
                                  À partir de {formatPrice(Math.min(...products.map(p => p.price)))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <FiArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie trouvée</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Essayez de modifier votre recherche' : 'Aucune catégorie disponible pour le moment'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Effacer la recherche
              </button>
            )}
          </div>
        )}

        {/* Catégories populaires — défilement lent */}
        {visibleCategories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Catégories populaires</h2>
            <div
              ref={scrollRef}
              className="flex overflow-x-hidden gap-4 scrollbar-hide"
              onMouseEnter={() => { pausedRef.current = true; }}
              onMouseLeave={() => { pausedRef.current = false; }}
            >
              {[...visibleCategories, ...visibleCategories].map((category, idx) => (
                <Link
                  key={`${category}-${idx}`}
                  to={`/categories/${category}`}
                  className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow group flex-none"
                  style={{ width: 160 }}
                >
                  <div className="flex justify-center mb-2 text-3xl group-hover:scale-110 transition-transform">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 text-center">{LABELS[category] || category}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
