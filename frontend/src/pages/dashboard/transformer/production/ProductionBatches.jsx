import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../../../../hooks/useAuth';
import { transformerService } from '../../../../services';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import {
  FiPackage,
  FiPlus,
  FiEye,
  FiEdit,
  FiClock,
  FiCheckCircle,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';

const ProductionBatches = () => {
  // const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Charger les lots de production
  useEffect(() => {
    const loadBatches = async () => {
      try {
        setLoading(true);
        const response = await transformerService.getProductionBatches();
        setBatches(response.data?.data?.batches || []);
      } catch (error) {
        console.error('Erreur lors du chargement des lots:', error);
        setError('Erreur lors du chargement des lots de production');
        // Données de démonstration
        setBatches([
          {
            _id: 'demo-batch-1',
            batchNumber: 'B-001',
            productType: 'Confiture de mangue',
            status: 'completed',
            quantity: 500,
            unit: 'pots',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            qualityScore: 4.8,
            efficiency: 95
          },
          {
            _id: 'demo-batch-2',
            batchNumber: 'B-002',
            productType: 'Jus d\'orange',
            status: 'processing',
            quantity: 1000,
            unit: 'bouteilles',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            qualityScore: null,
            efficiency: null
          },
          {
            _id: 'demo-batch-3',
            batchNumber: 'B-003',
            productType: 'Légumes séchés',
            status: 'completed',
            quantity: 200,
            unit: 'kg',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            qualityScore: 4.6,
            efficiency: 92
          },
          {
            _id: 'demo-batch-4',
            batchNumber: 'B-004',
            productType: 'Pâte de tomate',
            status: 'pending',
            quantity: 300,
            unit: 'pots',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            qualityScore: null,
            efficiency: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  // Filtrer les lots
  const filteredBatches = batches.filter(batch => {
    const matchesStatus = !filters.status || batch.status === filters.status;
    const matchesSearch = !filters.search || 
      batch.batchNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      batch.productType.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'processing': return 'En cours';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return FiCheckCircle;
      case 'processing': return FiClock;
      case 'pending': return FiClock;
      case 'cancelled': return FiAlertCircle;
      default: return FiClock;
    }
  };

  // Calculer les statistiques
  const stats = {
    total: batches.length,
    completed: batches.filter(b => b.status === 'completed').length,
    processing: batches.filter(b => b.status === 'processing').length,
    pending: batches.filter(b => b.status === 'pending').length,
    averageQuality: batches.filter(b => b.qualityScore).reduce((acc, b) => acc + b.qualityScore, 0) / batches.filter(b => b.qualityScore).length || 0,
    averageEfficiency: batches.filter(b => b.efficiency).reduce((acc, b) => acc + b.efficiency, 0) / batches.filter(b => b.efficiency).length || 0
  };

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lots de Production</h1>
            <p className="text-gray-600 mt-1">Gérez vos lots de production</p>
          </div>
          <Link
            to="/transformer/production/batches/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Nouveau lot
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiPackage className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiCheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiClock className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiTrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Qualité moy.</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageQuality.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiTrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Efficacité</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageEfficiency.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="processing">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Rechercher par numéro ou produit..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', search: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <FiRefreshCw className="h-4 w-4 mr-2 inline" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des lots */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Lots de Production ({filteredBatches.length})
            </h2>
          </div>
          
          {filteredBatches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Efficacité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBatches.map((batch) => {
                    const StatusIcon = getStatusIcon(batch.status);
                    return (
                      <tr key={batch._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiPackage className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{batch.batchNumber || batch._id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {batch._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {batch.productType || 'Produit transformé'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {batch.quantity || 'N/A'} {batch.unit || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(batch.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.qualityScore ? (
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1">{batch.qualityScore}/5</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.efficiency ? (
                            <span className="text-green-600 font-medium">{batch.efficiency}%</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(batch.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/transformer/production/batches/${batch._id}`}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <FiEye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/transformer/production/batches/${batch._id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun lot de production</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status || filters.search 
                  ? 'Aucun lot ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore de lots de production.'
                }
              </p>
              {!filters.status && !filters.search && (
                <div className="mt-6">
                  <Link
                    to="/transformer/production/batches/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Créer un lot
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default ProductionBatches;
