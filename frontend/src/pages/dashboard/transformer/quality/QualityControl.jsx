import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../../../../hooks/useAuth';
import { transformerService } from '../../../../services';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import {
  FiShield,
  FiPlus,
  FiEye,
  FiEdit,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiAward
} from 'react-icons/fi';

const QualityControl = () => {
  // const { user } = useAuth();
  const [qualityReports, setQualityReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Charger les rapports de qualité
  useEffect(() => {
    const loadQualityReports = async () => {
      try {
        setLoading(true);
        const response = await transformerService.getQualityReports();
        setQualityReports(response.data?.data?.reports || []);
      } catch (error) {
        console.error('Erreur lors du chargement des rapports:', error);
        setError('Erreur lors du chargement des rapports de qualité');
        // Données de démonstration
        setQualityReports([
          {
            _id: 'demo-quality-1',
            reportNumber: 'QC-001',
            batchNumber: 'B-001',
            productType: 'Confiture de mangue',
            testDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'passed',
            qualityScore: 4.8,
            tests: [
              { name: 'pH', value: 3.2, standard: '3.0-3.5', result: 'passed' },
              { name: 'Brix', value: 65, standard: '60-70', result: 'passed' },
              { name: 'Viscosité', value: 'Bonne', standard: 'Bonne', result: 'passed' }
            ],
            inspector: 'Dr. Aminata Diallo',
            notes: 'Produit conforme aux standards'
          },
          {
            _id: 'demo-quality-2',
            reportNumber: 'QC-002',
            batchNumber: 'B-002',
            productType: 'Jus d\'orange',
            testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            qualityScore: null,
            tests: [
              { name: 'pH', value: 3.8, standard: '3.5-4.0', result: 'pending' },
              { name: 'Brix', value: 12, standard: '10-15', result: 'pending' },
              { name: 'Acidité', value: 'En cours', standard: '0.5-1.0%', result: 'pending' }
            ],
            inspector: 'Dr. Mamadou Fall',
            notes: 'Tests en cours'
          },
          {
            _id: 'demo-quality-3',
            reportNumber: 'QC-003',
            batchNumber: 'B-003',
            productType: 'Légumes séchés',
            testDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'failed',
            qualityScore: 2.1,
            tests: [
              { name: 'Humidité', value: 15, standard: '8-12%', result: 'failed' },
              { name: 'Couleur', value: 'Décolorée', standard: 'Naturelle', result: 'failed' },
              { name: 'Texture', value: 'Molle', standard: 'Ferme', result: 'failed' }
            ],
            inspector: 'Dr. Fatou Sarr',
            notes: 'Produit non conforme - humidité trop élevée'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadQualityReports();
  }, []);

  // Filtrer les rapports
  const filteredReports = qualityReports.filter(report => {
    const matchesStatus = !filters.status || report.status === filters.status;
    const matchesSearch = !filters.search || 
      report.reportNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.batchNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.productType.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'passed': return 'Conforme';
      case 'failed': return 'Non conforme';
      case 'pending': return 'En cours';
      default: return status;
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return FiCheckCircle;
      case 'failed': return FiAlertCircle;
      case 'pending': return FiClock;
      default: return FiAlertCircle;
    }
  };

  // Calculer les statistiques
  const stats = {
    total: qualityReports.length,
    passed: qualityReports.filter(r => r.status === 'passed').length,
    failed: qualityReports.filter(r => r.status === 'failed').length,
    pending: qualityReports.filter(r => r.status === 'pending').length,
    averageScore: qualityReports.filter(r => r.qualityScore).reduce((acc, r) => acc + r.qualityScore, 0) / qualityReports.filter(r => r.qualityScore).length || 0
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
            <h1 className="text-2xl font-bold text-gray-900">Contrôle Qualité</h1>
            <p className="text-gray-600 mt-1">Gérez vos rapports de contrôle qualité</p>
          </div>
          <Link
            to="/transformer/quality/reports/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Nouveau rapport
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiShield className="h-8 w-8 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Conformes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.passed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiAlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Non conformes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiClock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiAward className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Score moyen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
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
                <option value="passed">Conforme</option>
                <option value="failed">Non conforme</option>
                <option value="pending">En cours</option>
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
                  placeholder="Rechercher par numéro ou lot..."
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

        {/* Liste des rapports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Rapports de Qualité ({filteredReports.length})
            </h2>
          </div>
          
          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rapport
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inspecteur
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
                  {filteredReports.map((report) => {
                    const StatusIcon = getStatusIcon(report.status);
                    return (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiShield className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{report.reportNumber || report._id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {report._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {report.batchNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {report.productType || 'Produit'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(report.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.qualityScore ? (
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1">{report.qualityScore}/5</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.inspector || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.testDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/transformer/quality/reports/${report._id}`}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <FiEye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/transformer/quality/reports/${report._id}/edit`}
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
              <FiShield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rapport de qualité</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status || filters.search 
                  ? 'Aucun rapport ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore de rapports de qualité.'
                }
              </p>
              {!filters.status && !filters.search && (
                <div className="mt-6">
                  <Link
                    to="/transformer/quality/reports/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Créer un rapport
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

export default QualityControl;
