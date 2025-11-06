import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Composant pour rediriger automatiquement les utilisateurs vers leur dashboard
 * en fonction de leur type d'utilisateur
 */
const UserTypeRedirect = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Vérifier si useAuth est disponible
  let isAuthenticated = false;
  let userType = null;
  let getDefaultRoute = () => '/';
  let isLoading = false;
  
  try {
    const auth = useAuth();
    isAuthenticated = auth?.isAuthenticated || false;
    userType = auth?.userType || null;
    getDefaultRoute = auth?.getDefaultRoute || (() => '/');
    isLoading = auth?.isLoading || false;
  } catch (error) {
    console.warn('useAuth non disponible dans UserTypeRedirect:', error);
  }

  // Vérifier s'il y a des modales ouvertes dans le DOM
  const hasOpenModal = () => {
    return document.querySelector('[data-modal-open="true"]') !== null;
  };

  useEffect(() => {
    // Attendre que le chargement soit terminé avant toute redirection
    if (isLoading) return;

    // Ne pas rediriger s'il y a une modale ouverte
    if (hasOpenModal()) {
      return;
    }

    if (isAuthenticated && userType) {
      const currentPath = location.pathname;
      
      // Si l'utilisateur est sur la page de connexion ou d'inscription, rediriger
      if (currentPath === '/login' || currentPath === '/register') {
        const defaultRoute = getDefaultRoute();
        navigate(defaultRoute, { replace: true });
        return;
      }

      // Si l'utilisateur est sur le dashboard général, rediriger vers son dashboard spécifique
      // MAIS seulement s'il n'est pas déjà sur une route valide du dashboard
      if (currentPath === '/dashboard') {
        const defaultRoute = getDefaultRoute();
        if (defaultRoute !== '/dashboard') {
          navigate(defaultRoute, { replace: true });
        }
      }

      // Ne JAMAIS rediriger si l'utilisateur est déjà sur une route valide
      // Cela préserve la position de l'utilisateur après un refresh
      // (laisser ProtectedRoute gérer les vérifications d'accès)
    }
  }, [isAuthenticated, userType, isLoading, location.pathname, navigate, getDefaultRoute]);

  return children;
};

export default UserTypeRedirect;
