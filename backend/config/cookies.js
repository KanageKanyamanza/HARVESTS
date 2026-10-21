/**
 * Politique des cookies de l'API.
 *
 * Jour 63 : le front (harvests-six.vercel.app) et l'API (harvests-bp63.onrender.com)
 * sont sur des sites différents. Un cookie posé en SameSite=Strict (ou Lax) n'est
 * jamais renvoyé par le navigateur sur une requête cross-site : l'API ne voit
 * alors plus le cookie du tout. C'est ce qui rendait les écritures impossibles
 * en production (le cookie CSRF n'arrivait jamais, d'où un 403 « Token CSRF
 * invalide » sur chaque POST/PUT/PATCH/DELETE) et ce qui faisait retomber la
 * détection de langue sur la langue du navigateur.
 *
 * Les cookies dont l'API a besoin sont donc posés en SameSite=None (+ Secure,
 * exigé par les navigateurs dès que SameSite=None) quand la requête arrive en
 * HTTPS. En développement, le front et l'API sont tous deux sur localhost :
 * SameSite=Lax suffit ('none' imposerait HTTPS).
 *
 * 'none' ne dégrade pas la protection CSRF : le contrôle reste une double
 * soumission (le cookie prouve que le client a reçu le jeton, l'en-tête prouve
 * qu'il le connaît). Un site tiers peut déclencher une requête avec le cookie,
 * mais il ne peut ni lire le jeton (il est sur le domaine de l'API) ni poser
 * l'en-tête x-csrf-token (il déclencherait un préflight CORS refusé).
 */
const isProduction = () => process.env.NODE_ENV === "production";

/** La requête arrive-t-elle en HTTPS (directement ou via un proxy TLS) ? */
const isSecureRequest = (req) =>
  Boolean(req) &&
  (req.secure === true || req.headers?.["x-forwarded-proto"] === "https");

/**
 * Attributs des cookies que l'API doit recevoir en cross-site.
 * @param {import('express').Request} req
 * @param {object} options attributs propres au cookie (httpOnly, path, maxAge…)
 */
const apiCookieOptions = (req, options = {}) => {
  const secure = isSecureRequest(req) || isProduction();
  return {
    secure,
    sameSite: secure ? "none" : "lax",
    ...options,
  };
};

module.exports = {
  isProduction,
  isSecureRequest,
  apiCookieOptions,
};
