import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { restaurateurService } from '../services';
import { FiMapPin, FiStar, FiArrowRight, FiAward, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { UtensilsCrossed, ShieldCheck } from 'lucide-react';
import { getCountryName } from '../utils/countryMapper';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { useApiCache } from '../hooks/useApiCache';

const CUISINE_TYPE_LABELS = {
  african: 'Africaine',
  french: 'Française',
  italian: 'Italienne',
  asian: 'Asiatique',
  american: 'Américaine',
  mediterranean: 'Méditerranéenne',
  fusion: 'Fusion',
  vegetarian: 'Végétarienne',
  vegan: 'Végane',
};

const getCuisineLabel = (type) => CUISINE_TYPE_LABELS[type] || type;

const Restaurateurs = () => {
  const [restaurateurs, setRestaurateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('preferred_view_mode') || 'grid';
  });
  const { getCachedData, setCachedData } = useApiCache(5 * 60 * 1000);
  const hasLoadedRef = useRef(false);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('preferred_view_mode', mode);
  };

  useEffect(() => {
    const loadRestaurateurs = async (forceRefresh = false) => {
      if (hasLoadedRef.current && !forceRefresh) return;
      hasLoadedRef.current = true;

      try {
        const cacheKey = 'restaurateurs_list';

        if (!forceRefresh) {
          const cached = getCachedData(cacheKey);
          if (cached) {
            setRestaurateurs(cached);
            setLoading(false);
            hasLoadedRef.current = false;
            return;
          }
        }

        setLoading(true);

        const [allResp, localResp] = await Promise.all([
          restaurateurService.getAllPublic({ limit: 24, useLocation: 'false' }),
          restaurateurService.getAllPublic({ limit: 24, useLocation: 'true' }),
        ]);

        const allList = allResp.data.status === 'success' ? allResp.data.data.restaurateurs || [] : [];
        const localList = localResp.data.status === 'success' ? localResp.data.data.restaurateurs || [] : [];

        const seen = new Set();
        const merged = [];
        for (const r of localList) { merged.push(r); seen.add(r._id); }
        for (const r of allList) { if (!seen.has(r._id)) merged.push(r); }

        setRestaurateurs(merged);
        setCachedData(cacheKey, merged);
      } catch (error) {
        console.error('Erreur lors du chargement des restaurateurs:', error);
      } finally {
        setLoading(false);
        hasLoadedRef.current = false;
      }
    };

    loadRestaurateurs();
  }, [getCachedData, setCachedData]);

  const filteredRestaurateurs = restaurateurs.filter((r) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    const name = (r.restaurantName || `${r.firstName} ${r.lastName}`).toLowerCase();
    const city = (r.address?.city || '').toLowerCase();
    const country = getCountryName(r.country).toLowerCase();
    return name.includes(term) || city.includes(term) || country.includes(term);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des restaurateurs..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF6] pb-16">
      <SEOHead title="Restaurateurs | Harvests" description="Découvrez les restaurateurs qui s'approvisionnent en produits frais et locaux directement auprès des producteurs." />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">

        {/* Hero Banner Agritech */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-6 overflow-hidden shadow-xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <UtensilsCrossed className="w-4 h-4 text-[#31BC2E]" />
              <span>Restaurateurs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Restaurateurs
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Découvrez les restaurateurs qui s'approvisionnent en produits frais et locaux directement auprès des producteurs de la plateforme.
            </p>
          </div>
        </div>

        {/* Barre de recherche & filtres de vue */}
        <div className="sticky top-[var(--app-header-height)] z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-emerald-100/90 p-3 sm:p-4 mb-8 transition-all">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un restaurateur (nom, ville, pays)..."
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
                {filteredRestaurateurs.length} Restaurateur{filteredRestaurateurs.length > 1 ? 's' : ''}
              </span>

              <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Vue en grille"
                >
                  <FiGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grille</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'list' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Vue en liste"
                >
                  <FiList className="h-4 w-4" />
                  <span className="hidden sm:inline">Liste</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grille / Liste des restaurateurs */}
        {filteredRestaurateurs.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredRestaurateurs.map((restaurateur) => {
                const name = restaurateur.restaurantName || `${restaurateur.firstName} ${restaurateur.lastName}`;
                const rating = restaurateur.businessStats?.averageRating || restaurateur.businessStats?.supplierRating || 0;
                const cuisineType = restaurateur.cuisineTypes?.[0];

                return (
                  <Link
                    key={restaurateur._id}
                    to={`/restaurateurs/${restaurateur._id}`}
                    className="group bg-white border border-gray-200/90 rounded-2xl hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-r from-emerald-900 to-emerald-700 relative overflow-hidden">
                      {restaurateur.shopBanner || restaurateur.restaurantBanner ? (
                        <img
                          src={restaurateur.shopBanner || restaurateur.restaurantBanner}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                      )}

                      <div className="absolute top-2.5 left-2.5 bg-[#1A5514]/90 backdrop-blur-md border border-emerald-500/40 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm z-10">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#31BC2E]" />
                        <span>Vérifié</span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1 shadow-sm z-10">
                        <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="px-4 -mt-7 flex items-end justify-between relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-gray-200/90 shadow-md overflow-hidden flex-shrink-0">
                        {restaurateur.shopLogo ? (
                          <img src={restaurateur.shopLogo} alt={name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-emerald-50 text-[#1A5514] font-black flex items-center justify-center text-lg">
                            {restaurateur.restaurantName?.[0] || restaurateur.firstName?.[0] || 'R'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 pt-3 space-y-2 min-w-0 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors truncate" title={name}>
                          {name}
                        </h3>

                        <div className="flex items-center text-xs text-gray-500 font-medium truncate">
                          <FiMapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {getCountryName(restaurateur.country)}
                            {restaurateur.address?.city && ` • ${restaurateur.address.city}`}
                          </span>
                        </div>

                        {cuisineType && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <UtensilsCrossed className="w-3 h-3" />
                            {getCuisineLabel(cuisineType)}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A5514] group-hover:text-[#31BC2E] transition-colors">
                        <span className="flex items-center gap-1">
                          <FiAward className="w-3.5 h-3.5" />
                          Voir le menu
                        </span>
                        <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredRestaurateurs.map((restaurateur) => {
                const name = restaurateur.restaurantName || `${restaurateur.firstName} ${restaurateur.lastName}`;
                const rating = restaurateur.businessStats?.averageRating || restaurateur.businessStats?.supplierRating || 0;
                const cuisineType = restaurateur.cuisineTypes?.[0];

                return (
                  <Link
                    key={restaurateur._id}
                    to={`/restaurateurs/${restaurateur._id}`}
                    className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-gray-200/90 shadow-md overflow-hidden flex-shrink-0">
                        {restaurateur.shopLogo ? (
                          <img src={restaurateur.shopLogo} alt={name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-emerald-50 text-[#1A5514] font-black flex items-center justify-center text-lg">
                            {restaurateur.restaurantName?.[0] || restaurateur.firstName?.[0] || 'R'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-sm sm:text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors truncate" title={name}>
                            {name}
                          </h3>
                          <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex-shrink-0">
                            <ShieldCheck className="w-3 h-3 text-[#31BC2E]" />
                            Vérifié
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1 truncate">
                            <FiMapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            {getCountryName(restaurateur.country)}
                            {restaurateur.address?.city && ` • ${restaurateur.address.city}`}
                          </span>
                          <span className="flex items-center gap-1 text-yellow-600 shrink-0">
                            <FiStar className="w-3.5 h-3.5" />
                            {rating.toFixed(1)}
                          </span>
                        </div>
                        {cuisineType && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <UtensilsCrossed className="w-3 h-3" />
                            {getCuisineLabel(cuisineType)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 self-end md:self-center">
                      <span className="bg-[#1A5514] group-hover:bg-[#31BC2E] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2">
                        Voir le profil
                        <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-extrabold text-[#161D14] mb-2">Aucun restaurateur trouvé</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
              {searchQuery ? `Aucun restaurateur ne correspond à "${searchQuery}".` : 'Revenez plus tard pour découvrir nos restaurateurs.'}
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

export default Restaurateurs;
