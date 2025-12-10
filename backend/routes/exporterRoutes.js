const express = require('express');
const exporterController = require('../controllers/exporterController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

/**
 * @swagger
 * tags:
 *   name: Exporters
 *   description: 🚢 Gestion des exportateurs
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/exporters:
 *   get:
 *     summary: Obtenir tous les exportateurs (public)
 *     tags: [Exporters]
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des exportateurs
 */
router.get('/', exporterController.getAllExporters);

/**
 * @swagger
 * /api/v1/exporters/search:
 *   get:
 *     summary: Rechercher des exportateurs
 *     tags: [Exporters]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Résultats de recherche
 */
router.get('/search', exporterController.searchExporters);

/**
 * @swagger
 * /api/v1/exporters/by-market/{country}:
 *   get:
 *     summary: Obtenir les exportateurs par marché cible
 *     tags: [Exporters]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des exportateurs pour ce marché
 */
router.get('/by-market/:country', exporterController.getExportersByMarket);

/**
 * @swagger
 * /api/v1/exporters/by-product/{product}:
 *   get:
 *     summary: Obtenir les exportateurs par produit
 *     tags: [Exporters]
 *     parameters:
 *       - in: path
 *         name: product
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des exportateurs pour ce produit
 */
router.get('/by-product/:product', exporterController.getExportersByProduct);

/**
 * @swagger
 * /api/v1/exporters/{id}:
 *   get:
 *     summary: Obtenir un exportateur spécifique (public)
 *     tags: [Exporters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Détails de l'exportateur
 */
router.get('/:id', exporterController.getExporter);

// Toutes les routes suivantes nécessitent une authentification
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('exporter'));
router.use(authMiddleware.requireVerification);
router.use(authMiddleware.requireApproval); // Les exportateurs doivent être approuvés

