const Consumer = require('../../models/Consumer');
const Subscription = require('../../models/Subscription');

/**
 * Service pour la gestion des abonnements du consommateur
 */

function calculateNextDelivery(subscription) {
  if (!subscription || !subscription.frequency) return null;
  
  const now = new Date();
  const lastDelivery = subscription.lastDelivery || subscription.startDate || now;
  const nextDelivery = new Date(lastDelivery);
  
  switch (subscription.frequency) {
    case 'weekly':
      nextDelivery.setDate(nextDelivery.getDate() + 7);
      break;
    case 'biweekly':
      nextDelivery.setDate(nextDelivery.getDate() + 14);
      break;
    case 'monthly':
      nextDelivery.setMonth(nextDelivery.getMonth() + 1);
      break;
    default:
      return null;
  }
  
  return nextDelivery;
}

async function getSubscriptions(consumerId) {
  const subscriptions = await Subscription.find({ consumer: consumerId })
    .populate('producer', 'farmName firstName lastName')
    .sort('-createdAt');
  
  return subscriptions.map(sub => ({
    ...sub.toObject(),
    nextDelivery: calculateNextDelivery(sub)
  }));
}

async function getSubscription(consumerId, subscriptionId) {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    consumer: consumerId
  }).populate('producer', 'farmName firstName lastName');
  
  if (!subscription) {
    throw new Error('Abonnement non trouvé');
  }
  
  return {
    ...subscription.toObject(),
    nextDelivery: calculateNextDelivery(subscription)
  };
}

async function createSubscription(consumerId, subscriptionData) {
  const subscription = await Subscription.create({
    ...subscriptionData,
    consumer: consumerId
  });
  
  await subscription.populate('producer', 'farmName firstName lastName');
  
  return {
    ...subscription.toObject(),
    nextDelivery: calculateNextDelivery(subscription)
  };
}

async function updateSubscription(consumerId, subscriptionId, updateData) {
  const subscription = await Subscription.findOneAndUpdate(
    { _id: subscriptionId, consumer: consumerId },
    updateData,
    { new: true, runValidators: true }
  ).populate('producer', 'farmName firstName lastName');
  
  if (!subscription) {
    throw new Error('Abonnement non trouvé');
  }
  
  return {
    ...subscription.toObject(),
    nextDelivery: calculateNextDelivery(subscription)
  };
}

async function cancelSubscription(consumerId, subscriptionId) {
  const subscription = await Subscription.findOneAndUpdate(
    { _id: subscriptionId, consumer: consumerId },
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true }
  );
  
  if (!subscription) {
    throw new Error('Abonnement non trouvé');
  }
  
  return subscription;
}

async function pauseSubscription(consumerId, subscriptionId) {
  const subscription = await Subscription.findOneAndUpdate(
    { _id: subscriptionId, consumer: consumerId },
    { status: 'paused', pausedAt: new Date() },
    { new: true }
  );
  
  if (!subscription) {
    throw new Error('Abonnement non trouvé');
  }
  
  return subscription;
}

async function resumeSubscription(consumerId, subscriptionId) {
  const subscription = await Subscription.findOneAndUpdate(
    { _id: subscriptionId, consumer: consumerId },
    { status: 'active', $unset: { pausedAt: 1 } },
    { new: true }
  );
  
  if (!subscription) {
    throw new Error('Abonnement non trouvé');
  }
  
  return subscription;
}

module.exports = {
  calculateNextDelivery,
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription
};

