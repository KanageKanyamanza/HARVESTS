import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiEdit, 
  FiSettings, 
  FiCreditCard, 
  FiMapPin, 
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiShoppingCart
} from 'react-icons/fi';
import { 
  getProfileRoute, 
  getSettingsRoute,
  getAddProductRoute,
  getOrdersRoute
} from '../../../utils/routeUtils';

const QuickActionsSection = ({ userType, actions = [] }) => {
  const getDefaultActions = () => {
    const baseActions = [
      {
        icon: <FiPlus className="h-5 w-5" />,
        title: 'Ajouter un produit',
        description: 'Créer un nouveau produit',
        href: getAddProductRoute({ userType }),
        color: 'bg-blue-500 hover:bg-blue-600'
      },
      {
        icon: <FiEdit className="h-5 w-5" />,
        title: 'Modifier le profil',
        description: 'Mettre à jour vos informations',
        href: getProfileRoute({ userType }),
        color: 'bg-green-500 hover:bg-green-600'
      },
      {
        icon: <FiSettings className="h-5 w-5" />,
        title: 'Paramètres',
        description: 'Configurer votre compte',
        href: getSettingsRoute({ userType }),
        color: 'bg-gray-500 hover:bg-gray-600'
      }
    ];

    // Actions spécifiques selon le type d'utilisateur
    switch (userType) {
      case 'producer':
        return [
          ...baseActions,
          {
            icon: <FiTrendingUp className="h-5 w-5" />,
            title: 'Analytics',
            description: 'Voir les statistiques',
            href: `/${userType}/stats`,
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            icon: <FiShield className="h-5 w-5" />,
            title: 'Certifications',
            description: 'Gérer les certifications',
            href: `/${userType}/certifications`,
            color: 'bg-yellow-500 hover:bg-yellow-600'
          }
        ];
      
      case 'consumer':
        return [
          {
            icon: <FiShoppingCart className="h-5 w-5" />,
            title: 'Mes commandes',
            description: 'Voir mes commandes',
            href: getOrdersRoute({ userType }),
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            icon: <FiUsers className="h-5 w-5" />,
            title: 'Favoris',
            description: 'Mes producteurs favoris',
            href: `/${userType}/favorites`,
            color: 'bg-red-500 hover:bg-red-600'
          },
          {
            icon: <FiEdit className="h-5 w-5" />,
            title: 'Modifier le profil',
            description: 'Mettre à jour vos informations',
            href: getProfileRoute({ userType }),
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            icon: <FiSettings className="h-5 w-5" />,
            title: 'Paramètres',
            description: 'Configurer votre compte',
            href: getSettingsRoute({ userType }),
            color: 'bg-gray-500 hover:bg-gray-600'
          }
        ];
      
      case 'transformer':
        return [
          ...baseActions,
          {
            icon: <FiTrendingUp className="h-5 w-5" />,
            title: 'Production',
            description: 'Gérer la production',
            href: `/${userType}/production`,
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            icon: <FiShield className="h-5 w-5" />,
            title: 'Certifications',
            description: 'Gérer les certifications',
            href: `/${userType}/certifications`,
            color: 'bg-yellow-500 hover:bg-yellow-600'
          }
        ];
      
      case 'restaurateur':
        return [
          {
            icon: <FiPlus className="h-5 w-5" />,
            title: 'Nouveau plat',
            description: 'Créer un nouveau plat',
            href: `/${userType}/dishes/add`,
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            icon: <FiUsers className="h-5 w-5" />,
            title: 'Fournisseurs',
            description: 'Gérer les fournisseurs',
            href: `/${userType}/suppliers`,
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            icon: <FiShoppingCart className="h-5 w-5" />,
            title: 'Commandes',
            description: 'Voir les commandes',
            href: getOrdersRoute({ userType }),
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            icon: <FiEdit className="h-5 w-5" />,
            title: 'Modifier le profil',
            description: 'Mettre à jour vos informations',
            href: getProfileRoute({ userType }),
            color: 'bg-gray-500 hover:bg-gray-600'
          }
        ];
      
      case 'transporter':
        return [
          {
            icon: <FiShoppingCart className="h-5 w-5" />,
            title: 'Livraisons',
            description: 'Gérer les livraisons',
            href: `/${userType}/deliveries`,
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            icon: <FiMapPin className="h-5 w-5" />,
            title: 'Zones de livraison',
            description: 'Configurer les zones',
            href: `/${userType}/zones`,
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            icon: <FiEdit className="h-5 w-5" />,
            title: 'Modifier le profil',
            description: 'Mettre à jour vos informations',
            href: getProfileRoute({ userType }),
            color: 'bg-gray-500 hover:bg-gray-600'
          }
        ];
      
      case 'exporter':
        return [
          {
            icon: <FiPackage className="h-5 w-5" />,
            title: 'Produits d\'export',
            description: 'Gérer les produits',
            href: `/${userType}/products`,
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            icon: <FiTrendingUp className="h-5 w-5" />,
            title: 'Analytics',
            description: 'Voir les statistiques',
            href: `/${userType}/analytics`,
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            icon: <FiEdit className="h-5 w-5" />,
            title: 'Modifier le profil',
            description: 'Mettre à jour vos informations',
            href: getProfileRoute({ userType }),
            color: 'bg-gray-500 hover:bg-gray-600'
          }
        ];
      
      default:
        return baseActions;
    }
  };

  const actionsToShow = actions.length > 0 ? actions : getDefaultActions();

  return (
    <div className="grid grid-cols-1 gap-4">
      {actionsToShow.map((action, index) => (
        <Link
          key={index}
          to={action.href}
          className="group p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg text-white ${action.color} transition-colors`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {action.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickActionsSection;
