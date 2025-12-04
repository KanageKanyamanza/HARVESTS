/**
 * Wrapper pour capturer automatiquement les erreurs asynchrones
 * Évite d'avoir à utiliser try/catch dans chaque contrôleur
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
