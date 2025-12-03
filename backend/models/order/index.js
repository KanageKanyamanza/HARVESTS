const mongoose = require('mongoose');
const { orderSchema } = require('./orderSchemas');
const addOrderIndexes = require('./orderIndexes');
const addOrderVirtuals = require('./orderVirtuals');
const addOrderMiddleware = require('./orderMiddleware');
const addOrderMethods = require('./orderMethods');
const addOrderStatics = require('./orderStatics');

// Ajouter les index
addOrderIndexes(orderSchema);

// Ajouter les virtuals
addOrderVirtuals(orderSchema);

// Ajouter les middleware
addOrderMiddleware(orderSchema);

// Ajouter les méthodes d'instance
addOrderMethods(orderSchema);

// Ajouter les méthodes statiques
addOrderStatics(orderSchema);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

