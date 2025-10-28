import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Package,
  Calendar,
  User,
  DollarSign,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import CloudinaryImage from '../../components/common/CloudinaryImage';

const AdminDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDishes, setSelectedDishes] = useState([]);

  useEffect(() => {
    loadDishes();
  }, [currentPage, statusFilter, searchTerm]);

  // Fonction loadDishes
  const loadDishes = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      };
      const response = await adminService.getDishes(params);
      // Vérifier si la réponse contient des plats
      if (response.data && response.data.dishes) {
        setDishes(response.data.dishes || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response.data && response.data.data && response.data.data.dishes) {
        // Structure alternative avec data.dishes
        setDishes(response.data.data.dishes || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        setDishes([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plats:', error);
      setDishes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectDish = (dishId) => {
    setSelectedDishes(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDishes(
      selectedDishes.length === dishes.length 
        ? [] 
        : dishes.map(dish => dish._id)
    );
  };

  const handleApproveDish = async (dishId) => {
    if (window.confirm('Êtes-vous sûr de vouloir approuver ce plat ?')) {
      try {
        await adminService.approveDish(dishId);
        loadDishes();
      } catch (error) {
        console.error('Erreur lors de l\'approbation:', error);
      }
    }
  };

  const handleRejectDish = async (dishId) => {
    const reason = window.prompt('Raison du rejet:');
    if (reason) {
      try {
        await adminService.rejectDish(dishId, reason);
        loadDishes();
      } catch (error) {
        console.error('Erreur lors du rejet:', error);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': 'text-green-600 bg-green-100',
      'pending-review': 'text-yellow-600 bg-yellow-100',
      'draft': 'text-gray-600 bg-gray-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'approved': 'Approuvé',
      'pending-review': 'En attente de révision',
      'draft': 'Brouillon',
      'rejected': 'Rejeté'
    };
    return statusMap[status] || status;
  };

  const getCategoryText = (category) => {
    const categoryMap = {
      'entree': 'Entrée',
      'plat': 'Plat principal',
      'dessert': 'Dessert',
      'boisson': 'Boisson',
      'accompagnement': 'Accompagnement'
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plats</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez tous les plats des restaurateurs
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
              Exporter
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des plats..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous les statuts</option>
              <option value="approved">Approuvé</option>
              <option value="pending-review">En attente de révision</option>
              <option value="draft">Brouillon</option>
              <option value="rejected">Rejeté</option>
            </select>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200">
              <Filter className="h-4 w-4 inline mr-2" />
              Plus de filtres
            </button>
          </div>
        </div>

        {/* Dishes Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Liste des plats ({dishes.length})
              </h3>
              {selectedDishes.length > 0 && (
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                    Approuver sélectionnés
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                    Rejeter sélectionnés
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-harvests-light">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedDishes.length === dishes.length && dishes.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dishes.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">Aucun plat trouvé</p>
                          <p className="text-sm">Aucun plat ne correspond à vos critères de recherche</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dishes.map((dish) => (
                      <tr key={dish._id} className="hover:bg-harvests-light">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedDishes.includes(dish._id)}
                            onChange={() => handleSelectDish(dish._id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {dish.image ? (
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {dish.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {dish.description?.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {dish.restaurateur?.restaurantName || `${dish.restaurateur?.firstName} ${dish.restaurateur?.lastName}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dish.restaurateur?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(dish.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getCategoryText(dish.category)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dish.status)}`}>
                            {getStatusText(dish.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(dish.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/dishes/${dish._id}`}
                              className="text-green-600 hover:text-green-900"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {dish.status === 'pending-review' && (
                              <>
                                <button
                                  onClick={() => handleApproveDish(dish._id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approuver le plat"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectDish(dish._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Rejeter le plat"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, dishes.length)} sur {dishes.length} résultats
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDishes;
