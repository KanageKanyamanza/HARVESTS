const Order = require('../../models/Order');
const Consumer = require('../../models/Consumer');
const Review = require('../../models/Review');

/**
 * Service pour les statistiques du consommateur
 */

async function getConsumerStats(consumerId) {
  const orders = await Order.find({ buyer: consumerId });
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
  
  const totalSpent = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;
  
  // Jour 54 : les points sont rangés dans loyaltyProgram (models/Consumer.js) ;
  // loyaltyPoints / loyaltyTier n'existent pas (toujours 0 point, niveau bronze)
  const consumer = await Consumer.findById(consumerId).select('loyaltyProgram');
  // Jour 54 : affiché sur le tableau de bord (la carte « Avis donnés » restait à 0)
  const reviewsWritten = await Review.countDocuments({ reviewer: consumerId });
  
  return {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalSpent,
    averageOrderValue,
    loyaltyPoints: consumer?.loyaltyProgram?.points || 0,
    loyaltyTier: consumer?.loyaltyProgram?.tier || 'bronze',
    totalPointsEarned: consumer?.loyaltyProgram?.totalPointsEarned || 0,
    reviewsWritten
  };
}

async function getSpendingAnalytics(consumerId) {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const orders = await Order.find({
    buyer: consumerId,
    status: { $in: ['completed', 'delivered'] },
    createdAt: { $gte: twelveMonthsAgo }
  });
  
  const monthlySpending = {};
  orders.forEach(order => {
    // Jour 54 : mois ISO (AAAA-MM), triable et formaté côté interface selon la
    // langue (était « sept. 2026 », en français et non trié)
    const month = new Date(order.createdAt).toISOString().slice(0, 7);
    if (!monthlySpending[month]) {
      monthlySpending[month] = 0;
    }
    monthlySpending[month] += order.total || 0;
  });
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthSpending = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + (order.total || 0), 0);
  
  return {
    monthlySpending: Object.entries(monthlySpending)
      .map(([month, spending]) => ({ month, spending }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    currentMonthSpending,
    totalSpending: orders.reduce((sum, order) => sum + (order.total || 0), 0)
  };
}

async function getPurchaseHistory(consumerId, limit = 20) {
  const orders = await Order.find({ buyer: consumerId })
    .populate('seller', 'farmName companyName firstName lastName')
    .sort('-createdAt')
    .limit(limit);
  
  return orders;
}

async function getRecommendations(consumerId) {
  // Logique de recommandation basique basée sur l'historique d'achat
  const orders = await Order.find({ buyer: consumerId })
    .populate('items.product', 'category subcategory');
  
  const categoryCounts = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const category = item.product?.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
  });
  
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
  
  return {
    recommendedCategories: topCategories,
    basedOn: 'purchase_history'
  };
}

module.exports = {
  getConsumerStats,
  getSpendingAnalytics,
  getPurchaseHistory,
  getRecommendations
};

