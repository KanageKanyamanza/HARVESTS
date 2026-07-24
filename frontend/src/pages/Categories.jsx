import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services';
import CloudinaryImage from '../components/common/CloudinaryImage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { 
  Wheat, Carrot, Apple, Bean, Flame, Leaf, Sprout, Milk, 
  Beef, Drumstick, Fish, Archive, CupSoda, Package as PackageLucide, 
  ArrowRight, Grid, Search, Layers, Sparkles
} from "lucide-react";
import { FiGrid, FiList, FiPackage, FiStar } from 'react-icons/fi';

const ALL_CATEGORIES = [
  "fruits", "vegetables", "cereals", "meat", "dairy", "fish",
  "poultry", "processed-foods", "legumes", "tubers", "spices",
  "herbs", "nuts", "seeds", "beverages", "other",
];

const LABELS = {
  cereals: 'Céréales & Grains', vegetables: 'Légumes Frais', fruits: 'Fruits de Saison',
  legumes: 'Légumineuses', tubers: 'Tubercules & Racines', spices: 'Épices Locales',
  herbs: 'Herbes Aromatiques', grains: 'Grains', nuts: 'Noix & Anacarde', seeds: 'Graines & Semences',
  dairy: 'Produits Laitiers', meat: 'Viande Bovine & Ovine', poultry: 'Volaille Bio',
  fish: 'Poisson & Halieutique', 'processed-foods': 'Produits Transformés',
  beverages: 'Jus & Boissons', other: 'Épicerie & Divers',
};

const DESCRIPTIONS = {
  cereals: 'Riz de vallée, maïs blanc/jaune, mil, sorgho et céréales locales',
  vegetables: 'Tomates mûres, choux, oignons, épinards et légumes maraîchers',
  fruits: 'Mangues fraîches, ananas sucrés, bananes et fruits tropicaux',
  legumes: 'Haricots niébé, pois de terre, lentilles et légumineuses',
  tubers: 'Manioc, ignames fraîches, patates douces et tubercules',
  spices: 'Soumbala bio, piment rouge, gingembre et condiments authentiques',
  herbs: 'Moringa pur, menthe fraîche et herbes aromatiques locales',
  nuts: 'Noix de cajou brutes et transformées, arachides de qualité',
  seeds: 'Semences certifiées et graines oléagineuses',
  dairy: 'Lait frais local, beurre de karité et produits laitiers',
  meat: 'Viande bovine, ovine et caprine issue d\'élevages durables',
  poultry: 'Poulets fermiers bio, pintades et œufs frais de ferme',
  fish: 'Poissons d\'eau douce, capitaine, tilapias et produits halieutiques',
  'processed-foods': 'Farines locales, huiles pressées à froid et conserve artisanale',
  beverages: 'Jus naturels de bissap, gingembre, tamarin et baobab',
  other: 'Produits agricoles divers et spécialités régionales',
};

const ICONS = {
  cereals: Wheat, vegetables: Carrot, fruits: Apple, legumes: Bean,
  tubers: Carrot, spices: Flame, herbs: Leaf, grains: Wheat,
  nuts: PackageLucide, seeds: Sprout, dairy: Milk, meat: Beef,
  poultry: Drumstick, fish: Fish, 'processed-foods': Archive,
  beverages: CupSoda, other: PackageLucide,
};

const CATEGORY_FALLBACK_IMAGES = {
  spices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop",
  tubers: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop",
  vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop",
  other: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&auto=format&fit=crop",
  fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop",
  cereals: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop",
  poultry: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop",
  "processed-foods": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop"
};

