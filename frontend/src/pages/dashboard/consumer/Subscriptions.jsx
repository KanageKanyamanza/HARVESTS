import React, { useState, useEffect } from 'react';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services';
import { 
  FiRefreshCw, 
  FiPause, 
  FiPlay, 
  FiTrash2, 
  FiPlus,
  FiCalendar,
  FiPackage,
  FiClock,
  FiDollarSign,
  FiEdit3,
  FiAlertCircle
} from 'react-icons/fi';

const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger les abonnements
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const response = await consumerService.getSubscriptions();
          console.log('📡 Réponse API Subscriptions:', response);
          setSubscriptions(response.data.subscriptions || []);
        } catch (error) {
          console.error('Erreur lors du chargement des abonnements:', error);
          setSubscriptions([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSubscriptions();
  }, [user]);

  const pauseSubscription = async (subscriptionId) => {
    try {
      console.log('⏸️ Pause subscription:', subscriptionId);
      await consumerService.pauseSubscription(subscriptionId);
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: 'paused' } : sub
      ));
    } catch (error) {
      console.error('Erreur lors de la pause:', error);
    }
  };

  const resumeSubscription = async (subscriptionId) => {
    try {
      console.log('▶️ Resume subscription:', subscriptionId);
      await consumerService.resumeSubscription(subscriptionId);
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: 'active' } : sub
      ));
    } catch (error) {
      console.error('Erreur lors de la reprise:', error);
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) {
      try {
        console.log('❌ Cancel subscription:', subscriptionId);
        await consumerService.cancelSubscription(subscriptionId);
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'paused': return 'En pause';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiRefreshCw className="h-8 w-8 mr-3 text-harvests-green" />
            Mes abonnements
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos livraisons récurrentes
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-600">
            {subscriptions.length} abonnement{subscriptions.length > 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90"
          >
            <FiPlus className="h-4 w-4" />
            <span>Nouvel abonnement</span>
          </button>
        </div>

        {/* Liste des abonnements */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiRefreshCw className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonnement</h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore d'abonnements. Créez-en un pour recevoir vos produits préférés régulièrement.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90"
            >
              Créer un abonnement
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscription.product?.name || 'Produit'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Producteur: {subscription.producer?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                        {getStatusText(subscription.status)}
                      </span>
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => pauseSubscription(subscription.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                          title="Mettre en pause"
                        >
                          <FiPause className="h-4 w-4" />
                        </button>
                      )}
                      {subscription.status === 'paused' && (
                        <button
                          onClick={() => resumeSubscription(subscription.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Reprendre"
                        >
                          <FiPlay className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiDollarSign className="h-4 w-4 mr-2 text-harvests-green" />
                      <span>{formatPrice(subscription.price, subscription.currency)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiPackage className="h-4 w-4 mr-2 text-harvests-green" />
                      <span>Quantité: {subscription.quantity}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiRefreshCw className="h-4 w-4 mr-2 text-harvests-green" />
                      <span>Fréquence: {subscription.frequency}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="h-4 w-4 mr-2 text-harvests-green" />
                      <span>Prochaine livraison: {formatDate(subscription.nextDelivery)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="h-4 w-4 mr-2 text-harvests-green" />
                      <span>Créé le: {formatDate(subscription.createdAt)}</span>
                    </div>
                  </div>

                  {subscription.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {subscription.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      <FiEdit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => cancelSubscription(subscription.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de création (placeholder) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer un abonnement</h3>
              <p className="text-gray-600 mb-4">
                Cette fonctionnalité sera bientôt disponible. Vous pourrez créer des abonnements pour vos produits favoris.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default Subscriptions;
