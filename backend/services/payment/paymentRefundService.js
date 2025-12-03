const Payment = require('../../models/Payment');
const Notification = require('../../models/Notification');

/**
 * Service pour la gestion des remboursements
 */

/**
 * Demander un remboursement
 */
async function requestRefund(paymentId, userId, { reason, amount }) {
  const payment = await Payment.findOne({
    paymentId,
    user: userId
  });

  if (!payment) {
    throw new Error('Paiement non trouvé');
  }

  if (!payment.canBeRefunded) {
    throw new Error('Ce paiement ne peut pas être remboursé');
  }

  const refundAmount = amount || payment.amount;
  await payment.createRefund(refundAmount, reason);

  // Notifier les admins
  await Notification.createNotification({
    recipient: 'admin',
    type: 'refund_requested',
    category: 'payment',
    priority: 'high',
    title: 'Demande de remboursement',
    message: `Demande de remboursement de ${refundAmount} ${payment.currency} pour la commande ${payment.order}`,
    data: {
      paymentId: payment.paymentId,
      amount: refundAmount,
      reason
    },
    channels: {
      inApp: { enabled: true },
      email: { enabled: true }
    }
  });

  return payment;
}

/**
 * Traiter un remboursement (admin)
 */
async function processRefund(refundId, adminId, { status, note }) {
  const payment = await Payment.findOne({
    'refunds.refundId': refundId
  }).populate('user', 'firstName lastName email');

  if (!payment) {
    throw new Error('Demande de remboursement non trouvée');
  }

  await payment.processRefund(refundId, status);

  // Notifier l'utilisateur
  const refund = payment.refunds.find(r => r.refundId === refundId);
  
  await Notification.createNotification({
    recipient: payment.user._id,
    type: status === 'succeeded' ? 'refund_processed' : 'refund_rejected',
    category: 'payment',
    title: status === 'succeeded' ? 'Remboursement traité' : 'Remboursement rejeté',
    message: status === 'succeeded' 
      ? `Votre remboursement de ${refund.amount} ${payment.currency} a été traité`
      : `Votre demande de remboursement a été rejetée. ${note || ''}`,
    data: {
      paymentId: payment.paymentId,
      refundId,
      amount: refund.amount,
      currency: payment.currency
    },
    channels: {
      inApp: { enabled: true },
      email: { enabled: true }
    }
  });

  return { payment, refund };
}

module.exports = {
  requestRefund,
  processRefund
};

