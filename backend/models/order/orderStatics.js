// Méthodes statiques
function addOrderStatics(orderSchema) {
  orderSchema.statics.getOrdersByStatus = function(status, userId = null, userType = null) {
    const query = { status };
    
    if (userId) {
      if (['buyer', 'consumer'].includes(userType)) {
        query.buyer = userId;
      } else if (['seller', 'producer', 'transformer', 'restaurateur'].includes(userType)) {
        query.$or = [
          { seller: userId },
          { 'segments.seller': userId },
          { 'items.seller': userId },
          { 'items.productSnapshot.producer': userId },
          { 'items.productSnapshot.transformer': userId },
          { 'items.productSnapshot.restaurateur': userId }
        ];
      } else if (userType === 'transporter') {
        query['delivery.transporter'] = userId;
      }
    }
    
    return this.find(query)
      .populate('buyer', 'firstName lastName email')
      .populate('seller', 'farmName companyName firstName lastName')
      .populate({
        path: 'segments.seller',
        select: 'farmName companyName firstName lastName email phone userType'
      })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });
  };

  orderSchema.statics.getRevenueStats = function(sellerId, startDate, endDate) {
    const matchQuery = {
      seller: sellerId,
      status: 'completed',
      completedAt: { $gte: startDate, $lte: endDate }
    };
    
    return this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$subtotal' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$subtotal' },
          totalFees: { $sum: '$payment.fees.total' }
        }
      }
    ]);
  };
}

module.exports = addOrderStatics;

