import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { producerService, reviewService } from "../services";
import { 
  FiMapPin, FiStar, FiPackage, FiArrowRight, FiChevronDown, FiX, FiSearch, FiCheck, FiGrid, FiList
} from "react-icons/fi";
import { Leaf, Sprout, Search, ShieldCheck } from "lucide-react";
import { getCountryName, SUPPORTED_COUNTRIES, REGIONAL_ZONES } from "../utils/countryMapper";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SEOHead from "../components/seo/SEOHead";
import { useApiCache } from "../hooks/useApiCache";

const Producers = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('preferred_view_mode') || 'grid';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('preferred_view_mode', mode);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCountry = searchParams.get("country") || "";
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  useEffect(() => {
    if (!isCountryOpen) return;
    const handleClickOutside = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCountryOpen]);

  const { getCachedData, setCachedData } = useApiCache(5 * 60 * 1000);

  const handleCountryChange = (country) => {
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (country) {
      newParams.set("country", country);
    } else {
      newParams.delete("country");
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const loadProducers = async (forceRefresh = false) => {
      const cacheKey = `producers_list_p${currentPage}_${selectedCountry}_q${searchQuery}`;
      try {
        if (!forceRefresh) {
          const cached = getCachedData(cacheKey);
          if (cached) {
            setProducers(cached.producers || []);
            setTotalPages(cached.totalPages || 1);
            setTotalCount(cached.totalCount || 0);
            setLoading(false);
            return;
          }
        }
        setLoading(true);

        const isMyZone = selectedCountry === "MY_ZONE";

        const fetchProducers = async (useLocation, country) => {
          const params = { page: currentPage, limit: 24 }; // Multiple de la grille (2/3/4 colonnes)
          if (useLocation !== undefined) params.useLocation = useLocation ? "true" : "false";
          if (country) params.country = country;
          if (searchQuery.trim()) params.search = searchQuery.trim();

          const response = await producerService.getAllPublic(params);
          if (response.data.status === "success") {
            return { 
              list: response.data.data.producers || [], 
              totalPages: response.data.totalPages || 1,
              total: response.data.total || (response.data.data.producers || []).length,
              location: response.data.data.location || null 
            };
          }
          return { list: [], totalPages: 1, total: 0, location: null };
        };

        let finalProducers = [];
        let pages = 1;
        let count = 0;

        if (isMyZone) {
          const res = await fetchProducers(true);
          finalProducers = res.list;
          pages = res.totalPages;
          count = res.total;
        } else if (!selectedCountry) {
          const [allResp, localResp] = await Promise.all([fetchProducers(false), fetchProducers(true)]);
          const allList = allResp.list;
          const localList = localResp.list;
          const seen = new Set();
          const merged = [];
          for (const v of localList) { merged.push({ ...v, isLocal: true }); seen.add(v._id); }
          for (const v of allList) { if (!seen.has(v._id)) merged.push(v); }
          finalProducers = merged;
          pages = allResp.totalPages;
          count = allResp.total;
        } else {
          const resp = await fetchProducers(false, selectedCountry);
          finalProducers = resp.list;
          pages = resp.totalPages;
          count = resp.total;
        }

        // Attach ratings if missing
        const withRatings = await Promise.all(finalProducers.map(async (p) => {
          if (!p?._id) return p;
          try {
            const statsResponse = await reviewService.getProducerRatingStats(p._id);
            const statsData = statsResponse?.data;
            if (statsData) {
              return { 
                ...p, 
                ratings: { ...(p.ratings || {}), average: statsData.averageRating || 0, count: statsData.totalReviews || 0 }, 
                stats: { ...(p.stats || {}), averageRating: statsData.averageRating || 0, totalReviews: statsData.totalReviews || 0 }, 
                reviewStats: statsData 
              };
            }
          } catch (e) { console.error(e); }
          return p;
        }));

        setProducers(withRatings);
        setTotalPages(pages);
        setTotalCount(count || withRatings.length);
        setCachedData(cacheKey, { producers: withRatings, totalPages: pages, totalCount: count || withRatings.length });
      } catch (error) {
        console.error("Erreur lors du chargement des producteurs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducers();
  }, [getCachedData, setCachedData, selectedCountry, currentPage, searchQuery]);

  const filteredProducers = producers.filter(p => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    const name = (p.shopInfo?.shopName || p.farmName || `${p.firstName} ${p.lastName}`).toLowerCase();
    const city = (p.address?.city || '').toLowerCase();
    const country = getCountryName(p.country).toLowerCase();
    return name.includes(term) || city.includes(term) || country.includes(term);
  });

  if (loading && producers.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des producteurs agricoles..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF6] pb-16">
      <SEOHead title="Producteurs Agricoles Certifiés | Harvests" description="Découvrez les exploitations agricoles et fermes locales certifiées." />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">

        {/* Hero Banner Agritech */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-6 overflow-hidden shadow-xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sprout className="w-4 h-4 text-[#31BC2E]" />
              <span>Exploitations & Fermes Verifiées</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-3">
              Nos Producteurs Agricoles
            </h1>
            
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              Achetez en direct des coopératives et agriculteurs certifiés. Produits ultra-frais, traçables et issus de circuits courts locaux.
            </p>
          </div>
        </div>

        {/* Search & Country Filter Toolbar (Sticky sous la Navbar 108px) */}
        <div className="sticky top-16 sm:top-20 lg:top-[116px] z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-emerald-100/90 p-3 sm:p-4 mb-6 transition-all">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Chercher une ferme, un producteur, une ville..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200/90 rounded-xl focus:ring-2 focus:ring-[#1A5514] focus:border-transparent outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Country Select Filter + Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56" ref={countryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCountryOpen((o) => !o)}
                  className="w-full flex items-center pl-9 pr-8 py-2 bg-white border border-gray-200/90 rounded-xl focus:ring-2 focus:ring-[#1A5514] text-xs font-bold text-gray-800 shadow-sm cursor-pointer relative text-left truncate"
                >
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 h-4 w-4 pointer-events-none" />
                  <span className="truncate">
                    {selectedCountry === "MY_ZONE" && "📍 Ma zone locale"}
                    {selectedCountry === "" && "🌍 Tous les pays"}
                    {selectedCountry &&
                      selectedCountry !== "MY_ZONE" &&
                      (REGIONAL_ZONES.find((z) => z.id === selectedCountry)?.label ||
                        (() => {
                          const c = SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry);
                          return c ? `${c.flag} ${c.name}` : selectedCountry;
                        })())}
                  </span>
                  <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none transition-transform ${isCountryOpen ? "rotate-180" : ""}`} />
                </button>

                {isCountryOpen && (
                  <div className="absolute z-30 mt-2 left-0 right-0 sm:w-64 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 max-h-80 overflow-y-auto py-2">
                    {[
                      { value: "MY_ZONE", label: "📍 Ma zone locale" },
                      { value: "", label: "🌍 Tous les pays" },
                    ].map((opt) => (
                      <button
                        key={opt.value || "all"}
                        onClick={() => {
                          handleCountryChange(opt.value);
                          setIsCountryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-left transition-colors ${
                          selectedCountry === opt.value
                            ? "bg-emerald-50 text-[#1A5514]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                        {selectedCountry === opt.value && <FiCheck className="h-4 w-4 text-[#1A5514]" />}
                      </button>
                    ))}

                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Zones régionales</p>
                    {REGIONAL_ZONES.map((z) => (
                      <button
                        key={z.id}
                        onClick={() => {
                          handleCountryChange(z.id);
                          setIsCountryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-left transition-colors ${
                          selectedCountry === z.id
                            ? "bg-emerald-50 text-[#1A5514] font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {z.label}
                        {selectedCountry === z.id && <FiCheck className="h-4 w-4 text-[#1A5514]" />}
                      </button>
                    ))}

                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pays</p>
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          handleCountryChange(c.code);
                          setIsCountryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-left transition-colors ${
                          selectedCountry === c.code
                            ? "bg-emerald-50 text-[#1A5514] font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{c.flag} {c.name}</span>
                        {selectedCountry === c.code && <FiCheck className="h-4 w-4 text-[#1A5514]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCountry && (
                <button
                  onClick={() => handleCountryChange("")}
                  className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 border border-gray-200 rounded-xl transition-colors"
                  title="Effacer le filtre pays"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}

              {/* Switcher Grille / Liste */}
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

          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Affichage de <strong className="text-gray-900">{filteredProducers.length}</strong> producteur{filteredProducers.length > 1 ? 's' : ''} (page {currentPage} sur {totalPages})
            </span>
          </div>
        </div>

        {/* Producers Cards Grid / List */}
        {filteredProducers.length > 0 ? (
          viewMode === 'grid' ? (
            /* VUE EN GRILLE (4 COLONNES) */
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducers.map((producer) => {
                const producerName = producer.shopInfo?.shopName ||
                  ((producer.farmName && producer.farmName !== "À compléter") ? producer.farmName : null) ||
                  `${producer.firstName} ${producer.lastName !== "À compléter" ? producer.lastName : ""}`.trim();
                const rating = producer.salesStats?.averageRating || producer.stats?.averageRating || 4.8;
                const reviewCount = producer.salesStats?.totalReviews || producer.stats?.totalReviews || 0;

                return (
                  <div 
                    key={producer._id} 
                    className="bg-white border border-gray-200/90 rounded-2xl hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                  >
                    <div>
                      {/* Banner Image */}
                      <div className="h-32 bg-gradient-to-r from-emerald-900 to-emerald-700 relative overflow-hidden">
                        {producer.shopBanner ? (
                          <img 
                            src={producer.shopBanner} 
                            alt={producerName} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                        )}

                        {/* Top Left Verified Badge */}
                        <div className="absolute top-2.5 left-2.5 bg-[#1A5514]/90 backdrop-blur-md border border-emerald-500/40 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm z-10">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#31BC2E]" />
                          <span>Producteur Vérifié</span>
                        </div>

                        {/* Top Right Rating Badge */}
                        <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1 shadow-sm z-10">
                          <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>{rating.toFixed(1)}</span>
                          {reviewCount > 0 && <span className="text-gray-300 font-normal">({reviewCount})</span>}
                        </div>
                      </div>

                      {/* Vendor Profile Avatar */}
                      <div className="px-4 -mt-7 flex items-end justify-between relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-gray-200/90 shadow-md overflow-hidden flex-shrink-0">
                          {producer.avatar ? (
                            <img src={producer.avatar} alt={producerName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-full rounded-lg bg-emerald-50 text-[#1A5514] font-black flex items-center justify-center text-lg">
                              {producer.firstName?.[0] || 'P'}
                            </div>
                          )}
                        </div>

                        {producer.isBio && (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1">
                            <Leaf className="w-3 h-3 text-emerald-600" />
                            <span>BIO</span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-4 pt-3 space-y-2 min-w-0">
                        <h3 className="text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors truncate whitespace-nowrap overflow-hidden block" title={producerName}>
                          {producerName}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-xs text-gray-500 font-medium truncate">
                          <FiMapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 flex-shrink-0" />
                          <span className="truncate whitespace-nowrap overflow-hidden">
                            {producer.address?.city ? `${producer.address.city}, ` : ''}{getCountryName(producer.country)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Footer Link */}
                    <Link
                      to={`/producers/${producer._id}`}
                      className="m-4 mt-0 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A5514] hover:text-[#31BC2E] transition-colors"
                    >
                      <span>Visiter l'exploitation</span>
                      <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VUE EN LISTE (1 SEULE COLONNE LARGE) */
            <div className="grid md:grid-cols-2 gap-3.5">
              {filteredProducers.map((producer) => {
                const producerName = producer.shopInfo?.shopName ||
                  ((producer.farmName && producer.farmName !== "À compléter") ? producer.farmName : null) ||
                  `${producer.firstName} ${producer.lastName !== "À compléter" ? producer.lastName : ""}`.trim();
                const rating = producer.salesStats?.averageRating || producer.stats?.averageRating || 4.8;
                const reviewCount = producer.salesStats?.totalReviews || producer.stats?.totalReviews || 0;

                return (
                  <div 
                    key={producer._id} 
                    className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0"
                  >
                    {/* Left: Avatar + Details */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-gray-200/90 shadow-md overflow-hidden flex-shrink-0">
                        {producer.avatar ? (
                          <img src={producer.avatar} alt={producerName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-emerald-50 text-[#1A5514] font-black flex items-center justify-center text-lg">
                            {producer.firstName?.[0] || 'P'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-sm sm:text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors truncate whitespace-nowrap overflow-hidden block" title={producerName}>
                            {producerName}
                          </h3>
                          
                          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex-shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Vérifié</span>
                          </div>

                          {producer.isBio && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 flex-shrink-0">
                              <Leaf className="w-3 h-3 text-emerald-600" />
                              <span>BIO</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium flex-wrap">
                          <span className="flex items-center">
                            <FiMapPin className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                            {producer.address?.city ? `${producer.address.city}, ` : ''}{getCountryName(producer.country)}
                          </span>

                          <span className="flex items-center text-yellow-600 font-bold">
                            <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                            {rating.toFixed(1)} {reviewCount > 0 && `(${reviewCount} avis)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: CTA Button */}
                    <div className="flex-shrink-0 self-end md:self-center">
                      <Link
                        to={`/producers/${producer._id}`}
                        className="bg-[#1A5514] hover:bg-[#31BC2E] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 group-hover:shadow-md"
                      >
                        <span>Visiter l'exploitation</span>
                        <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-[#161D14] mb-1">
              Aucun producteur trouvé
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              Aucun producteur agricole ne correspond aux filtres sélectionnés.
            </p>
            {(selectedCountry || searchQuery) && (
              <button
                onClick={() => { handleCountryChange(""); setSearchQuery(""); }}
                className="px-5 py-2 bg-[#1A5514] text-white text-xs font-bold rounded-full hover:bg-[#144210] transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Pagination Buttons */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-[#1A5514] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Producers;
