import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transformerService } from '../services';
import { FiMapPin, FiStar, FiTool, FiArrowRight, FiClock, FiAward } from 'react-icons/fi';

const Transformers = () => {
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransformers = async () => {
      try {
        const response = await transformerService.getAllTransformers({ limit: 20 });
        if (response.data.status === 'success') {
          setTransformers(response.data.data.transformers || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des transformateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransformers();
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

  const getTransformationTypeLabel = (type) => {
    const types = {
      'processing': 'Transformation',
      'packaging': 'Emballage',
      'preservation': 'Conservation',
      'manufacturing': 'Fabrication',
      'mixed': 'Mixte'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des transformateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harvests-light">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Transformateurs</h1>
          <p className="text-xl text-gray-600">Découvrez les entreprises de transformation qui transforment vos produits frais</p>
        </div>

        {transformers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {transformers.map((transformer) => (
              <Link 
                key={transformer._id} 
                to={`/transformers/${transformer._id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden block group"
              >
                {/* Bannière en arrière-plan */}
                <div className="relative h-[175px] bg-gradient-to-r from-purple-400 to-purple-600">
                  {transformer.shopInfo?.shopBanner ? (
                    <img 
                      src={transformer.shopInfo.shopBanner} 
                      alt="Bannière de la boutique"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center" style={{display: transformer.shopInfo?.shopBanner ? 'none' : 'flex'}}>
                    <FiTool className="w-12 h-12 text-white opacity-50" />
                  </div>
                  
                  {/* Overlay pour améliorer la lisibilité */}
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  
                  {/* Photo de profil en coin inférieur gauche */}
                  <div className="absolute bottom-5 left-5 transform -translate-x-2 translate-y-2">
                    <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                        {transformer.shopInfo?.shopLogo ? (
                          <img 
                            src={transformer.shopInfo.shopLogo} 
                            alt={`${transformer.companyName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full bg-purple-100 flex items-center justify-center" style={{display: transformer.shopInfo?.shopLogo ? 'none' : 'flex'}}>
                          <span className="text-sm font-bold text-purple-600">
                            {transformer.companyName?.[0] || transformer.firstName?.[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations en bas */}
                <div className="p-4 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                    {transformer.shopInfo?.shopName || transformer.companyName || `${transformer.firstName} ${transformer.lastName}`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {transformer.firstName} {transformer.lastName}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <FiMapPin className="mr-1" />
                    <span>{getCountryName(transformer.country)}</span>
                    {transformer.address?.city && (
                      <span className="ml-2">• {transformer.address.city}</span>
                    )}
                  </div>

                  {/* Type de transformation */}
                  <div className="flex items-center text-purple-600 text-sm mb-3">
                    <FiTool className="mr-1" />
                    <span>{getTransformationTypeLabel(transformer.transformationType)}</span>
                  </div>

                  {/* Statistiques */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-yellow-600">
                      <FiStar className="mr-1" />
                      <span>{transformer.businessStats?.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FiAward className="mr-1" />
                      <span className='mr-1'>Services</span>
                      <FiArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun transformateur disponible</h3>
            <p className="text-gray-500">Revenez plus tard pour découvrir nos transformateurs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transformers;
