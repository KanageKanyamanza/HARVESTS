import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurateurService } from '../../../services';
import { useNotifications } from '../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import { normalizeDishImage, getDishImageUrl } from '../../../utils/dishImageUtils';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiEye,
  FiEyeOff,
  FiClock,
  FiDollarSign,
  FiImage,
  FiExternalLink,
  FiRefreshCw
} from 'react-icons/fi';

const DishesManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [filter, setFilter] = useState('all'); // all, available, unavailable
  const [searchTerm, setSearchTerm] = useState('');

  const loadDishes = async () => {
    try {
      setLoading(true);
      const response = await restaurateurService.getDishes();
      let dishes = response.data?.data?.dishes || [];
      
      // Normaliser les données pour garantir la cohérence - TOUJOURS au format multilingue
      dishes = dishes.map(dish => {
        // S'assurer que name est TOUJOURS un objet avec fr/en
        if (!dish.name) {
          dish.name = { fr: '', en: '' };
        } else if (typeof dish.name === 'string') {
          dish.name = { fr: dish.name, en: dish.name };
        } else if (typeof dish.name === 'object' && dish.name !== null) {
          // S'assurer que les propriétés fr/en existent
          dish.name = {
            fr: dish.name.fr || dish.name.en || '',
            en: dish.name.en || dish.name.fr || ''
          };
        } else {
          dish.name = { fr: '', en: '' };
        }
        
        // S'assurer que description est TOUJOURS un objet avec fr/en
        if (!dish.description) {
          dish.description = { fr: '', en: '' };
        } else if (typeof dish.description === 'string') {
          dish.description = { fr: dish.description, en: dish.description };
        } else if (typeof dish.description === 'object' && dish.description !== null) {
          dish.description = {
            fr: dish.description.fr || dish.description.en || '',
            en: dish.description.en || dish.description.fr || ''
          };
        } else {
          dish.description = { fr: '', en: '' };
        }
        
        // Normaliser l'image du plat
        return normalizeDishImage(dish);
      });
      
      setDishes(dishes);
    } catch (error) {
      console.error('Erreur lors du chargement des plats:', error);
      
      // Vérifier si c'est l'erreur spécifique du backend
      if (error.response?.status === 500 && 
          error.response?.data?.message?.includes('Cast to ObjectId failed for value "me"')) {
        showError('Le service des plats est temporairement indisponible. Veuillez contacter l\'administrateur.');
      } else {
        showError('Erreur lors du chargement des plats');
      }
      
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDishes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDishUpdate = async (dishData) => {
    if (!editingDish) {
      showError('Aucun plat sélectionné pour la modification.');
      return;
    }

    try {
      setLoading(true);
      const response = await restaurateurService.updateDish(editingDish._id, dishData);
      showSuccess('Plat mis à jour. Une nouvelle validation est nécessaire.');

      if (response?.data?.data?.dish) {
        const updatedDish = response.data.data.dish;

        if (!updatedDish.name) {
          updatedDish.name = { fr: '', en: '' };
        } else if (typeof updatedDish.name === 'string') {
          updatedDish.name = { fr: updatedDish.name, en: updatedDish.name };
        } else if (typeof updatedDish.name === 'object' && updatedDish.name !== null) {
          updatedDish.name = {
            fr: updatedDish.name.fr || updatedDish.name.en || '',
            en: updatedDish.name.en || updatedDish.name.fr || ''
          };
        } else {
          updatedDish.name = { fr: '', en: '' };
        }

        if (!updatedDish.description) {
          updatedDish.description = { fr: '', en: '' };
        } else if (typeof updatedDish.description === 'string') {
          updatedDish.description = { fr: updatedDish.description, en: updatedDish.description };
        } else if (typeof updatedDish.description === 'object' && updatedDish.description !== null) {
          updatedDish.description = {
            fr: updatedDish.description.fr || updatedDish.description.en || '',
            en: updatedDish.description.en || updatedDish.description.fr || ''
          };
        } else {
          updatedDish.description = { fr: '', en: '' };
        }

        setDishes(prev => prev.map(dish =>
          dish._id === updatedDish._id ? updatedDish : dish
        ));
      }

      await loadDishes();
      setIsEditModalOpen(false);
      setEditingDish(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du plat:', error);
      showError('Erreur lors de la sauvegarde du plat');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;
    
    try {
      setLoading(true);
      await restaurateurService.deleteDish(dishId);
      setDishes(prev => prev.filter(dish => dish._id !== dishId));
      showSuccess('Plat supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du plat:', error);
      showError('Erreur lors de la suppression du plat');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setIsEditModalOpen(true);
  };

  // Normaliser les données une fois avant le filtrage (double protection)
  const normalizedDishes = useMemo(() => {
    return dishes.map(dish => {
      if (!dish) return dish;
      
      // S'assurer que name est TOUJOURS un objet
      if (!dish.name || typeof dish.name !== 'object' || dish.name === null) {
        if (typeof dish.name === 'string') {
          dish = { ...dish, name: { fr: dish.name, en: dish.name } };
        } else {
          dish = { ...dish, name: { fr: '', en: '' } };
        }
      } else {
        dish = { 
          ...dish, 
          name: {
            fr: dish.name.fr || dish.name.en || '',
            en: dish.name.en || dish.name.fr || ''
          }
        };
      }
      
      // S'assurer que description est TOUJOURS un objet
      if (!dish.description || typeof dish.description !== 'object' || dish.description === null) {
        if (typeof dish.description === 'string') {
          dish = { ...dish, description: { fr: dish.description, en: dish.description } };
        } else {
          dish = { ...dish, description: { fr: '', en: '' } };
        }
      } else {
        dish = { 
          ...dish, 
          description: {
            fr: dish.description.fr || dish.description.en || '',
            en: dish.description.en || dish.description.fr || ''
          }
        };
      }
      
      return dish;
    });
  }, [dishes]);

  const filteredDishes = normalizedDishes.filter(dish => {
    try {
      if (!dish) return false; // Protection contre les données invalides
      
      const matchesFilter = filter === 'all' || 
        (filter === 'available' && dish.isActive) ||
        (filter === 'unavailable' && !dish.isActive);
      
      // Si pas de terme de recherche, retourner selon le filtre uniquement
      if (!searchTerm || searchTerm.trim() === '') {
        return matchesFilter;
      }
      
      // Extraire et convertir en string de manière sécurisée
      let dishName = '';
      if (dish.name) {
        if (typeof dish.name === 'string') {
          dishName = dish.name;
        } else if (typeof dish.name === 'object' && dish.name !== null) {
          dishName = dish.name.fr || dish.name.en || '';
        }
      }
      
      let dishDescription = '';
      if (dish.description) {
        if (typeof dish.description === 'string') {
          dishDescription = dish.description;
        } else if (typeof dish.description === 'object' && dish.description !== null) {
          dishDescription = dish.description.fr || dish.description.en || '';
        }
      }
      
      // Conversion finale en string pour sécurité - jamais null/undefined
      const dishNameStr = String(dishName || '').trim();
      const dishDescriptionStr = String(dishDescription || '').trim();
      
      // Vérification supplémentaire avant toLowerCase
      const searchTermLower = String(searchTerm || '').toLowerCase().trim();
      
      // Protection supplémentaire : vérifier que ce sont bien des strings
      if (typeof dishNameStr !== 'string' || typeof dishDescriptionStr !== 'string') {
        console.warn('Type invalide détecté:', { dishNameStr, dishDescriptionStr, dish });
        return matchesFilter; // Retourner selon le filtre uniquement si les types sont invalides
      }
      
      const matchesSearch = 
        dishNameStr.toLowerCase().includes(searchTermLower) ||
        dishDescriptionStr.toLowerCase().includes(searchTermLower);
      
      return matchesFilter && matchesSearch;
    } catch (error) {
      console.error('Erreur lors du filtrage du plat:', dish, error);
      return false; // Exclure les plats qui causent des erreurs
    }
  });

  const getCategoryLabel = (category) => {
    const categories = {
      'entree': 'Entrée',
      'plat': 'Plat principal',
      'dessert': 'Dessert',
      'boisson': 'Boisson',
      'accompagnement': 'Accompagnement'
    };
    return categories[category] || category;
  };

  if (loading && dishes.length === 0) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvests-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des plats...</p>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  const getStatusBadge = (dish) => {
    const normalized = dish.status || 'pending-review';
    const map = {
      'approved': {
        label: 'Approuvé',
        classes: 'bg-green-100 text-green-700'
      },
      'pending-review': {
        label: 'En attente de validation',
        classes: 'bg-yellow-100 text-yellow-700'
      },
      'draft': {
        label: 'Brouillon',
        classes: 'bg-gray-100 text-gray-600'
      },
      'rejected': {
        label: 'Rejeté',
        classes: 'bg-red-100 text-red-700'
      }
    };
    return map[normalized] || map['pending-review'];
  };

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Plats</h1>
          <p className="mt-2 text-gray-600">
            Gérez votre menu et vos spécialités culinaires
          </p>
        </div>

        {/* Actions et Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/restaurateur/dishes/add')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvests-green"
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Ajouter un plat
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
                />
                <FiPackage className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              {/* Filtres */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
              >
                <option value="all">Tous les plats</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">Indisponibles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modale de plat */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <DishForm
                dish={editingDish}
                onSubmit={handleDishUpdate}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setEditingDish(null);
                }}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Liste des plats */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Mes Plats ({filteredDishes.length})
            </h2>
          </div>

          <div className="p-6">
            {filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map((dish) => {
                  const statusInfo = getStatusBadge(dish);
                  const isAwaitingApproval = (dish.status || 'pending-review') !== 'approved';

                  return (
                  <div key={dish._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Image */}
                    {dish.image ? (
                      <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                        <CloudinaryImage
                          src={getDishImageUrl(dish)}
                          alt={dish.name?.fr || dish.name?.en || dish.name || 'Plat'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{display: 'none'}}>
                          <FiImage className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FiImage className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    {/* Informations du plat */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{dish.name?.fr || dish.name?.en || dish.name || 'Plat'}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.classes}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          (dish.status === 'approved' && dish.isActive !== false) || dish.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {(dish.status === 'approved' && dish.isActive !== false) || dish.isActive ? 'Disponible' : 'Indisponible'}
                        </span>
                        {isAwaitingApproval && (
                          <span className="text-xs text-yellow-600 font-medium">Validation requise</span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">{dish.description?.fr || dish.description?.en || dish.description || ''}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <FiDollarSign className="h-4 w-4 mr-1" />
                          {dish.price} FCFA
                        </span>
                        <span className="flex items-center">
                          <FiClock className="h-4 w-4 mr-1" />
                          {dish.dishInfo?.preparationTime || dish.preparationTime || 30}min
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        {getCategoryLabel(dish.dishInfo?.category || dish.category)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {dish.status === 'approved' ? (
                        <button
                          onClick={() => navigate(`/dishes/${dish._id}`)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                        >
                          <FiExternalLink className="h-4 w-4 mr-2" />
                          Voir
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
                          title="Le plat doit être approuvé pour être visible"
                        >
                          <FiExternalLink className="h-4 w-4 mr-2" />
                          Voir (après approbation)
                        </button>
                      )}
                      <button
                        onClick={() => handleEditDish(dish)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
                      >
                        <FiEdit className="h-4 w-4 mr-2" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish._id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                      >
                        <FiTrash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? 'Aucun plat trouvé' : 'Aucun plat disponible'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'Essayez de modifier vos critères de recherche.'
                    : dishes.length === 0 
                      ? 'Le service des plats est temporairement indisponible. Veuillez réessayer plus tard.'
                      : 'Commencez par ajouter des plats à votre menu.'
                  }
                </p>
                {!searchTerm && dishes.length === 0 && (
                  <button
                    onClick={loadDishes}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiRefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

// Composant pour le formulaire de plat
const DishForm = ({ dish, onSubmit, onCancel, loading }) => {
  // Extraire les données du Product pour le formulaire
  const dishName = dish?.name?.fr || dish?.name?.en || dish?.name || '';
  const dishDescription = dish?.description?.fr || dish?.description?.en || dish?.description || '';
  const dishImage = getDishImageUrl(dish) || '';
  const dishCategory = dish?.dishInfo?.category || dish?.category || 'plat';
  const dishPreparationTime = dish?.dishInfo?.preparationTime || dish?.preparationTime || 30;
  const dishAllergens = dish?.dishInfo?.allergens || dish?.allergens || [];
  const dishStock = dish?.inventory?.quantity ?? dish?.stock ?? 10;

  const [formData, setFormData] = useState({
    name: dishName,
    description: dishDescription,
    price: dish?.price || '',
    image: dishImage,
    category: dishCategory,
    preparationTime: dishPreparationTime,
    allergens: dishAllergens,
    stock: dishStock
  });

  const categories = [
    { value: 'entree', label: 'Entrée' },
    { value: 'plat', label: 'Plat principal' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'boisson', label: 'Boisson' },
    { value: 'accompagnement', label: 'Accompagnement' }
  ];

  const allergenOptions = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'lactose', label: 'Lactose' },
    { value: 'nuts', label: 'Noix' },
    { value: 'eggs', label: 'Œufs' },
    { value: 'soy', label: 'Soja' },
    { value: 'fish', label: 'Poisson' },
    { value: 'shellfish', label: 'Crustacés' },
    { value: 'sesame', label: 'Sésame' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAllergenChange = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-6">
        {dish ? 'Modifier le plat' : 'Ajouter un nouveau plat'}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du plat *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix (FCFA) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temps de préparation (min)
            </label>
            <input
              type="number"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock initial
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              placeholder="10"
            />
            <p className="mt-1 text-xs text-gray-500">Quantité disponible (par défaut: 10)</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
            {formData.image && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Aperçu" 
                  className="w-20 h-20 object-cover rounded-md"
                />
              </div>
            )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergènes
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {allergenOptions.map(allergen => (
              <label key={allergen.value} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={formData.allergens.includes(allergen.value)}
                  onChange={() => handleAllergenChange(allergen.value)}
                  className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  {allergen.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-harvests-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvests-green disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : (dish ? 'Modifier' : 'Ajouter')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DishesManagement;