/**
 * @swagger
 * /api/v1/exporters/me/profile:
 *   get:
 *     summary: Obtenir mon profil exportateur
 *     tags: [Exporters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil exportateur
 *   patch:
 *     summary: Mettre à jour mon profil exportateur
 *     tags: [Exporters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.get('/me/profile', exporterController.getMyProfile);
router.patch('/me/profile', exporterController.updateMyProfile);

// Gestion des licences d'exportation
router.route('/me/export-licenses')
  .get(exporterController.getExportLicenses)
  .post(
    uploadLimiter,
    exporterController.uploadLicenseDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    exporterController.addExportLicense
  );

router.route('/me/export-licenses/:licenseId')
  .patch(exporterController.updateExportLicense)
  .delete(exporterController.removeExportLicense);

// Gestion des marchés cibles
router.route('/me/target-markets')
  .get(exporterController.getTargetMarkets)
  .post(exporterController.addTargetMarket);

router.route('/me/target-markets/:marketId')
  .patch(exporterController.updateTargetMarket)
  .delete(exporterController.removeTargetMarket);

// Gestion des produits d'exportation
router.route('/me/export-products')
  .get(exporterController.getExportProducts)
  .post(exporterController.addExportProduct);

router.route('/me/export-products/:productId')
  .patch(exporterController.updateExportProduct)
  .delete(exporterController.removeExportProduct);

// Gestion des certifications internationales
router.route('/me/international-certifications')
  .get(exporterController.getInternationalCertifications)
  .post(
    uploadLimiter,
    exporterController.uploadCertificationDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    exporterController.addInternationalCertification
  );

router.route('/me/international-certifications/:certId')
  .patch(exporterController.updateInternationalCertification)
  .delete(exporterController.removeInternationalCertification);

// Gestion de la flotte d'export
router.route('/me/fleet')
  .get(exporterController.getMyFleet)
  .post(exporterController.addVehicle);

router.route('/me/fleet/:vehicleId')
  .patch(exporterController.updateVehicle)
  .delete(exporterController.removeVehicle);

router.patch('/me/fleet/:vehicleId/availability', exporterController.updateVehicleAvailability);

// Gestion des capacités logistiques
router.route('/me/logistics-capabilities')
  .get(exporterController.getLogisticsCapabilities)
  .patch(exporterController.updateLogisticsCapabilities);

// Gestion des partenaires de transport
router.route('/me/shipping-partners')
  .get(exporterController.getShippingPartners)
  .post(exporterController.addShippingPartner);

router.route('/me/shipping-partners/:partnerId')
  .patch(exporterController.updateShippingPartner)
  .delete(exporterController.removeShippingPartner);

// Gestion des conditions commerciales
router.route('/me/trading-terms')
  .get(exporterController.getTradingTerms)
  .patch(exporterController.updateTradingTerms);

// Gestion des fournisseurs locaux
router.route('/me/local-suppliers')
  .get(exporterController.getLocalSuppliers)
  .post(exporterController.addLocalSupplier);

router.route('/me/local-suppliers/:supplierId')
  .patch(exporterController.updateLocalSupplier)
  .delete(exporterController.removeLocalSupplier);

// Gestion des comptes bancaires
router.route('/me/bank-accounts')
  .get(exporterController.getBankAccounts)
  .post(exporterController.addBankAccount);

router.route('/me/bank-accounts/:accountId')
  .patch(exporterController.updateBankAccount)
  .delete(exporterController.removeBankAccount);

// Gestion des polices d'assurance
router.route('/me/insurance-policies')
  .get(exporterController.getInsurancePolicies)
  .post(
    uploadLimiter,
    exporterController.uploadInsuranceDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    exporterController.addInsurancePolicy
  );

router.route('/me/insurance-policies/:policyId')
  .patch(exporterController.updateInsurancePolicy)
  .delete(exporterController.removeInsurancePolicy);

// Gestion de l'équipe
router.route('/me/team')
  .get(exporterController.getTeam)
  .post(exporterController.addTeamMember);

router.route('/me/team/:memberId')
  .patch(exporterController.updateTeamMember)
  .delete(exporterController.removeTeamMember);

// Gestion des commandes d'export
router.route('/me/export-orders')
  .get(exporterController.getMyExportOrders)
  .post(exporterController.createExportOrder);

router.route('/me/export-orders/:orderId')
  .get(exporterController.getMyExportOrder)
  .patch(exporterController.updateExportOrder)
  .delete(exporterController.cancelExportOrder);

// Suivi des expéditions
router.get('/me/export-orders/:orderId/tracking', exporterController.trackExportOrder);
router.patch('/me/export-orders/:orderId/status', exporterController.updateExportOrderStatus);

// Gestion des documents d'exportation
router.route('/me/export-orders/:orderId/documents')
  .get(exporterController.getExportDocuments)
  .post(
    uploadLimiter,
    exporterController.uploadExportDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    exporterController.addExportDocument
  );

// Gestion des lettres de crédit
router.route('/me/letters-of-credit')
  .get(exporterController.getLettersOfCredit)
  .post(exporterController.createLetterOfCredit);

router.route('/me/letters-of-credit/:lcId')
  .get(exporterController.getLetterOfCredit)
  .patch(exporterController.updateLetterOfCredit);

// Statistiques et analytics d'export
router.get('/me/stats', exporterController.getStats); // Route générique
router.get('/me/export-stats', exporterController.getExportStats); // Route spécifique
router.get('/me/export-analytics', exporterController.getExportAnalytics);
router.get('/me/market-performance', exporterController.getMarketPerformance);
router.get('/me/revenue-analytics', exporterController.getRevenueAnalytics);

// Rapports réglementaires
router.get('/me/regulatory-reports', exporterController.getRegulatoryReports);
router.post('/me/regulatory-reports', exporterController.generateRegulatoryReport);

// Gestion des devis et contrats internationaux
router.route('/me/international-quotes')
  .get(exporterController.getInternationalQuotes)
  .post(exporterController.createInternationalQuote);

router.route('/me/international-quotes/:quoteId')
  .get(exporterController.getInternationalQuote)
  .patch(exporterController.updateInternationalQuote)
  .delete(exporterController.deleteInternationalQuote);

// Conversion de devis en commandes
router.post('/me/international-quotes/:quoteId/convert', exporterController.convertQuoteToOrder);

// Gestion des taux de change et hedging
router.get('/me/exchange-rates', exporterController.getExchangeRates);
router.route('/me/hedging-positions')
  .get(exporterController.getHedgingPositions)
  .post(exporterController.createHedgingPosition);

// Documents légaux et conformité
router.route('/me/documents')
  .get(exporterController.getMyDocuments)
  .post(
    uploadLimiter,
    exporterController.uploadDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    exporterController.addDocument
  );

// Notifications et alertes
router.route('/me/notifications')
  .get(exporterController.getNotifications)
  .patch(exporterController.markNotificationsAsRead);

// Alertes réglementaires et de marché
router.route('/me/market-alerts')
  .get(exporterController.getMarketAlerts)
  .post(exporterController.createMarketAlert);

module.exports = router;
