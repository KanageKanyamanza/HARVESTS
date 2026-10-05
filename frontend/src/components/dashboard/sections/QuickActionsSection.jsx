import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiPlus, 
  FiEdit, 
  FiSettings, 
  FiCreditCard, 
  FiTruck, 
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
  const { t } = useTranslation('common');
  const getDefaultActions = () => {
    const baseActions = [
      {
        icon: <FiPlus className="h-5 w-5" />,
        key: 'addProduct',
        href: getAddProductRoute({ userType }),
        color: 'bg-blue-500 hover:bg-blue-600'
      },
      {
        icon: <FiEdit className="h-5 w-5" />,
        key: 'editProfile',
        href: getProfileRoute({ userType }),
        color: 'bg-green-500 hover:bg-green-600'
      },
      {
        icon: <FiSettings className="h-5 w-5" />,
        key: 'settings',
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
            key: 'analytics',
            href: `/${userType}/stats`,
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            icon: <FiShield className="h-5 w-5" />,
            key: 'certifications',
            href: `/${userType}/certifications`,
            color: 'bg-yellow-500 hover:bg-yellow-600'
          }
        ];
      
      case 'consumer':
        return [
          {
            icon: <FiShoppingCart className="h-5 w-5" />,
            key: 'myOrders',
            href: getOrdersRoute({ userType }),
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            icon: <FiUsers className="h-5 w-5" />,
            key: 'favorites',
            href: `/${userType}/favorites`,
            color: 'bg-red-500 hover:bg-red-600'
          },
          {
            icon: <FiEdit className="h-5 w-5" />,
            key: 'editProfile',
            href: getProfileRoute({ userType }),
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            icon: <FiSettings className="h-5 w-5" />,
            key: 'settings',
            href: getSettingsRoute({ userType }),
            color: 'bg-gray-500 hover:bg-gray-600'
          }
        ];
      
      case 'transformer':
        return [
          ...baseActions,
          {
            icon: <FiTrendingUp className="h-5 w-5" />,
            key: 'production',
            href: `/${userType}/production`,
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            icon: <FiShield className="h-5 w-5" />,
            key: 'certifications',
            href: `/${userType}/certifications`,
            color: 'bg-yellow-500 hover:bg-yellow-600'
          }
        ];
      
      case 'restaurateur':
        return [
          {
            icon: <FiPlus className="h-5 w-5" />,
            key: 'newDish',
            href: `/${userType}/dishes/add`,
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            icon: <FiUsers className="h-5 w-5" />,
            key: 'suppliers',
            href: `/${userType}/suppliers`,
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            icon: <FiShoppingCart className="h-5 w-5" />,
            key: 'orders',
            href: getOrdersRoute({ userType }),
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            icon: <FiEdit className="h-5 w-5" />,
            key: 'editProfile',
            href: getProfileRoute({ userType }),
            color: 'bg-gray-500 hover:bg-gray-600'
          }
        ];
      
      case 'transporter':
        return [
          {
            icon: <FiShoppingCart className="h-5 w-5" />,
            key: 'deliveries',
            href: getOrdersRoute({ userType }),
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            icon: <FiTruck className="h-5 w-5" />,
            key: 'fleet',
            href: `/${userType}/fleet`,
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            icon: <FiEdit className="h-5 w-5" />,
            key: 'editProfile',
            href: getProfileRoute({ userType }),
            color: 'bg-gray-500 hover:bg-gray-600'
          }
        ];
      
      case 'exporter':
        return [
          {
            icon: <FiPackage className="h-5 w-5" />,
            key: 'exportProducts',
            href: `/${userType}/products`,
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            icon: <FiTrendingUp className="h-5 w-5" />,
            key: 'analytics',
            href: `/${userType}/analytics`,
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            icon: <FiEdit className="h-5 w-5" />,
            key: 'editProfile',
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
                {action.key ? t(`dashboardSections.quickActions.${action.key}.title`) : action.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {action.key ? t(`dashboardSections.quickActions.${action.key}.description`) : action.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickActionsSection;
