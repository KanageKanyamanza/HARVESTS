const notificationSystemService = require('../../services/notification/notificationSystemService');

// Fonctions de notifications automatiques pour admins (exportées pour utilisation interne)
// Ces fonctions sont appelées depuis d'autres parties de l'application

exports.notifyProductPendingApproval = notificationSystemService.notifyProductPendingApproval;
exports.notifyUserReported = notificationSystemService.notifyUserReported;
exports.notifyHighValueOrder = notificationSystemService.notifyHighValueOrder;
exports.notifyPaymentIssue = notificationSystemService.notifyPaymentIssue;
exports.notifyDisputeCreated = notificationSystemService.notifyDisputeCreated;
exports.notifySecurityAlert = notificationSystemService.notifySecurityAlert;

