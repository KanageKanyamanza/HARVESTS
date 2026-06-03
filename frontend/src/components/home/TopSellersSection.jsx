import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { producerService, transformerService, restaurateurService, reviewService } from '../../services';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiStar, FiArrowRight } from 'react-icons/fi';
import { Leaf } from 'lucide-react';
import { getCountryName } from '../../utils/countryMapper';

const TopSellersSection = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      // Fetch some producers to highlight
      const response = await producerService.getAllPublic({ limit: 4 });
      if (response.data.status === 'success') {
        const producers = response.data.data.producers || [];
        
        const sellersWithStats = await Promise.all(
          producers.map(async (producer) => {
            try {
              const statsResponse = await reviewService.getProducerRatingStats(producer._id);
              return {
                ...producer,
                ratingStats: statsResponse?.data || { averageRating: 0, totalReviews: 0 }
              };
            } catch (e) {
              return { ...producer, ratingStats: { averageRating: 0, totalReviews: 0 } };
            }
          })
        );
        
        setSellers(sellersWithStats);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des vendeurs à la une:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && sellers.length === 0) return null;

  return (
    <section className="bg-white mb-6 p-4 sm:p-6 mx-4 sm:mx-6 lg:mx-8 max-w-[1500px] lg:mx-auto rounded-sm shadow-sm relative z-10" data-aos="fade-up">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Vendeurs à la Une
        </h2>
        <Link
          to="/producers"
          className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
        >
          Découvrir plus
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sellers.map((seller) => (
            <Link
              key={seller._id}
              to={`/producers/${seller._id}`}
              className="bg-white border border-gray-200 rounded-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col items-center text-center p-4 relative"
            >
              {/* Cover Banner */}
              <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-emerald-400 to-emerald-600">
                {seller.shopBanner && (
                  <img src={seller.shopBanner} alt="" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
                )}
              </div>
              
              <div className="w-20 h-20 rounded-full bg-white p-1 border border-gray-200 shadow-sm z-10 mt-4 mb-3">
                <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt={seller.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary-700">{seller.firstName?.[0]}</span>
                  )}
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 truncate w-full z-10">
                {seller.shopInfo?.shopName || seller.farmName || `${seller.firstName} ${seller.lastName}`}
              </h3>
              
              <p className="text-xs text-gray-500 mt-1 mb-2 z-10">
                {getCountryName(seller.country)} {seller.address?.city && `• ${seller.address.city}`}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-3 z-10">
                <div className="flex items-center text-yellow-500 text-xs">
                  <FiStar className="mr-1 fill-current h-3 w-3" />
                  <span className="font-bold text-gray-800">{seller.ratingStats?.averageRating?.toFixed(1) || '0.0'}</span>
                </div>
                {seller.isBio && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <Leaf className="w-2.5 h-2.5 mr-1" />
                    BIO
                  </span>
                )}
              </div>

              <div className="mt-auto z-10 text-primary-600 text-xs font-bold uppercase tracking-wider group-hover:text-primary-800 flex items-center">
                Visiter la boutique <FiArrowRight className="ml-1 h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default TopSellersSection;
