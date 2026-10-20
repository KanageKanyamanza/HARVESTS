/**
 * Classe d'erreur personnalisée pour l'application
 * Permet de créer des erreurs opérationnelles avec un code de statut HTTP.
 * `message` peut être une clé de traduction (« auth.wrong_credentials ») :
 * le gestionnaire d'erreurs la traduit dans la langue de la requête, avec
 * `params` pour les valeurs à insérer (Jour 58).
 */
class AppError extends Error {
  constructor(message, statusCode, params = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    if (params) this.params = params;
    Error.captureStackTrace(this, this.constructor);
  }

  // Relais d'une erreur levée par un service : une AppError garde son statut et
  // ses paramètres, une Error simple devient une AppError au statut indiqué
  static from(error, statusCode = 400) {
    if (error instanceof AppError) return error;

    // Erreur de validation Mongoose : conserver les détails par champ pour
    // que le gestionnaire d'erreurs puisse les traduire (Jour 62).
    if (error && error.name === 'ValidationError' && error.errors) {
      const validationError = new AppError('errors.validation_failed', 400);
      validationError.validationError = error;
      return validationError;
    }

    return new AppError(error.message, statusCode, error.params);
  }
}

module.exports = AppError;
