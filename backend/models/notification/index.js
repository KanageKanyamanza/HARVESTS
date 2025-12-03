const mongoose = require('mongoose');
const { notificationSchema } = require('./notificationSchema');
const addNotificationIndexes = require('./notificationIndexes');
const addNotificationVirtuals = require('./notificationVirtuals');
const addNotificationMiddleware = require('./notificationMiddleware');
const addNotificationMethods = require('./notificationMethods');
const addNotificationStatics = require('./notificationStatics');
const addNotificationCreators = require('./notificationCreators');

// Ajouter les index
addNotificationIndexes(notificationSchema);

// Ajouter les virtuals
addNotificationVirtuals(notificationSchema);

// Ajouter les middleware
addNotificationMiddleware(notificationSchema);

// Ajouter les méthodes d'instance
addNotificationMethods(notificationSchema);

// Ajouter les méthodes statiques
addNotificationStatics(notificationSchema);

// Ajouter les créateurs de notifications spécifiques
addNotificationCreators(notificationSchema);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

