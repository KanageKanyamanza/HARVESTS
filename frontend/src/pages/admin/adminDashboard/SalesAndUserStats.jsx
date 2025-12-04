import React from 'react';
import SalesChart from '../../../components/admin/SalesChart';

const SalesAndUserStats = ({ salesChartData, marketplaceStats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Évolution des ventes</h3>
          <p className="text-sm text-gray-500">Ventes des 12 derniers mois</p>
        </div>
        <div className="p-6">
          <SalesChart data={salesChartData} type="line" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Statistiques par type d'utilisateur</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {marketplaceStats.map((stat, index) => (
              <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                <div className="flex items-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    {stat.description && (
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAndUserStats;

