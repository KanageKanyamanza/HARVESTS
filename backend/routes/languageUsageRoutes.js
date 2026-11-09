const express = require("express");
const { recordLanguageSwitch } = require("../controllers/languageUsageController");

/**
 * Jour 73 (lancement bilingue) : relevé des bascules fr/en.
 *
 * Une seule route, publique et en GET, appelée par le front au clic sur le
 * sélecteur de langue. Le suivi doit couvrir aussi les visiteurs non
 * connectés : l'enregistrement n'exige donc ni compte ni jeton, la
 * fiabilité du comptage repose sur la validation des paramètres côté
 * contrôleur, pas sur l'authentification.
 */
const router = express.Router();

// GET /api/v1/language-usage?from=fr&to=en&context=header&visitor=…
router.get("/", recordLanguageSwitch);

module.exports = router;
