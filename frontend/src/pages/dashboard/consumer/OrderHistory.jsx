import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiSearch,
  FiDownload,
  FiEye,
  FiRefreshCw,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiStar
} from 'react-icons/fi';

const OrderHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Données simulées
  const orders = [
    {
      id: 'ORD-001',
      orderNumber: 'HRV-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 25000,
      items: [
        { name: 'Tomates bio', quantity: 2, price: 3000 },
        { name: 'Carottes', quantity: 1, price: 2000 }
      ],
      seller: { name: 'Ferme Bio Kamdem', rating: 4.8 },
      deliveryAddress: 'Yaoundé, Cameroun'
    },
    {
      id: 'ORD-002',
      orderNumber: 'HRV-2024-002',
      date: '2024-01-12',
      status: 'in-transit',
      total: 18500,
      items: [
        { name: 'Bananes plantain', quantity: 5, price: 1500 }
      ],
      seller: { name: 'Agro-Fresh SARL', rating: 4.5 },
      deliveryAddress: 'Douala, Cameroun'
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      'delivered': { color: 'bg-green-100 text-green-800', text: 'Livrée', icon: FiCheckCircle },
      'in-transit': { color: 'bg-blue-100 text-blue-800', text: 'En transit', icon: FiTruck },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: FiClock },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Annulée', icon: FiXCircle }
    };
    return configs[status] || configs['pending'];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
              <p className="text-gray-600 mt-1">Suivez et gérez toutes vos commandes</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiDownload className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in-transit">En transit</option>
                  <option value="delivered">Livrées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore passé de commandes
              </p>
              <div className="mt-6">
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                >
                  Commencer mes achats
                </Link>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.date} • {order.seller.name}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{order.seller.rating}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.text}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {order.total.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Articles</h4>
                          <ul className="space-y-1">
                            {order.items.map((item, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Livraison</h4>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <FiEye className="h-4 w-4 mr-2" />
                          Voir détails
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <FiRefreshCw className="h-4 w-4 mr-2" />
                          Recommander
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default OrderHistory;
