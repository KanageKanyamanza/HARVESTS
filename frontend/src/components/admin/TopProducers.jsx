import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, ShoppingCart, MapPin } from 'lucide-react';

const TopProducers = ({ producers = [] }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-500">
          {index + 1}
        </span>;
    }
  };

  if (producers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Aucune donnée de vente disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Top Producteurs</h3>
          <Link 
            to="/admin/producers" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir tous
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {producers.map((producer, index) => (
          <div key={producer.producerId} className="px-6 py-4 hover:bg-harvests-light">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getRankIcon(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {producer.producerName}
                    </h4>
                    {producer.farmName && (
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {producer.farmName}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(producer.totalSales)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {producer.orderCount} commande(s)
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ShoppingCart className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {producer.orderCount} commandes
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {formatCurrency(producer.totalSales)} CA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducers;
