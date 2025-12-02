// Export all admin transporter controllers
const adminTransporterSearchController = require('./adminTransporterSearchController');
const adminTransporterAssignmentController = require('./adminTransporterAssignmentController');

module.exports = {
  getAvailableTransporters: adminTransporterSearchController.getAvailableTransporters,
  assignTransporterToOrder: adminTransporterAssignmentController.assignTransporterToOrder
};

