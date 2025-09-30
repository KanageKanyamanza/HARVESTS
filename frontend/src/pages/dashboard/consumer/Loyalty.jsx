import React, { useState, useEffect } from 'react';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services';
import { 
  FiGift, 
  FiStar, 
  FiTrendingUp, 
  FiClock,
  FiAward,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const Loyalty = () => {
  const { user } = useAuth();
  const [loyaltyStatus, setLoyaltyStatus] = useState(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  // Charger les données de fidélité
  useEffect(() => {
    const loadLoyaltyData = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const [statusResponse, historyResponse] = await Promise.all([
            consumerService.getLoyaltyStatus(),
            consumerService.getLoyaltyHistory()
          ]);
          
          console.log('📡 Réponse API Loyalty Status:', statusResponse);
          console.log('📡 Réponse API Loyalty History:', historyResponse);
          
          setLoyaltyStatus(statusResponse.data.loyaltyStatus || {});
          setLoyaltyHistory(historyResponse.data.history || []);
        } catch (error) {
          console.error('Erreur lors du chargement des données de fidélité:', error);
          setLoyaltyStatus({});
          setLoyaltyHistory([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadLoyaltyData();
  }, [user]);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierName = (tier) => {
    switch (tier) {
      case 'bronze': return 'Bronze';
      case 'silver': return 'Argent';
      case 'gold': return 'Or';
      case 'platinum': return 'Platine';
      default: return 'Membre';
    }
  };

  const getNextTierPoints = (currentTier) => {
    switch (currentTier) {
      case 'bronze': return 1000;
      case 'silver': return 2500;
      case 'gold': return 5000;
      case 'platinum': return null;
      default: return 500;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned': return <FiTrendingUp className="h-4 w-4 text-green-500" />;
      case 'redeemed': return <FiGift className="h-4 w-4 text-blue-500" />;
      case 'expired': return <FiXCircle className="h-4 w-4 text-red-500" />;
      default: return <FiStar className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  const currentTier = loyaltyStatus?.tier || 'bronze';
  const currentPoints = loyaltyStatus?.points || 0;
  const nextTierPoints = getNextTierPoints(currentTier);
  const progressPercentage = nextTierPoints ? (currentPoints / nextTierPoints) * 100 : 100;

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiGift className="h-8 w-8 mr-3 text-purple-500" />
            Programme de fidélité
          </h1>
          <p className="text-gray-600 mt-1">
            Gagnez des points et profitez d'avantages exclusifs
          </p>
        </div>

        {/* Statut de fidélité */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Points actuels */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mes points</h3>
              <FiStar className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-harvests-green mb-2">
              {currentPoints.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Points disponibles</p>
          </div>

          {/* Niveau actuel */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Niveau actuel</h3>
              <FiAward className="h-6 w-6 text-purple-500" />
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTierColor(currentTier)}`}>
              {getTierName(currentTier)}
            </div>
            {nextTierPoints && (
              <p className="text-sm text-gray-600 mt-2">
                {nextTierPoints - currentPoints} points pour le niveau suivant
              </p>
            )}
          </div>

          {/* Progression */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
              <FiTrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-harvests-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {currentPoints} / {nextTierPoints || 'Max'} points
            </p>
          </div>
        </div>

        {/* Avantages du niveau */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Avantages de votre niveau</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTier === 'bronze' && (
              <>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">1 point par 100 FCFA dépensé</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Livraison gratuite à partir de 10 000 FCFA</span>
                </div>
              </>
            )}
            {currentTier === 'silver' && (
              <>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">1.2 points par 100 FCFA dépensé</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Livraison gratuite à partir de 8 000 FCFA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Réductions exclusives</span>
                </div>
              </>
            )}
            {currentTier === 'gold' && (
              <>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">1.5 points par 100 FCFA dépensé</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Livraison gratuite à partir de 5 000 FCFA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Accès prioritaire aux nouveaux produits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Support client prioritaire</span>
                </div>
              </>
            )}
            {currentTier === 'platinum' && (
              <>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">2 points par 100 FCFA dépensé</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Livraison gratuite sur tous les achats</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Accès VIP aux événements</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Conseiller personnel dédié</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowRedeemModal(true)}
            disabled={currentPoints < 100}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiGift className="h-5 w-5" />
            <span>Échanger mes points</span>
          </button>
        </div>

        {/* Historique des transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiClock className="h-5 w-5 mr-2 text-gray-500" />
              Historique des transactions
            </h3>
          </div>
          
          <div className="p-6">
            {loyaltyHistory.length === 0 ? (
              <div className="text-center py-8">
                <FiClock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucune transaction pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loyaltyHistory.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'earned' ? 'text-green-600' : 
                        transaction.type === 'redeemed' ? 'text-blue-600' : 
                        'text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                      </p>
                      <p className="text-sm text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal d'échange (placeholder) */}
        {showRedeemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Échanger mes points</h3>
              <p className="text-gray-600 mb-4">
                Cette fonctionnalité sera bientôt disponible. Vous pourrez échanger vos points contre des récompenses.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRedeemModal(false)}
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

export default Loyalty;
