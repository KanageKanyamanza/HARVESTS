import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardSidebarFixed from '../dashboard/DashboardSidebarFixed';
import DashboardTopbar from '../dashboard/DashboardTopbar';

const ModularDashboardLayout = ({ children, navigationItems, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  // Charger l'état collapsed depuis localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('harvests_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Sauvegarder l'état collapsed dans localStorage
  useEffect(() => {
    localStorage.setItem('harvests_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Fermer le sidebar mobile lors d'un changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      // Utiliser window.location.href pour forcer une navigation complète
      // et éviter les redirections automatiques vers /login
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Rediriger quand même vers l'accueil en cas d'erreur
      window.location.href = '/';
    }
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen bg-harvests-light overflow-hidden">
      {/* Sidebar - FIXED position, 100vh */}
      <div className={`fixed top-0 left-0 h-screen z-30 hidden lg:block transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <DashboardSidebarFixed 
          onLogout={handleLogout} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          navigationItems={navigationItems}
          user={user}
        />
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-screen w-64 z-50 lg:hidden">
            <DashboardSidebarFixed 
              onLogout={handleLogout} 
              collapsed={false}
              onToggleCollapse={handleToggleCollapse}
              navigationItems={navigationItems}
              user={user}
            />
          </div>
        </>
      )}

      {/* Topbar - FIXED position */}
      <div className={`fixed top-0 right-0 h-16 z-20 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-0 lg:left-64'
      }`}>
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
      </div>
      
      {/* Contenu - SEULE zone scrollable */}
      <div 
        className={`fixed top-16 right-0 bottom-0 overflow-y-auto bg-harvests-light transition-all duration-300 ${
          sidebarCollapsed ? 'left-16' : 'left-0 lg:left-64'
        }`}
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {children}
      </div>
    </div>
  );
};

export default ModularDashboardLayout;
