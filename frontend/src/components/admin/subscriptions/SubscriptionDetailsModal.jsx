import React from 'react';
import { XCircle, Banknote, CreditCard } from 'lucide-react';
import { formatPrice, formatDate, getStatusBadge, getPaymentStatusBadge, getPlanBadge } from '../../../utils/subscriptionHelpers';
import { adminService } from '../../../services/adminService';

const SubscriptionDetailsModal = ({ 
  subscription, 
  onClose, 
  onUpdate 
}) => {
  if (!subscription) return null;

  const handleStatusUpdate = async (newStatus, newPaymentStatus) => {
    try {
      await adminService.updateSubscriptionStatus(subscription._id, {
        status: newStatus,
        paymentStatus: newPaymentStatus
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const statusBadge = getStatusBadge(subscription.status);
  const paymentBadge = getPaymentStatusBadge(subscription.paymentStatus);
  const planBadge = getPlanBadge(subscription.planId);
  const StatusIcon = statusBadge.Icon;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Détails de la souscription
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Utilisateur</label>
                <p className="mt-1 text-sm text-gray-900">
                  {subscription.user?.firstName} {subscription.user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{subscription.user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Plan</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planBadge.color}`}>
                    {planBadge.label}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Période</label>
                <p className="mt-1 text-sm text-gray-900">
                  {subscription.billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Montant</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatPrice(subscription.amount)} {subscription.currency}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Statut</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusBadge.label}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Paiement</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentBadge.color}`}>
                    {paymentBadge.label}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date de début</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(subscription.startDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date de fin</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(subscription.endDate)}
                </p>
              </div>
              {subscription.nextBillingDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Prochaine facturation</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(subscription.nextBillingDate)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Méthode de paiement</label>
                <p className="mt-1 text-sm text-gray-900">
                  {subscription.paymentMethod === 'cash' ? (
                    <>
                      <Banknote className="inline h-4 w-4 mr-1" />
                      Paiement à la livraison
                    </>
                  ) : (
                    <>
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      PayPal
                    </>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Renouvellement automatique</label>
                <p className="mt-1 text-sm text-gray-900">
                  {subscription.autoRenew ? 'Oui' : 'Non'}
                </p>
              </div>
            </div>

            {subscription.cancelledAt && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <label className="text-sm font-medium text-red-800">Annulé le</label>
                <p className="mt-1 text-sm text-red-700">
                  {formatDate(subscription.cancelledAt)}
                </p>
                {subscription.cancellationReason && (
                  <p className="mt-2 text-sm text-red-600">
                    Raison: {subscription.cancellationReason}
                  </p>
                )}
              </div>
            )}

            {/* Actions admin */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Actions administrateur</h4>
              <div className="flex flex-wrap gap-2">
                {subscription.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate('active', 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Activer la souscription
                  </button>
                )}
                {subscription.status === 'active' && (
                  <button
                    onClick={() => handleStatusUpdate('suspended', subscription.paymentStatus)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                  >
                    Suspendre
                  </button>
                )}
                {subscription.status === 'suspended' && (
                  <button
                    onClick={() => handleStatusUpdate('active', subscription.paymentStatus)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Réactiver
                  </button>
                )}
                {subscription.paymentStatus === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(subscription.status, 'completed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Marquer comme payé
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailsModal;

