const Consumer = require('../../models/Consumer');
const LoyaltyTransaction = require('../../models/LoyaltyTransaction');
const Order = require('../../models/Order');

/**
 * Service pour la gestion du programme de fidélité du consommateur
 */

async function getLoyaltyStatus(consumerId) {
  const consumer = await Consumer.findById(consumerId).select('loyaltyPoints loyaltyTier');
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  const totalEarned = await LoyaltyTransaction.aggregate([
    { $match: { consumer: consumerId, type: 'earned' } },
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]);
  
  const totalRedeemed = await LoyaltyTransaction.aggregate([
    { $match: { consumer: consumerId, type: 'redeemed' } },
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]);
  
  return {
    currentPoints: consumer.loyaltyPoints || 0,
    tier: consumer.loyaltyTier || 'bronze',
    totalEarned: totalEarned[0]?.total || 0,
    totalRedeemed: totalRedeemed[0]?.total || 0
  };
}

async function redeemLoyaltyPoints(consumerId, points, description) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  const currentPoints = consumer.loyaltyPoints || 0;
  
  if (currentPoints < points) {
    throw new Error('Points insuffisants');
  }
  
  consumer.loyaltyPoints -= points;
  await consumer.save();
  
  const transaction = await LoyaltyTransaction.create({
    consumer: consumerId,
    type: 'redeemed',
    points: -points,
    description: description || 'Rédemption de points',
    order: null
  });
  
  return {
    transaction,
    remainingPoints: consumer.loyaltyPoints
  };
}

async function getLoyaltyHistory(consumerId, limit = 20) {
  const transactions = await LoyaltyTransaction.find({ consumer: consumerId })
    .populate('order', 'orderNumber total')
    .sort('-createdAt')
    .limit(limit);
  
  return transactions;
}

module.exports = {
  getLoyaltyStatus,
  redeemLoyaltyPoints,
  getLoyaltyHistory
};

