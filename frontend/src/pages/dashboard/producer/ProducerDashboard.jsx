import React from 'react';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';

const ProducerDashboard = () => {
  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto h-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Producteur 🌾</h1>
          <p className="text-gray-600 mt-1">Gérez vos produits et vos ventes</p>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Producteur en développement</h2>
          <p className="text-gray-600">Fonctionnalités de gestion des produits et statistiques à venir</p>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default ProducerDashboard;
