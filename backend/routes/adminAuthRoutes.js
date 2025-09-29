const express = require('express');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

// Routes publiques
router.post('/login', adminAuthController.login);
router.post('/logout', adminAuthController.logout);

// Routes protégées (nécessitent une authentification)
router.use(adminAuthController.protect);

// Route pour obtenir les informations de l'admin connecté
router.get('/me', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      admin: req.admin
    }
  });
});

module.exports = router;
