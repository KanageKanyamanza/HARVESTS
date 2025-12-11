const express = require('express');
const seoController = require('../controllers/seoController');

const router = express.Router();

// Routes SEO
router.get('/sitemap.xml', seoController.generateSitemap);
router.get('/robots.txt', seoController.generateRobots);

module.exports = router;

