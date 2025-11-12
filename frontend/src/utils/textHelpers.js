export const toPlainText = (value, fallback = '') => {
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
};

export const deriveShortDescription = (text, fallback = '') => {
  const plain = toPlainText(text, fallback);
  return plain ? plain.slice(0, 160) : '';
};

