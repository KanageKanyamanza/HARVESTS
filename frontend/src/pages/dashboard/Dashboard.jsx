import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserType } from '../../hooks/useUserType';
import ModularDashboardLayout from '../../components/layout/ModularDashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const { userType, getDefaultRoute } = useUserType();

  // Rediriger vers le dashboard spécifique selon le type d'utilisateur
  React.useEffect(() => {
    if (userType) {
      const specificDashboard = getDefaultRoute(userType);
      if (specificDashboard !== '/dashboard') {
        window.location.href = specificDashboard;
      }
    }
  }, [userType, getDefaultRoute]);

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto h-full">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue {user?.firstName} !
          </h1>
          <p className="text-gray-600 mb-8">
            Redirection vers votre dashboard spécifique...
          </p>
          <div className="animate-spin mx-auto h-8 w-8 border-4 border-harvests-green border-t-transparent rounded-full"></div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Dashboard;