const Categories = () => {
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('preferred_view_mode') || 'grid';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('preferred_view_mode', mode);
  };
  const [searchQuery, setSearchQuery] = useState('');

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

  const getCategoryIcon = (category) => {
    const Icon = ICONS[category] || PackageLucide;
    return <Icon className="w-5 h-5 text-[#1A5514]" />;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price).replace('XOF', 'FCFA');

  const filteredCategories = visibleCategories.filter((cat) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (LABELS[cat] || cat).toLowerCase().includes(term) || (DESCRIPTIONS[cat] || '').toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF6] pb-16">
      <SEOHead title="Filières & Catégories Agricoles | Harvests" description="Explorez nos catégories de produits agricoles de qualité en direct des producteurs." />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 pt-2 sm:pt-3">

        {/* Hero Banner Agritech */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-4 sm:p-6 mb-4 overflow-hidden shadow-xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Grid className="w-4 h-4 text-[#31BC2E]" />
              <span>Filières & Sourcing Direct</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Catégories & Récoltes de la Marketplace
            </h1>
            
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Accédez aux meilleures filières agricoles africaines : fruits, légumes frais, tubercules, céréales, épices et produits transformés 100% traçables.
            </p>
          </div>
        </div>

        {/* Barre de recherche & filtres de vue (Sticky sous la Navbar 108px) */}
        <div className="sticky top-16 sm:top-20 lg:top-[116px] z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-emerald-100/90 p-3 sm:p-4 mb-8 transition-all">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une filière (ex: Légumes, Épices, Céréales)..."
                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200/90 rounded-xl focus:ring-2 focus:ring-[#1A5514] focus:border-transparent outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
                >
                  Effacer
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {filteredCategories.length} Catégorie{filteredCategories.length > 1 ? 's' : ''}
              </span>

              <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Vue en grille"
                >
                  <FiGrid className="h-4 w-4" />
                  <span>Grille</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'list' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Vue en liste"
                >
                  <FiList className="h-4 w-4" />
                  <span>Liste</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grille / Liste des Catégories */}
        {error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            <div className="text-red-600 font-bold mb-4">{error}</div>
            <button onClick={loadCategories} className="px-6 py-2.5 bg-[#1A5514] text-white font-bold rounded-full hover:bg-[#144210]">
              Réessayer
            </button>
          </div>
        ) : filteredCategories.length > 0 ? (
          viewMode === 'grid' ? (
            /* VUE EN GRILLE (3 colonnes) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCategories.map((category) => {
                const products = categoryProducts[category] || [];

                return (
                  <div 
                    key={category} 
                    className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                  >
                    <Link to={`/categories/${category}`} className="block p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* En-tête de la catégorie */}
                        <div className="flex items-start justify-between mb-3 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                              {getCategoryIcon(category)}
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors leading-snug">
                                {LABELS[category] || category}
                              </h3>
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                {products.length > 0 ? `${products.length} produit${products.length > 1 ? 's' : ''}` : 'Disponible'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                          {DESCRIPTIONS[category] || 'Produits agricoles de qualité en direct des producteurs.'}
                        </p>
                      </div>

                      {/* Aperçu des 4 produits phares */}
                      {products.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-[10px] font-extrabold text-[#1A5514] uppercase tracking-wider block mb-2">
                            Produits phares de la filière
                          </span>
                          <div className="grid grid-cols-4 gap-2">
                            {products.slice(0, 4).map((product) => {
                              const productName = product.name?.fr || product.name?.en || product.name;
                              const primaryImage = product.primaryImage?.url || product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || CATEGORY_FALLBACK_IMAGES[category];
                              return (
                                <div key={product._id} className="group/item">
                                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 relative mb-1">
                                    {primaryImage ? (
                                      <img
                                        src={primaryImage}
                                        alt={productName}
                                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FiPackage className="h-5 w-5" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-800 truncate" title={productName}>
                                    {productName}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Pied de carte avec action CTA */}
                    <Link 
                      to={`/categories/${category}`}
                      className="p-3.5 bg-[#F8FAF6] group-hover:bg-emerald-50/70 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A5514] group-hover:text-[#31BC2E] transition-colors"
                    >
                      <span>Explorer toute la filière</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VUE EN LISTE HORIZONTALE (1 seule colonne large) */
            <div className="flex flex-col gap-3.5">
              {filteredCategories.map((category) => {
                const products = categoryProducts[category] || [];

                return (
                  <div
                    key={category}
                    className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0"
                  >
                    {/* Gauche: Icône + Titre + Description */}
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {getCategoryIcon(category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base sm:text-lg font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors">
                            {LABELS[category] || category}
                          </h3>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            {products.length} produit{products.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                          {DESCRIPTIONS[category] || 'Produits agricoles de qualité en direct des producteurs.'}
                        </p>

                        {/* Thumbnails en ligne dans la vue liste */}
                        {products.length > 0 && (
                          <div className="flex items-center gap-3 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                            {products.map((p) => {
                              const pName = p.name?.fr || p.name?.en || p.name;
                              const img = p.primaryImage?.url || p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url || CATEGORY_FALLBACK_IMAGES[category];
                              return (
                                <div key={p._id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/70 rounded-lg px-2 py-1 flex-shrink-0">
                                  {img && <img src={img} alt={pName} className="w-6 h-6 rounded object-cover" />}
                                  <span className="text-[11px] font-bold text-gray-800 max-w-[100px] truncate">{pName}</span>
                                  <span className="text-[10px] font-extrabold text-[#1A5514]">{formatPrice(p.price)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Droite: Bouton CTA */}
                    <div className="flex-shrink-0 self-end md:self-center">
                      <Link
                        to={`/categories/${category}`}
                        className="bg-[#1A5514] hover:bg-[#31BC2E] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 group-hover:shadow-md"
                      >
                        <span>Explorer la filière</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            <FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-extrabold text-[#161D14] mb-2">Aucune catégorie trouvée</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
              {searchQuery ? `Aucune filière ne correspond à "${searchQuery}".` : 'Aucune catégorie disponible.'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="px-6 py-2.5 bg-[#1A5514] text-white font-bold rounded-full hover:bg-[#144210] text-xs transition-colors"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
