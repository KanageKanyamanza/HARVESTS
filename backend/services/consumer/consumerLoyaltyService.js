const Consumer = require('../../models/Consumer');
const LoyaltyTransaction = require('../../models/LoyaltyTransaction');
const Order = require('../../models/Order');

/**
 * Service pour la gestion du programme de fidélité du consommateur
 */

async function getLoyaltyStatus(consumerId) {
  // Jour 54 : les points sont rangés dans loyaltyProgram (models/Consumer.js) ;
  // loyaltyPoints / loyaltyTier n'existent pas (toujours 0 point, niveau bronze)
  const consumer = await Consumer.findById(consumerId).select('loyaltyProgram');
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
    currentPoints: consumer.loyaltyProgram?.points || 0,
    tier: consumer.loyaltyProgram?.tier || 'bronze',
    totalEarned: totalEarned[0]?.total || 0,
    totalRedeemed: totalRedeemed[0]?.total || 0
  };
}

async function redeemLoyaltyPoints(consumerId, points, description) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  // Méthode du modèle : débite loyaltyProgram.points et met à jour le niveau
  await consumer.redeemLoyaltyPoints(points);
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
    remainingPoints: consumer.loyaltyProgram.points
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

