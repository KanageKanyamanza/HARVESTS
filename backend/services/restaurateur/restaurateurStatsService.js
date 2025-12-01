const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { toPlainText } = require('../../utils/localization');

/**
 * Service pour les statistiques du restaurateur
 */

async function getMyStats(restaurateurId) {
  const orders = await Order.find({ 
    seller: restaurateurId 
  }).populate('buyer', 'firstName lastName');
  
  const dishes = await Product.find({ 
    restaurateur: restaurateurId,
    originType: 'dish'
  });
  
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  
  let totalDishesSold = 0;
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      totalDishesSold += item.quantity;
    });
  });
  
  const uniqueCustomers = new Set(orders.map(o => o.buyer?._id?.toString() || o.buyer?.toString())).size;
  
  const dishSales = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product?._id?.toString() || item.product?.toString();
      if (!dishSales[productId]) {
        dishSales[productId] = {
          quantity: 0,
          revenue: 0
        };
      }
      dishSales[productId].quantity += item.quantity;
      dishSales[productId].revenue += order.totalPrice || (item.quantity * item.unitPrice);
    });
  });
  
  const topDishes = await Promise.all(
    Object.entries(dishSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)
      .map(async ([dishId, sales]) => {
        const dish = await Product.findById(dishId).select('name category dishInfo');
        return {
          id: dishId,
          name: toPlainText(dish?.name, 'Plat'),
          category: dish?.dishInfo?.category || dish?.category || 'plat',
          quantitySold: sales.quantity,
          revenue: sales.revenue
        };
      })
  );
  
  const activeDishes = dishes.filter(d => d.isActive && d.status === 'approved').length;
  const conversionRate = dishes.length > 0 ? Math.round((activeDishes / dishes.length) * 100) : 0;
  
  const customerOrderCounts = {};
  orders.forEach(order => {
    const customerId = order.buyer?._id?.toString() || order.buyer?.toString();
    customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
  });
  const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
  const customerRetentionRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalDishesSold,
    uniqueCustomers,
    topProducts: topDishes,
    averageOrderValue,
    conversionRate,
    customerRetentionRate,
    totalProducts: dishes.length,
    activeProducts: activeDishes,
    totalProductsSold: totalDishesSold
  };
}

async function getStats(restaurateurId) {
  const orders = await Order.find({ seller: restaurateurId });
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  const dishes = await Product.find({ 
    restaurateur: restaurateurId,
    originType: 'dish'
  });
  const activeDishes = dishes.filter(d => d.isActive && d.status === 'approved');
  
  const totalDishesSold = completedOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  
  const uniqueCustomers = new Set(completedOrders.map(order => {
    const buyerId = order.buyer?._id?.toString() || order.buyer?.toString();
    return buyerId;
  }).filter(Boolean)).size;
  
  const dishSales = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product?._id?.toString() || item.product?.toString();
      if (!dishSales[productId]) {
        dishSales[productId] = {
          name: toPlainText(item.productSnapshot?.name, 'Plat'),
          category: item.productSnapshot?.dishInfo?.category || 'plat',
          quantitySold: 0,
          revenue: 0
        };
      }
      dishSales[productId].quantitySold += item.quantity;
      dishSales[productId].revenue += item.totalPrice || (item.quantity * item.unitPrice);
    });
  });
  
  const topProducts = Object.values(dishSales)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);
  
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalProducts: dishes.length,
    activeProducts: activeDishes.length,
    totalProductsSold: totalDishesSold,
    uniqueCustomers,
    topProducts,
    averageOrderValue,
    conversionRate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
    customerRetentionRate: 0
  };
}

async function getSalesAnalytics(restaurateurId) {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const orders = await Order.find({ 
    seller: restaurateurId,
    status: { $in: ['completed', 'delivered'] },
    createdAt: { $gte: twelveMonthsAgo }
  });
  
  const monthlySales = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
    if (!monthlySales[month]) {
      monthlySales[month] = {
        orders: 0,
        revenue: 0,
        products: 0
      };
    }
    monthlySales[month].orders += 1;
    monthlySales[month].revenue += order.total || 0;
    order.items.forEach(item => {
      monthlySales[month].products += item.quantity;
    });
  });
  
  return {
    monthlySales: Object.entries(monthlySales).map(([month, data]) => ({
      month,
      ...data
    }))
  };
}

async function getRevenueAnalytics(restaurateurId) {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const orders = await Order.find({ 
    seller: restaurateurId,
    status: { $in: ['completed', 'delivered'] },
    createdAt: { $gte: twelveMonthsAgo }
  });
  
  const monthlyRevenue = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
    if (!monthlyRevenue[month]) {
      monthlyRevenue[month] = 0;
    }
    monthlyRevenue[month] += order.total || 0;
  });
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + (order.total || 0), 0);

  return {
    monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    })),
    currentMonthRevenue,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
  };
}

module.exports = {
  getMyStats,
  getStats,
  getSalesAnalytics,
  getRevenueAnalytics
};

