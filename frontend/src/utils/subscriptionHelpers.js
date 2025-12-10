import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

/**
 * Formater un prix
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR').format(price);
};

/**
 * Formater une date
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Obtenir le badge de statut
 */
export const getStatusBadge = (status) => {
  const badges = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Actif' },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Annulé' },
    expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Expiré' },
    suspended: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Suspendu' }
  };
  const badge = badges[status] || badges.pending;
  const Icon = badge.icon;
  return {
    ...badge,
    Icon
  };
};

/**
 * Obtenir le badge de statut de paiement
 */
export const getPaymentStatusBadge = (status) => {
  const badges = {
    completed: { color: 'bg-green-100 text-green-800', label: 'Payé' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Échoué' },
    refunded: { color: 'bg-gray-100 text-gray-800', label: 'Remboursé' }
  };
  return badges[status] || badges.pending;
};

/**
 * Obtenir le badge de plan
 */
export const getPlanBadge = (planId) => {
  const plans = {
    gratuit: { color: 'bg-gray-100 text-gray-800', label: 'Gratuit' },
    standard: { color: 'bg-blue-100 text-blue-800', label: 'Standard' },
    premium: { color: 'bg-purple-100 text-purple-800', label: 'Premium' }
  };
  return plans[planId] || plans.gratuit;
};

