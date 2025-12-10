import {
  ShoppingCart,
  Package,
  MessageSquare,
  User,
  Settings,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-react';

/**
 * Obtenir l'icône d'une notification selon son type et sa catégorie
 */
export const getNotificationIcon = (type, category) => {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-5 w-5" />;
    case 'product':
      return <Package className="h-5 w-5" />;
    case 'message':
      return <MessageSquare className="h-5 w-5" />;
    case 'user':
      return <User className="h-5 w-5" />;
    case 'system':
      return <Settings className="h-5 w-5" />;
    default:
      switch (category) {
        case 'success':
          return <CheckCircle className="h-5 w-5" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5" />;
        case 'error':
          return <AlertCircle className="h-5 w-5" />;
        default:
          return <Info className="h-5 w-5" />;
      }
  }
};

/**
 * Obtenir la couleur d'une notification selon son type et sa catégorie
 */
export const getNotificationColor = (type, category) => {
  switch (type) {
    case 'order':
      return 'bg-blue-100 text-blue-600';
    case 'product':
      return 'bg-green-100 text-green-600';
    case 'message':
      return 'bg-purple-100 text-purple-600';
    case 'user':
      return 'bg-indigo-100 text-indigo-600';
    case 'system':
      return 'bg-gray-100 text-gray-600';
    default:
      switch (category) {
        case 'success':
          return 'bg-green-100 text-green-600';
        case 'warning':
          return 'bg-yellow-100 text-yellow-600';
        case 'error':
          return 'bg-red-100 text-red-600';
        default:
          return 'bg-blue-100 text-blue-600';
      }
  }
};

/**
 * Formater une date pour l'affichage
 */
export const formatNotificationDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

