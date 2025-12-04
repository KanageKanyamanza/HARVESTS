import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, BarChart3, CreditCard } from 'lucide-react';

const MainSections = () => {
  const sections = [
    {
      to: '/admin/users',
      icon: Users,
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-300',
      hoverBg: 'hover:bg-blue-50',
      title: 'Gestion des utilisateurs',
      description: 'Modérer et gérer les comptes'
    },
    {
      to: '/admin/products',
      icon: Package,
      iconColor: 'text-green-600',
      hoverBorder: 'hover:border-green-300',
      hoverBg: 'hover:bg-green-50',
      title: 'Gestion des produits',
      description: 'Approuver et modérer les produits'
    },
    {
      to: '/admin/orders',
      icon: ShoppingCart,
      iconColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-50',
      title: 'Gestion des commandes',
      description: 'Suivre et gérer les commandes'
    },
    {
      to: '/admin/analytics',
      icon: BarChart3,
      iconColor: 'text-yellow-600',
      hoverBorder: 'hover:border-yellow-300',
      hoverBg: 'hover:bg-yellow-50',
      title: 'Analytics',
      description: 'Rapports et statistiques'
    },
    {
      to: '/admin/subscriptions',
      icon: CreditCard,
      iconColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      hoverBg: 'hover:bg-emerald-50',
      title: 'Abonnements',
      description: 'Gérer les abonnements'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Sections principales</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section, index) => (
            <Link
              key={index}
              to={section.to}
              className={`flex items-center p-4 rounded-lg border border-gray-200 ${section.hoverBorder} ${section.hoverBg} transition-colors duration-200`}
            >
              <section.icon className={`w-8 h-8 ${section.iconColor}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{section.title}</p>
                <p className="text-xs text-gray-500">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainSections;

