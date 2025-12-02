// Export all product services
const productPublicService = require('./productPublicService');
const productProducerService = require('./productProducerService');
const productAdminService = require('./productAdminService');

module.exports = {
  ...productPublicService,
  ...productProducerService,
  ...productAdminService
};

