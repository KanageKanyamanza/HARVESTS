const { localize, translate } = require('../utils/translate');

/**
 * Middleware pour ajouter les fonctions de traduction aux réponses.
 * Un message peut être une clé (« auth.login_success ») ou une phrase déjà
 * rédigée : seule une clé existante est traduite (voir utils/translate.js).
 */
const i18nResponse = (req, res, next) => {
  const language = req.language || 'fr';
  const t = (key, params = {}) => translate(key, language, params) ?? key;

  // Fonction de traduction accessible depuis la requête comme depuis la réponse
  req.t = t;
  res.t = t;
  res.language = language;

  // Réponse de succès bilingue
  res.success = (message, data = {}, statusCode = 200, params = {}) => {
    return res.status(statusCode).json({
      status: 'success',
      message: localize(message, language, params),
      data,
      language
    });
  };

  // Réponse d'erreur bilingue
  res.error = (message, statusCode = 400, params = {}, extra = {}) => {
    return res.status(statusCode).json({
      status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
      message: localize(message, language, params),
      ...extra,
      language
    });
  };

  next();
};

module.exports = i18nResponse;
