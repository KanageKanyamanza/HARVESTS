import React from 'react';
import { FiTrendingUp, FiDollarSign, FiStar, FiShoppingBag, FiShoppingCart, FiUsers, FiEye, FiGlobe } from 'react-icons/fi';

// Composant pour afficher les statistiques communes
const CommonStats = ({ stats, userType, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const getStatsForUserType = () => {
    const baseStats = [
      {
        name: 'Note moyenne',
        value: stats?.ratings?.average || 0,
        icon: FiStar,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        format: (value) => `${value.toFixed(1)}/5`,
        subtitle: `${stats?.ratings?.count || 0} avis`
      },
      {
        name: 'Vues du profil',
        value: stats?.profileViews || 0,
        icon: FiEye,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        format: (value) => value.toLocaleString()
      }
    ];

    // Statistiques spécifiques selon le type d'utilisateur
    switch (userType) {
      case 'producer':
        return [
          {
            name: 'Produits en vente',
            value: stats?.activeProducts || 0,
            icon: FiShoppingBag,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Commandes ce mois',
            value: stats?.totalOrders || 0,
            icon: FiShoppingCart,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Revenus ce mois',
            value: stats?.totalRevenue || 0,
            icon: FiDollarSign,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            format: (value) => `${value.toLocaleString()} FCFA`
          },
          {
            name: 'Note moyenne',
            value: stats?.averageRating || 0,
            icon: FiStar,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            format: (value) => `${value.toFixed(1)}/5`
          }
        ];

      case 'transformer':
        return [
          ...baseStats,
          {
            name: 'Produits vendus',
            value: stats?.salesStats?.totalSales || 0,
            icon: FiShoppingBag,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Chiffre d\'affaires',
            value: stats?.salesStats?.totalRevenue || 0,
            icon: FiDollarSign,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            format: (value) => `${value.toLocaleString()} FCFA`
          }
        ];

      case 'restaurateur':
        return [
          {
            name: 'Note moyenne',
            value: stats?.ratings?.average || stats?.averageRating || 0,
            icon: FiStar,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            format: (value) => `${value.toFixed(1)}/5`,
            subtitle: `${stats?.ratings?.count || stats?.totalReviews || 0} avis`
          },
          {
            name: 'Vues du profil',
            value: stats?.profileViews || 0,
            icon: FiEye,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Produits vendus',
            value: stats?.totalProductsSold || stats?.totalDishesSold || 0,
            icon: FiShoppingBag,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Chiffre d\'affaires',
            value: stats?.totalRevenue || 0,
            icon: FiDollarSign,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            format: (value) => `${value.toLocaleString()} FCFA`
          }
        ];

      case 'exporter':
        return [
          {
            name: 'Exportations totales',
            value: stats?.totalExports || 0,
            icon: FiShoppingBag,
            color: 'text-teal-500',
            bgColor: 'bg-teal-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Valeur des exports',
            value: stats?.totalValue || stats?.exportValue || 0,
            icon: FiDollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            format: (value) => `${value.toLocaleString()} FCFA`
          },
          {
            name: 'Pays d\'export',
            value: stats?.exportCountries || 0,
            icon: FiGlobe,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Note moyenne',
            value: stats?.averageRating || 0,
            icon: FiStar,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            format: (value) => `${value.toFixed(1)}/5`,
            subtitle: `${stats?.totalReviews || 0} avis`
          }
        ];

      case 'consumer':
        return [
          {
            name: 'Commandes totales',
            value: stats?.totalOrders || 0,
            icon: FiShoppingBag,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Montant dépensé',
            value: stats?.totalSpent || 0,
            icon: FiDollarSign,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            format: (value) => `${value.toLocaleString()} FCFA`
          },
          {
            name: 'Avis laissés',
            value: stats?.reviewsWritten || 0,
            icon: FiStar,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            format: (value) => value.toLocaleString(),
            subtitle: `Note moyenne: ${stats?.averageRatingGiven?.toFixed(1) || '0.0'}/5`
          },
          {
            name: 'Vues du profil',
            value: stats?.profileViews || 0,
            icon: FiEye,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            format: (value) => value.toLocaleString()
          }
        ];

      case 'transporter':
        return [
          ...baseStats,
          {
            name: 'Livraisons effectuées',
            value: stats?.performanceStats?.totalDeliveries || 0,
            icon: FiShoppingBag,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            format: (value) => value.toLocaleString()
          },
          {
            name: 'Taux de ponctualité',
            value: stats?.performanceStats?.onTimeDeliveryRate || 0,
            icon: FiTrendingUp,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            format: (value) => `${value}%`
          }
        ];

      default:
        return baseStats;
    }
  };

  const statsToShow = getStatsForUserType();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsToShow.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.format ? stat.format(stat.value) : stat.value.toLocaleString()}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommonStats;
