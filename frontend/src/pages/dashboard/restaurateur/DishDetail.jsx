import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiDollarSign, FiTag, FiAlertTriangle, FiEdit, FiTrash2 } from 'react-icons/fi';
import { restaurateurService } from '../../../services';
import { useNotifications } from '../../../contexts/NotificationContext';

const DishDetail = () => {
  const { dishId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotifications();
  
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDish();
  }, [dishId]);

  const loadDish = async () => {
    try {
      setLoading(true);
      const response = await restaurateurService.getMyDishes();
      const dishes = response.data?.data?.dishes || [];
      const foundDish = dishes.find(d => d._id === dishId);
      
      if (foundDish) {
        setDish(foundDish);
      } else {
        setError('Plat non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du plat:', error);
      setError('Erreur lors du chargement du plat');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/restaurateur/dishes?edit=${dishId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      try {
        await restaurateurService.deleteDish(dishId);
        showSuccess('Plat supprimé avec succès');
        navigate('/restaurateur/dishes');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showError('Erreur lors de la suppression du plat');
      }
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await restaurateurService.updateDish(dishId, { 
        isAvailable: !dish.isAvailable 
      });
      setDish(prev => ({ ...prev, isAvailable: !prev.isAvailable }));
      showSuccess(`Plat ${!dish.isAvailable ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showError('Erreur lors de la mise à jour du plat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du plat...</p>
        </div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-red-500 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plat non trouvé</h1>
          <p className="text-gray-600 mb-6">{error || 'Ce plat n\'existe pas ou a été supprimé.'}</p>
          <button
            onClick={() => navigate('/restaurateur/dishes')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retour aux plats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harvests-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/restaurateur/dishes')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Retour aux plats
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiEdit className="mr-2" />
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiTrash2 className="mr-2" />
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {dish.image ? (
                dish.image.startsWith('data:image/') ? (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-2">🍽️</div>
                    <p>Aucune image</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title and Status */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{dish.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dish.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {dish.isAvailable ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
              <p className="text-gray-600 text-lg">{dish.description}</p>
            </div>

            {/* Price and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center text-green-600">
                  <FiDollarSign className="mr-2" />
                  <span className="font-semibold">Prix</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dish.price} FCFA
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center text-blue-600">
                  <FiClock className="mr-2" />
                  <span className="font-semibold">Temps de préparation</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dish.preparationTime} min
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center text-purple-600 mb-2">
                <FiTag className="mr-2" />
                <span className="font-semibold">Catégorie</span>
              </div>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {dish.category}
              </span>
            </div>

            {/* Allergens */}
            {dish.allergens && dish.allergens.length > 0 && (
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center text-orange-600 mb-3">
                  <FiAlertTriangle className="mr-2" />
                  <span className="font-semibold">Allergènes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dish.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleToggleAvailability}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    dish.isAvailable
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {dish.isAvailable ? 'Désactiver le plat' : 'Activer le plat'}
                </button>
                
                <button
                  onClick={handleEdit}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier les détails
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishDetail;
