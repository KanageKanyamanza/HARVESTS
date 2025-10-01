import React from 'react';
import { Link } from 'react-router-dom';
import { Award, TrendingUp, Gift, ArrowRight } from 'lucide-react';

const LoyaltyCard = ({ loyaltyData, compact = false }) => {
  const { points = 0, tier = 'bronze', totalPointsEarned = 0 } = loyaltyData || {};

  const getTierInfo = (tier) => {
    const tiers = {
      bronze: {
        name: 'Bronze',
        color: '#CD7F32',
        bgColor: '#FFF4E6',
        nextTier: 'Silver',
        pointsNeeded: 1000,
        icon: '🥉'
      },
      silver: {
        name: 'Silver',
        color: '#C0C0C0',
        bgColor: '#F5F5F5',
        nextTier: 'Gold',
        pointsNeeded: 5000,
        icon: '🥈'
      },
      gold: {
        name: 'Gold',
        color: '#FFD700',
        bgColor: '#FFFBEB',
        nextTier: 'Platinum',
        pointsNeeded: 10000,
        icon: '🥇'
      },
      platinum: {
        name: 'Platinum',
        color: '#E5E4E2',
        bgColor: '#F9FAFB',
        nextTier: null,
        pointsNeeded: null,
        icon: '💎'
      }
    };
    return tiers[tier] || tiers.bronze;
  };

  const tierInfo = getTierInfo(tier);
  const progressToNext = tierInfo.pointsNeeded 
    ? Math.min((points / tierInfo.pointsNeeded) * 100, 100)
    : 100;
  const pointsToNext = tierInfo.pointsNeeded ? tierInfo.pointsNeeded - points : 0;

  if (compact) {
    return (
      <div 
        className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-4 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <span className="font-semibold">Fidélité</span>
          </div>
          <span className="text-2xl">{tierInfo.icon}</span>
        </div>
        <div className="text-3xl font-bold mb-1">{points.toLocaleString()}</div>
        <div className="text-sm opacity-90">Points disponibles</div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-xl"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-6 w-6" />
            <span className="font-semibold text-lg">Programme de Fidélité</span>
          </div>
          <p className="text-sm opacity-90">Statut: {tierInfo.name}</p>
        </div>
        <div className="text-5xl">{tierInfo.icon}</div>
      </div>

      {/* Points disponibles */}
      <div className="mb-6">
        <div className="text-4xl font-bold mb-1">{points.toLocaleString()}</div>
        <div className="text-sm opacity-90">Points disponibles</div>
        <div className="text-xs opacity-75 mt-1">
          = {points.toLocaleString()} XAF de réduction
        </div>
      </div>

      {/* Progression vers le prochain niveau */}
      {tierInfo.nextTier && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="opacity-90">Progression vers {tierInfo.nextTier}</span>
            <span className="font-semibold">{Math.round(progressToNext)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
          <div className="text-xs opacity-75 mt-1">
            {pointsToNext > 0 && `Plus que ${pointsToNext.toLocaleString()} points pour atteindre ${tierInfo.nextTier}`}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/consumer/loyalty"
          className="flex-1 bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold text-sm text-center hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Gift className="h-4 w-4" />
          Voir les récompenses
        </Link>
        <Link
          to="/consumer/loyalty"
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2 text-xs opacity-75">
          <TrendingUp className="h-3 w-3" />
          <span>Total gagné: {totalPointsEarned.toLocaleString()} points</span>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCard;

