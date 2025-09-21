import React from 'react';
import ModularDashboardLayout from '../../components/layout/ModularDashboardLayout';

const Messages = () => {
  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communiquez avec les vendeurs et acheteurs</p>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Messagerie en développement</h2>
          <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible</p>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Messages;
