import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserType } from '../../hooks/useUserType';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Composant de protection de route avec gestion des permissions
 */
const ProtectedRoute = ({ 
  children, 
  requiredPermission = null,
  requiredUserType = null,
  requireEmailVerification = false,
  requireAccountApproval = false,
  fallbackRoute = '/login'
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    isEmailVerified, 
    isAccountApproved,
    hasPermission,
    canAccessRoute
  } = useAuth();
  
  const { userType } = useUserType();
  const location = useLocation();

  // Afficher le spinner pendant le chargement
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return <Navigate 
      to={fallbackRoute} 
      state={{ from: location.pathname }} 
      replace 
    />;
  }

  // Vérifier la vérification email si requise
  if (requireEmailVerification && !isEmailVerified) {
    return <Navigate 
      to="/verify-email" 
      state={{ from: location.pathname }} 
      replace 
    />;
  }

  // Vérifier l'approbation du compte si requise
  if (requireAccountApproval && !isAccountApproved) {
    return <Navigate 
      to="/account-pending" 
      state={{ from: location.pathname }} 
      replace 
    />;
  }

  // Vérifier le type d'utilisateur si spécifié
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate 
      to="/unauthorized" 
      state={{ 
        from: location.pathname,
        message: `Cette page est réservée aux ${requiredUserType}s` 
      }} 
      replace 
    />;
  }

  // Vérifier la permission si spécifiée
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate 
      to="/unauthorized" 
      state={{ 
        from: location.pathname,
        message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page' 
      }} 
      replace 
    />;
  }

  // Vérifier l'accès à la route
  if (!canAccessRoute(location.pathname)) {
    return <Navigate 
      to="/unauthorized" 
      state={{ 
        from: location.pathname,
        message: 'Accès non autorisé à cette page' 
      }} 
      replace 
    />;
  }

  return children;
};

export default ProtectedRoute;
