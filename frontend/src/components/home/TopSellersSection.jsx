import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { producerService, reviewService } from '../../services';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiStar, FiArrowRight, FiMapPin } from 'react-icons/fi';
import { Leaf, Store, ShieldCheck, ArrowRight, Award } from 'lucide-react';
import { getCountryName } from '../../utils/countryMapper';
import { useGeoLocation } from '../../hooks/useGeoLocation';

const fallbackSellers = [
  {
    _id: "seller-1",
    firstName: "Norbert",
    lastName: "Ilboudo",
    farmName: "Ferme Agro-Maraîchère de Loumbila",
    country: "BF",
    isBio: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop",
    ratingStats: { averageRating: 4.9, totalReviews: 38 }
  },
  {
    _id: "seller-2",
    firstName: "Fatou",
    lastName: "Diallo",
    farmName: "Coopérative Féminine de Thiès",
    country: "SN",
    isBio: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a28?w=600&auto=format&fit=crop",
    ratingStats: { averageRating: 4.8, totalReviews: 29 }
  },
  {
    _id: "seller-3",
    firstName: "Kouassi",
    lastName: "Koffi",
    farmName: "Les Vergers Bio de Bonoua",
    country: "CI",
    isBio: false,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&auto=format&fit=crop",
    ratingStats: { averageRating: 5.0, totalReviews: 44 }
  },
  {
    _id: "seller-4",
    firstName: "Ibrahim",
    lastName: "Traoré",
    farmName: "Domaine Agricole de Ségou",
    country: "ML",
    isBio: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop",
    shopBanner: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&auto=format&fit=crop",
    ratingStats: { averageRating: 4.7, totalReviews: 22 }
  }
];

// Cache module (survit aux démontages) : 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let sectionCache = null;

const TopSellersSection = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocal, setIsLocal] = useState(false);
  const { countryCode, countryName, detected, loading: geoLoading } = useGeoLocation();

  useEffect(() => {
    if (!geoLoading) {
      loadSellers();
    }
  }, [geoLoading, countryCode]);

  const loadSellers = async () => {
    const cacheKey = countryCode || 'global';
    if (
      sectionCache &&
      sectionCache.key === cacheKey &&
      Date.now() - sectionCache.timestamp < CACHE_DURATION
    ) {
      setSellers(sectionCache.sellers);
      setIsLocal(sectionCache.isLocal);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const resp = await producerService.getAllPublic({ limit: 4 });
      const fetched = resp?.data?.data?.producers || [];

      if (fetched.length > 0) {
        const sellersWithStats = await Promise.all(
          fetched.map(async (producer) => {
            try {
              const statsResponse = await reviewService.getProducerRatingStats(producer._id);
              return {
                ...producer,
                ratingStats: statsResponse?.data || { averageRating: 4.8, totalReviews: 12 }
              };
            } catch (e) {
              return { ...producer, ratingStats: { averageRating: 4.8, totalReviews: 12 } };
            }
          })
        );
        setSellers(sellersWithStats);
        sectionCache = {
          key: cacheKey,
          sellers: sellersWithStats,
          isLocal: detected && Boolean(countryCode),
          timestamp: Date.now(),
        };
      } else {
        setSellers(fallbackSellers);
      }
      setIsLocal(detected && Boolean(countryCode));
    } catch (err) {
      console.error('Erreur lors du chargement des vendeurs à la une:', err);
      setSellers(fallbackSellers);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="md:bg-white my-6 p-0 sm:p-6 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto md:rounded-2xl md:shadow-agri-card md:border border-emerald-100/80 relative z-10" data-aos="fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A5514] uppercase tracking-wider mb-1">
            <Store className="w-4 h-4 text-[#31BC2E]" />
            <span>Producteurs Certifiés & Boutiques</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14]">
            Vendeurs & Fermes à la Une
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">Achetez en direct auprès des meilleurs producteurs vérifiés</p>
        </div>
        <Link
          to={isLocal && countryCode ? `/producteurs?country=${countryCode}` : '/producers'}
          className="hidden md:flex text-xs sm:text-sm font-bold text-[#1A5514] hover:text-[#31BC2E] transition-colors items-center gap-1"
        >
          Découvrir tous les producteurs →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {sellers.slice(0, 4).map((seller) => (
            <Link
              key={seller._id}
              to={`/producers/${seller._id}`}
              className="group bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 flex flex-col relative"
            >
              {/* Image de couverture / Banner */}
              <div className="relative h-24 sm:h-28 w-full bg-gradient-to-r from-[#1A5514] to-[#2E8B22] overflow-hidden">
                {seller.shopBanner ? (
                  <img src={seller.shopBanner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] opacity-90" />
                )}
                
                {/* Badges superposés sur la bannière */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  {seller.isBio ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-md">
                      <Leaf className="w-3 h-3" />
                      BIO
                    </span>
                  ) : <div />}

                  {/* Badge Étoiles Amazon Gold sur la bannière */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-md">
                    <FiStar className="fill-amber-400 text-amber-400 h-3.5 w-3.5" />
                    <span>{seller.ratingStats?.averageRating?.toFixed(1) || '4.8'}</span>
                    <span className="text-gray-200 text-[10px]">({seller.ratingStats?.totalReviews || '12'})</span>
                  </div>
                </div>
              </div>
              
              {/* Photo de profil fine du Producteur (Overlapping Banner) */}
              <div className="px-4 -mt-7 flex items-end justify-between relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-gray-200/90 shadow-md overflow-hidden flex-shrink-0">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt={seller.firstName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-emerald-100 flex items-center justify-center text-lg font-bold text-[#1A5514]">
                      {seller.firstName?.[0]}
                    </div>
                  )}
                </div>
              </div>

              {/* Infos Producteur & Ferme */}
              <div className="p-4 pt-2 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h3 className="font-extrabold text-[#161D14] text-sm sm:text-base group-hover:text-[#1A5514] transition-colors leading-snug line-clamp-1">
                    {seller.shopInfo?.shopName || seller.farmName || `${seller.firstName} ${seller.lastName}`}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 font-medium">
                    <FiMapPin className="text-emerald-600 h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {getCountryName(seller.country)} {seller.address?.city && `• ${seller.address.city}`}
                    </span>
                  </div>
                </div>

                {/* Bouton d'action */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A5514] group-hover:text-[#31BC2E] transition-colors">
                  <span>Visiter la boutique</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="md:hidden mx-auto text-center p-2 my-5">
        <Link
          to={isLocal && countryCode ? `/producteurs?country=${countryCode}` : '/producers'}
          className="text-xs sm:text-sm font-bold text-white hover:text-[#31BC2E] transition-colors bg-[#1A5514] rounded-full p-3 w-64 mx-auto flex items-center justify-center gap-1"
        >
          Découvrir tous les producteurs →
        </Link>
      </div>
    </section>
  );
};

export default TopSellersSection;
