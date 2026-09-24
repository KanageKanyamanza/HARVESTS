// Jour 45 (bascule bilingue) : priorise la langue active de l'UI plutôt que
// toujours le français — sinon un visiteur anglophone verrait du contenu
// produit/plat français dès que `en` est disponible mais que `fr` l'est
// aussi. Lecture directe du singleton i18next (pas le hook useTranslation)
// pour que cette fonction reste utilisable telle quelle dans les ~25 fichiers
// qui l'appellent déjà, y compris hors composants React (config/vendor/*.jsx).
import i18n from './i18n';

export const toPlainText = (value, fallback = '', preferredLang = null) => {
  if (value === null || value === undefined) return fallback;

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    const found = value.find((item) => typeof item === 'string' && item.trim().length > 0);
    return found || fallback;
  }

  if (typeof value === 'object') {
    const currentLang = preferredLang || i18n.language || 'fr';
    const otherLang = currentLang === 'en' ? 'fr' : 'en';
    const localesOrder = [currentLang, otherLang];

    for (const locale of localesOrder) {
      const localized = value[locale];
      if (typeof localized === 'string' && localized.trim().length > 0) {
        return localized;
      }
    }

    const firstString = Object.values(value).find(
      (entry) => typeof entry === 'string' && entry.trim().length > 0
    );

    if (firstString) {
      return firstString;
    }
  }

  return fallback;
};

export const deriveShortDescription = (text, fallback = '') => {
  const plain = toPlainText(text, fallback);
  return plain ? plain.slice(0, 160) : '';
};

