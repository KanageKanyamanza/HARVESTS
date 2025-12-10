import React from 'react';
import { TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { formatPrice } from '../../../utils/subscriptionHelpers';

const SubscriptionStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      icon: TrendingUp,
      iconColor: 'bg-blue-100',
      iconTextColor: 'text-blue-600',
      label: 'Total',
      value: stats.total || 0
    },
    {
      icon: CheckCircle,
      iconColor: 'bg-green-100',
      iconTextColor: 'text-green-600',
      label: 'Actives',
      value: stats.active || 0
    },
    {
      icon: Clock,
      iconColor: 'bg-yellow-100',
      iconTextColor: 'text-yellow-600',
      label: 'En attente',
      value: stats.pending || 0
    },
    {
      icon: DollarSign,
      iconColor: 'bg-purple-100',
      iconTextColor: 'text-purple-600',
      label: 'Revenus totaux',
      value: `${formatPrice(stats.revenue?.total || 0)} FCFA`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 ${stat.iconColor} rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.iconTextColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubscriptionStats;

