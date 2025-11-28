import React from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiTruck } from 'react-icons/fi';

export const getStatusConfig = (status) => {
  const configs = {
    'pending': { color: 'text-yellow-600 bg-yellow-100', text: 'En attente', icon: FiClock, description: 'Commande en attente de confirmation' },
    'confirmed': { color: 'text-blue-600 bg-blue-100', text: 'Confirmée', icon: FiCheckCircle, description: 'Commande confirmée et en préparation' },
    'preparing': { color: 'text-purple-600 bg-purple-100', text: 'En préparation', icon: FiPackage, description: 'Commande en cours de préparation' },
    'ready-for-pickup': { color: 'text-orange-600 bg-orange-100', text: 'Prête pour collecte', icon: FiPackage, description: 'Commande prête pour la collecte' },
    'in-transit': { color: 'text-indigo-600 bg-indigo-100', text: 'En transit', icon: FiTruck, description: 'Commande en route' },
    'out-for-delivery': { color: 'text-blue-600 bg-blue-100', text: 'En cours de livraison', icon: FiTruck, description: 'Commande en cours de livraison' },
    'delivered': { color: 'text-green-600 bg-green-100', text: 'Livrée', icon: FiCheckCircle, description: 'Commande livrée avec succès' },
    'completed': { color: 'text-green-600 bg-green-100', text: 'Terminée', icon: FiCheckCircle, description: 'Commande terminée avec succès' },
    'cancelled': { color: 'text-red-600 bg-red-100', text: 'Annulée', icon: FiXCircle, description: 'Commande annulée' }
  };
  return configs[status] || configs['pending'];
};

export const getItemStatusConfig = (status = 'pending') => {
  const configs = {
    pending: { color: 'bg-yellow-100 text-yellow-700', text: 'En attente' },
    confirmed: { color: 'bg-green-100 text-green-700', text: 'Confirmé' },
    preparing: { color: 'bg-purple-100 text-purple-700', text: 'En préparation' },
    'ready-for-pickup': { color: 'bg-orange-100 text-orange-700', text: 'Prête pour collecte' },
    'in-transit': { color: 'bg-blue-100 text-blue-700', text: 'En transit' },
    delivered: { color: 'bg-green-100 text-green-700', text: 'Livré' },
    completed: { color: 'bg-emerald-100 text-emerald-700', text: 'Terminé' },
    cancelled: { color: 'bg-gray-100 text-gray-600', text: 'Annulé' },
    rejected: { color: 'bg-red-100 text-red-600', text: 'Rejeté' },
    refunded: { color: 'bg-red-100 text-red-600', text: 'Remboursé' },
    disputed: { color: 'bg-red-100 text-red-600', text: 'En litige' }
  };
  return configs[status] || configs.pending;
};

const OrderStatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  const StatusIcon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
      <StatusIcon className="h-5 w-5 mr-2" />
      {config.text}
    </span>
  );
};

export default OrderStatusBadge;

