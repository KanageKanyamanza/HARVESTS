const { getTranslations } = require('../config/i18n');

/**
 * Middleware pour ajouter les fonctions de traduction aux réponses
 */
const i18nResponse = (req, res, next) => {
  // Obtenir les traductions pour la langue de la requête
  const { t } = getTranslations(req.language);
  
  // Ajouter la fonction de traduction à la réponse
  res.t = t;
  res.language = req.language;
  
  // Fonction utilitaire pour réponse de succès bilingue
  res.success = (message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message: typeof message === 'string' ? message : t(message),
      data,
      language: req.language
    });
  };
  
  // Fonction utilitaire pour réponse d'erreur bilingue
  res.error = (message, statusCode = 400) => {
    return res.status(statusCode).json({
      status: 'error',
      message: typeof message === 'string' ? message : t(message),
      language: req.language
    });
  };
  
  next();
};

module.exports = i18nResponse;
