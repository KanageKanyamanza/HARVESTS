// Export all user services
const userProfileService = require('./userProfileService');
const userAdminService = require('./userAdminService');
const userSettingsService = require('./userSettingsService');

module.exports = {
  ...userProfileService,
  ...userAdminService,
  ...userSettingsService
};

