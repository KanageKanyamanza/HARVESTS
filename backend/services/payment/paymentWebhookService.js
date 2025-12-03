const Payment = require('../../models/Payment');
const paypalService = require('../paypalService');

/**
 * Service pour la gestion des webhooks de paiement
 */

/**
 * Vérifier et traiter un webhook PayPal
 */
async function handlePayPalWebhook(headers, body) {
  const isValid = await paypalService.verifyWebhook(headers, body);

  if (!isValid) {
    throw new Error('Signature de webhook invalide');
  }

  const { event_type: eventType, resource } = body;

  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await handlePayPalCaptureCompleted(resource);
      break;
    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.REFUNDED':
    case 'PAYMENT.CAPTURE.REVERSED':
      await handlePayPalCaptureFailed(resource, eventType);
      break;
    default:
      // Événement non géré, mais signature valide
      break;
  }

  return { eventType, processed: true };
}

/**
 * Fonctions utilitaires pour les webhooks
 */

async function handlePayPalCaptureCompleted(resource) {
  const captureId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;

  const payment = await Payment.findOne({
    $or: [
      { 'paymentDetails.paypal.captureId': captureId },
      { 'paymentDetails.paypal.orderId': orderId }
    ]
  });

  if (!payment || payment.status === 'succeeded') {
    return;
  }

  payment.paymentDetails.paypal = {
    ...(payment.paymentDetails.paypal || {}),
    orderId: orderId || payment.paymentDetails.paypal?.orderId,
    captureId,
    status: resource.status,
    payerEmail: resource.payer?.email_address || payment.paymentDetails.paypal?.payerEmail,
    payerName: [resource.payer?.name?.given_name, resource.payer?.name?.surname].filter(Boolean).join(' ') || payment.paymentDetails.paypal?.payerName,
    rawResponse: resource
  };

  await payment.markAsSucceeded(captureId, resource.update_time ? new Date(resource.update_time) : new Date());
}

async function handlePayPalCaptureFailed(resource, eventType) {
  const captureId = resource.id;

  const payment = await Payment.findOne({
    'paymentDetails.paypal.captureId': captureId
  });

  if (!payment) {
    return;
  }

  const failureReason = resource.status_details?.reason || eventType;
  await payment.markAsFailed(eventType.toLowerCase(), failureReason);
}

module.exports = {
  handlePayPalWebhook
};

