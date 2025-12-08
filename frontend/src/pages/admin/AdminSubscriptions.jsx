import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Banknote
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        planId: planFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined
      };
      const response = await adminService.getSubscriptions(params);
      
      // Le service adminService.getSubscriptions retourne response.data (body HTTP)
      // Le backend retourne: { status: 'success', data: { subscriptions }, total, pages, ... }
      // Donc response = { status: 'success', data: { subscriptions }, total, pages, ... }
      const subscriptionsData = response?.data?.subscriptions || [];
      const total = response?.total || 0;
      const pages = response?.pages || 1;
      
      if (Array.isArray(subscriptionsData)) {
        setSubscriptions(subscriptionsData);
        setTotalPages(pages);
        setTotalItems(total);
      } else {
        setSubscriptions([]);
        setTotalPages(1);
        setTotalItems(total);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des souscriptions:', error);
      setSubscriptions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, planFilter, paymentStatusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await adminService.getSubscriptionStats();
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
    loadStats();
  }, [loadSubscriptions, loadStats]);

  const handleStatusUpdate = async (subscriptionId, newStatus, newPaymentStatus) => {
    try {
      await adminService.updateSubscriptionStatus(subscriptionId, {
        status: newStatus,
        paymentStatus: newPaymentStatus
      });
      await loadSubscriptions();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Actif' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Annulé' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Expiré' },
      suspended: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Suspendu' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Payé' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Échoué' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Remboursé' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getPlanBadge = (planId) => {
    const plans = {
      gratuit: { color: 'bg-gray-100 text-gray-800', label: 'Gratuit' },
      standard: { color: 'bg-blue-100 text-blue-800', label: 'Standard' },
      premium: { color: 'bg-purple-100 text-purple-800', label: 'Premium' }
    };
    const plan = plans[planId] || plans.gratuit;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${plan.color}`}>
        {plan.label}
      </span>
    );
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const userName = `${sub.user?.firstName || ''} ${sub.user?.lastName || ''}`.toLowerCase();
      const userEmail = sub.user?.email?.toLowerCase() || '';
      return userName.includes(searchLower) || userEmail.includes(searchLower);
    }
    return true;
  });

  if (loading && !subscriptions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des souscriptions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des souscriptions</h1>
          <p className="mt-2 text-gray-600">
            Gérez les abonnements et plans des utilisateurs
          </p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Actives</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(stats.revenue?.total || 0)} FCFA
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
              <option value="expired">Expiré</option>
              <option value="suspended">Suspendu</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tous les plans</option>
              <option value="gratuit">Gratuit</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tous les paiements</option>
              <option value="completed">Payé</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
            </select>
          </div>
        </div>

        {/* Tableau des souscriptions */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      Aucune souscription trouvée
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <tr key={subscription._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {subscription.user?.firstName} {subscription.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{subscription.user?.email}</div>
                            <div className="text-xs text-gray-400">{subscription.user?.userType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(subscription.planId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subscription.billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(subscription.amount)} {subscription.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(subscription.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(subscription.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Début: {formatDate(subscription.startDate)}</div>
                        <div>Fin: {formatDate(subscription.endDate)}</div>
                        {subscription.nextBillingDate && (
                          <div className="text-xs text-blue-600">
                            Prochain: {formatDate(subscription.nextBillingDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowDetailsModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(currentPage * 20, totalItems)}</span> sur{' '}
                    <span className="font-medium">{totalItems}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de détails */}
        {showDetailsModal && selectedSubscription && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails de la souscription
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Utilisateur</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedSubscription.user?.firstName} {selectedSubscription.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{selectedSubscription.user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Plan</label>
                      <div className="mt-1">{getPlanBadge(selectedSubscription.planId)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Période</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedSubscription.billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Montant</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatPrice(selectedSubscription.amount)} {selectedSubscription.currency}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Statut</label>
                      <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Paiement</label>
                      <div className="mt-1">{getPaymentStatusBadge(selectedSubscription.paymentStatus)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date de début</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedSubscription.startDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date de fin</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedSubscription.endDate)}
                      </p>
                    </div>
                    {selectedSubscription.nextBillingDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Prochaine facturation</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(selectedSubscription.nextBillingDate)}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Méthode de paiement</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedSubscription.paymentMethod === 'cash' ? (
                          <>
                            <Banknote className="inline h-4 w-4 mr-1" />
                            Paiement à la livraison
                          </>
                        ) : (
                          <>
                            <CreditCard className="inline h-4 w-4 mr-1" />
                            PayPal
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Renouvellement automatique</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedSubscription.autoRenew ? 'Oui' : 'Non'}
                      </p>
                    </div>
                  </div>

                  {selectedSubscription.cancelledAt && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <label className="text-sm font-medium text-red-800">Annulé le</label>
                      <p className="mt-1 text-sm text-red-700">
                        {formatDate(selectedSubscription.cancelledAt)}
                      </p>
                      {selectedSubscription.cancellationReason && (
                        <p className="mt-2 text-sm text-red-600">
                          Raison: {selectedSubscription.cancellationReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions admin */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Actions administrateur</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubscription.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedSubscription._id, 'active', 'completed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Activer la souscription
                        </button>
                      )}
                      {selectedSubscription.status === 'active' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedSubscription._id, 'suspended', selectedSubscription.paymentStatus)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                        >
                          Suspendre
                        </button>
                      )}
                      {selectedSubscription.status === 'suspended' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedSubscription._id, 'active', selectedSubscription.paymentStatus)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Réactiver
                        </button>
                      )}
                      {selectedSubscription.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedSubscription._id, selectedSubscription.status, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Marquer comme payé
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;

