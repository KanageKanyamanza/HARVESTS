import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Composant pour rediriger automatiquement les utilisateurs vers leur dashboard
 * en fonction de leur type d'utilisateur
 */
const UserTypeRedirect = ({ children }) => {
  const { isAuthenticated, userType, getDefaultRoute, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier s'il y a des modales ouvertes dans le DOM
  const hasOpenModal = () => {
    return document.querySelector('[data-modal-open="true"]') !== null;
  };

  useEffect(() => {
    if (isLoading) return;

    // Ne pas rediriger s'il y a une modale ouverte
    if (hasOpenModal()) {
      return;
    }

    if (isAuthenticated && userType) {
      const currentPath = location.pathname;
      
      // Si l'utilisateur est sur la page de connexion ou d'inscription, rediriger
      if (currentPath === '/login' || currentPath === '/register') {
        const defaultRoute = getDefaultRoute(userType);
        navigate(defaultRoute, { replace: true });
        return;
      }

      // Si l'utilisateur est sur le dashboard général, rediriger vers son dashboard spécifique
      if (currentPath === '/dashboard') {
        const defaultRoute = getDefaultRoute(userType);
        if (defaultRoute !== '/dashboard') {
          navigate(defaultRoute, { replace: true });
        }
      }

    }
  }, [isAuthenticated, userType, isLoading, location.pathname, navigate, getDefaultRoute]);

  return children;
};

export default UserTypeRedirect;
