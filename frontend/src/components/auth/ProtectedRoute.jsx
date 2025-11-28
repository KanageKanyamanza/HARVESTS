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
  requireRole = null,
  requireEmailVerification = false,
  requireAccountApproval = false,
  fallbackRoute = '/login'
}) => {
  const { 
    isAuthenticated, 
    isEmailVerified, 
    isAccountApproved,
    hasPermission,
    canAccessRoute,
    user,
    isLoading
  } = useAuth();
  
  const { userType } = useUserType();
  const location = useLocation();

  // Attendre que la session soit restaurée avant de rediriger
  // Cela évite les redirections intempestives lors du refresh de la page
  if (isLoading) {
    // Afficher un loader pendant la restauration de session
    return (
      <div className="min-h-screen flex items-center justify-center bg-harvests-light">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  // Rediriger si non authentifié (seulement après que le chargement soit terminé)
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
      to="/email-verification" 
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

  // Vérifier le rôle si spécifié
  if (requireRole && user?.role !== requireRole) {
    return <Navigate 
      to="/unauthorized" 
      state={{ 
        from: location.pathname,
        message: `Cette page est réservée aux ${requireRole}s` 
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
  // Seulement si l'utilisateur est authentifié et que le type d'utilisateur est connu
  // Ne pas bloquer l'accès si canAccessRoute retourne false pour éviter des redirections intempestives
  // Laisser les routes individuelles gérer leurs propres vérifications d'accès
  if (userType && !canAccessRoute(location.pathname, userType, isAuthenticated, user?.role)) {
    // Ne rediriger que vers unauthorized si on est vraiment sûr que l'accès est refusé
    // Pour éviter les redirections lors du refresh
    if (!location.pathname.startsWith('/unauthorized')) {
      return <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location.pathname,
          message: 'Accès non autorisé à cette page' 
        }} 
        replace 
      />;
    }
  }

  return children;
};

export default ProtectedRoute;
