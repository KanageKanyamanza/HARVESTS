import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { producerService } from '../services';
import { FiMapPin, FiStar, FiPackage, FiArrowRight } from 'react-icons/fi';

const Producers = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducers = async () => {
      try {
        const response = await producerService.getAllProducers({ limit: 20 });
        if (response.data.status === 'success') {
          setProducers(response.data.data.producers || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des producteurs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducers();
  }, []);

  const getCountryName = (code) => {
    const countries = {
      'CM': 'Cameroun',
      'SN': 'Sénégal',
      'CI': 'Côte d\'Ivoire',
      'GH': 'Ghana',
      'NG': 'Nigeria',
      'KE': 'Kenya'
    };
    return countries[code] || code;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des producteurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Producteurs</h1>
          <p className="text-xl text-gray-600">Découvrez les producteurs locaux qui cultivent des produits frais et de qualité</p>
        </div>

        {producers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {producers.map((producer) => (
              <Link 
                key={producer._id} 
                to={`/producers/${producer._id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden block group"
              >
                {/* Bannière en arrière-plan */}
                <div className="relative h-[175px] bg-gradient-to-r from-green-400 to-green-600">
                  {producer.shopBanner ? (
                    <img 
                      src={producer.shopBanner} 
                      alt="Bannière de la boutique"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className=" w-full h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                      <FiPackage className="w-12 h-12 text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Overlay pour améliorer la lisibilité */}
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  
                  {/* Photo de profil en coin inférieur gauche */}
                  <div className="absolute  bottom-5 left-5 transform -translate-x-2 translate-y-2">
                    <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                        {producer.avatar ? (
                          <img 
                            src={producer.avatar} 
                            alt={`${producer.firstName} ${producer.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600">
                              {producer.firstName?.[0]}{producer.lastName?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations en bas */}
                <div className="p-4 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                    {producer.farmName || `${producer.firstName} ${producer.lastName}`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {producer.firstName} {producer.lastName}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <FiMapPin className="mr-1" />
                    <span>{getCountryName(producer.country)}</span>
                    {producer.address?.city && (
                      <span className="ml-2">• {producer.address.city}</span>
                    )}
                  </div>

                  {/* Statistiques */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-yellow-600">
                      <FiStar className="mr-1" />
                      <span>{producer.salesStats?.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FiPackage className="mr-1" />
                      <span className='mr-1'>Produits</span>
                      <FiArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />

                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun producteur disponible</h3>
            <p className="text-gray-500">Revenez plus tard pour découvrir nos producteurs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Producers;
