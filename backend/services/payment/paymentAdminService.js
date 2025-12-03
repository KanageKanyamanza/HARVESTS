const Payment = require('../../models/Payment');

/**
 * Service pour l'administration des paiements
 */

/**
 * Obtenir tous les paiements (admin)
 */
async function getAllPayments(queryParams = {}) {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const queryObj = {};
  
  if (queryParams.status) queryObj.status = queryParams.status;
  if (queryParams.method) queryObj.method = queryParams.method;
  if (queryParams.provider) queryObj.provider = queryParams.provider;
  if (queryParams.user) queryObj.user = queryParams.user;

  const payments = await Payment.find(queryObj)
    .populate('user', 'firstName lastName email userType')
    .populate('order', 'orderNumber buyer seller')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(queryObj);

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Obtenir les statistiques des paiements
 */
async function getPaymentStats({ period = '30d', currency = 'XAF' }) {
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Statistiques générales
  const revenueStats = await Payment.getRevenueStats(startDate, new Date(), currency);
  
  // Statistiques par méthode de paiement
  const methodStats = await Payment.getPaymentMethodStats(startDate, new Date());
  
  // Analyse des échecs
  const failureStats = await Payment.getFailureAnalysis(startDate, new Date());

  // Évolution dans le temps
  const timeline = await Payment.aggregate([
    { 
      $match: { 
        status: 'succeeded',
        currency,
        paidAt: { $gte: startDate, $lte: new Date() }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' }
        },
        revenue: { $sum: '$amount' },
        fees: { $sum: '$fees.total' },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return {
    overview: revenueStats[0] || {},
    methodBreakdown: methodStats,
    failureAnalysis: failureStats,
    timeline,
    period,
    currency
  };
}

/**
 * Obtenir les paiements non réconciliés
 */
async function getUnreconciledPayments(olderThanDays = 7) {
  const payments = await Payment.getUnreconciledPayments(olderThanDays);
  return payments;
}

/**
 * Réconcilié un paiement
 */
async function reconcilePayment(paymentId, adminId, { bankStatementRef, discrepancies }) {
  const payment = await Payment.findOne({
    paymentId
  });

  if (!payment) {
    throw new Error('Paiement non trouvé');
  }

  await payment.reconcile(adminId, bankStatementRef, discrepancies);

  return payment;
}

module.exports = {
  getAllPayments,
  getPaymentStats,
  getUnreconciledPayments,
  reconcilePayment
};

