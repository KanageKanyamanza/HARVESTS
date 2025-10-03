import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../../../../hooks/useAuth';
import { transformerService } from '../../../../services';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import {
  FiFileText,
  FiPlus,
  FiEye,
  FiEdit,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiDollarSign,
  FiCalendar
} from 'react-icons/fi';

const QuotesList = () => {
  // const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Charger les devis
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true);
        const response = await transformerService.getCustomQuotes();
        setQuotes(response.data?.data?.quotes || []);
      } catch (error) {
        console.error('Erreur lors du chargement des devis:', error);
        setError('Erreur lors du chargement des devis');
        // Données de démonstration
        setQuotes([
          {
            _id: 'demo-quote-1',
            quoteNumber: 'Q-001',
            clientName: 'Restaurant Le Gourmet',
            clientEmail: 'contact@legourmet.com',
            transformationType: 'Conservation',
            status: 'pending',
            totalAmount: 150000,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Transformation de 100kg de mangues en confiture'
          },
          {
            _id: 'demo-quote-2',
            quoteNumber: 'Q-002',
            clientName: 'Café Central',
            clientEmail: 'info@cafecentral.com',
            transformationType: 'Emballage',
            status: 'accepted',
            totalAmount: 75000,
            validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Emballage de 500 bouteilles de jus d\'orange'
          },
          {
            _id: 'demo-quote-3',
            quoteNumber: 'Q-003',
            clientName: 'Boulangerie Artisanale',
            clientEmail: 'contact@boulangerie.com',
            transformationType: 'Transformation',
            status: 'rejected',
            totalAmount: 200000,
            validUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Transformation de 200kg de légumes en conserves'
          },
          {
            _id: 'demo-quote-4',
            quoteNumber: 'Q-004',
            clientName: 'Épicerie Bio',
            clientEmail: 'commande@epiceriebio.com',
            transformationType: 'Conservation',
            status: 'expired',
            totalAmount: 120000,
            validUntil: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Conservation de 80kg de fruits secs'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  // Filtrer les devis
  const filteredQuotes = quotes.filter(quote => {
    const matchesStatus = !filters.status || quote.status === filters.status;
    const matchesSearch = !filters.search || 
      quote.quoteNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      quote.clientName.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return FiCheckCircle;
      case 'pending': return FiClock;
      case 'rejected': return FiXCircle;
      case 'expired': return FiXCircle;
      default: return FiClock;
    }
  };

  // Vérifier si le devis est expiré
  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  // Calculer les statistiques
  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
    expired: quotes.filter(q => isExpired(q.validUntil)).length,
    totalValue: quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0)
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
            <h1 className="text-2xl font-bold text-gray-900">Devis Personnalisés</h1>
            <p className="text-gray-600 mt-1">Gérez vos devis personnalisés</p>
          </div>
          <Link
            to="/transformer/quotes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiFileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiClock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiCheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Acceptés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiXCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiDollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Valeur totale</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalValue.toLocaleString()} FCFA</p>
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
                <option value="accepted">Accepté</option>
                <option value="rejected">Rejeté</option>
                <option value="expired">Expiré</option>
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
                  placeholder="Rechercher par numéro ou client..."
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

        {/* Liste des devis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Devis ({filteredQuotes.length})
            </h2>
          </div>
          
          {filteredQuotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => {
                    const StatusIcon = getStatusIcon(quote.status);
                    const expired = isExpired(quote.validUntil);
                    return (
                      <tr key={quote._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{quote.quoteNumber || quote._id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {quote.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {quote.clientName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {quote.clientEmail || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quote.transformationType || 'Transformation'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(quote.status)}
                          </span>
                          {expired && quote.status === 'pending' && (
                            <div className="text-xs text-red-600 mt-1">Expiré</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quote.totalAmount ? `${quote.totalAmount.toLocaleString()} FCFA` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="h-4 w-4 mr-1" />
                            {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/transformer/quotes/${quote._id}`}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <FiEye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/transformer/quotes/${quote._id}/edit`}
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
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun devis</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status || filters.search 
                  ? 'Aucun devis ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore créé de devis personnalisés.'
                }
              </p>
              {!filters.status && !filters.search && (
                <div className="mt-6">
                  <Link
                    to="/transformer/quotes/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Créer un devis
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

export default QuotesList;
