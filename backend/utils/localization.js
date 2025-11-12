/**
 * Convertit une valeur potentiellement localisée ({ fr, en, ... }) en texte simple.
 * Priorise le français, puis l'anglais, puis la première chaîne disponible.
 */
function toPlainText(value, fallback = '') {
  if (!value) return fallback;

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
    const localesOrder = ['fr', 'en'];
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
}

module.exports = {
  toPlainText
};

