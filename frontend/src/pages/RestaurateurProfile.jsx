import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { restaurateurService } from '../services';
import CloudinaryImage from '../components/common/CloudinaryImage';
import {
  FiMapPin,
  FiClock,
  FiCoffee,
  FiUsers,
  FiStar,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiPhone,
  FiMail,
  FiGlobe
} from 'react-icons/fi';

const RestaurateurProfile = () => {
  const { id } = useParams();
  const [restaurateur, setRestaurateur] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRestaurateur = async () => {
      try {
        setLoading(true);
        const response = await restaurateurService.getRestaurateur(id);
        const restaurateurData = response.data?.data?.restaurateur || response.data?.restaurateur;
        setRestaurateur(restaurateurData);
        
        // Charger les plats
        const dishesResponse = await restaurateurService.getRestaurateurDishes(id);
        setDishes(dishesResponse.data?.data?.dishes || []);
      } catch (error) {
        console.error('Erreur lors du chargement du restaurateur:', error);
        setError('Restaurateur non trouvé');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRestaurateur();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvests-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurateur) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Restaurateur non trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Le restaurateur que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
        </div>
      </div>
    );
  }

  const getRestaurantTypeLabel = (type) => {
    const types = {
      'fine-dining': 'Restaurant gastronomique',
      'casual': 'Restaurant décontracté',
      'fast-food': 'Restaurant rapide',
      'cafe': 'Café',
      'bar': 'Bar',
      'catering': 'Traiteur',
      'food-truck': 'Food truck',
      'bakery': 'Boulangerie'
    };
    return types[type] || type;
  };

  const getCuisineTypeLabel = (type) => {
    const types = {
      'african': 'Africaine',
      'french': 'Française',
      'italian': 'Italienne',
      'asian': 'Asiatique',
      'american': 'Américaine',
      'mediterranean': 'Méditerranéenne',
      'fusion': 'Fusion',
      'vegetarian': 'Végétarienne',
      'vegan': 'Végane'
    };
    return types[type] || type;
  };

  const getDayLabel = (day) => {
    const days = {
      'monday': 'Lundi',
      'tuesday': 'Mardi',
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi',
      'sunday': 'Dimanche'
    };
    return days[day] || day;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière */}
      {restaurateur.restaurantBanner && (
        <div className="h-64 w-full overflow-hidden">
          <CloudinaryImage
            publicId={restaurateur.restaurantBanner}
            alt={`Bannière de ${restaurateur.restaurantName}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Avatar et nom */}
              <div className="text-center mb-6">
                {restaurateur.avatar && (
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <CloudinaryImage
                      publicId={restaurateur.avatar}
                      alt={restaurateur.restaurantName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{restaurateur.restaurantName}</h1>
                <p className="text-gray-600">{getRestaurantTypeLabel(restaurateur.restaurantType)}</p>
              </div>

              {/* Informations de contact */}
              <div className="space-y-4">
                {restaurateur.address && (
                  <div className="flex items-start">
                    <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {restaurateur.address.street && `${restaurateur.address.street}, `}
                        {restaurateur.address.city}
                        {restaurateur.address.region && `, ${restaurateur.address.region}`}
                      </p>
                    </div>
                  </div>
                )}

                {restaurateur.phone && (
                  <div className="flex items-center">
                    <FiPhone className="h-5 w-5 text-gray-400 mr-3" />
                    <a href={`tel:${restaurateur.phone}`} className="text-sm text-gray-900 hover:text-harvests-green">
                      {restaurateur.phone}
                    </a>
                  </div>
                )}

                {restaurateur.email && (
                  <div className="flex items-center">
                    <FiMail className="h-5 w-5 text-gray-400 mr-3" />
                    <a href={`mailto:${restaurateur.email}`} className="text-sm text-gray-900 hover:text-harvests-green">
                      {restaurateur.email}
                    </a>
                  </div>
                )}

                <div className="flex items-center">
                  <FiUsers className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">
                    {restaurateur.seatingCapacity} places
                  </span>
                </div>
              </div>

              {/* Types de cuisine */}
              {restaurateur.cuisineTypes && restaurateur.cuisineTypes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Types de cuisine</h3>
                  <div className="flex flex-wrap gap-2">
                    {restaurateur.cuisineTypes.map((cuisine, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-harvests-green/10 text-harvests-green"
                      >
                        {getCuisineTypeLabel(cuisine)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services additionnels */}
              {restaurateur.additionalServices && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Services</h3>
                  <div className="space-y-2">
                    {restaurateur.additionalServices.catering && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Traiteur
                      </div>
                    )}
                    {restaurateur.additionalServices.delivery && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiTruck className="h-4 w-4 text-green-500 mr-2" />
                        Livraison
                      </div>
                    )}
                    {restaurateur.additionalServices.events && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Événements
                      </div>
                    )}
                    {restaurateur.additionalServices.mealPlanning && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Planification de repas
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Horaires d'ouverture */}
            {restaurateur.operatingHours && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Horaires d'ouverture</h3>
                <div className="space-y-2">
                  {Object.entries(restaurateur.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {getDayLabel(day)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Fermé'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu des plats */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Notre Menu</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Découvrez nos spécialités culinaires
                </p>
              </div>

              <div className="p-6">
                {dishes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dishes.map((dish) => (
                      <div key={dish._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {dish.image && (
                          <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                            <CloudinaryImage
                              publicId={dish.image}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{dish.name}</h3>
                          <span className="text-lg font-semibold text-harvests-green">
                            {dish.price} FCFA
                          </span>
                        </div>
                        {dish.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {dish.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{dish.preparationTime} min</span>
                          {dish.allergens && dish.allergens.length > 0 && (
                            <span>Allergènes: {dish.allergens.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Menu en cours de préparation</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Notre menu sera bientôt disponible.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurateurProfile;
