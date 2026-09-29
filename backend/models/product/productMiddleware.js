const slugify = require('slugify');
const { toPlainText } = require('../../utils/localization');
const { translateText } = require('../../utils/translateText');

// Jour 45 (bascule bilingue) : name/description/shortDescription passent de
// "toujours aplati en chaîne" à "objet {fr, en} avec traduction automatique
// de en si absent". BILINGUAL_FIELDS remplace l'ancien PLAINTEXT_FIELDS qui
// écrasait systématiquement tout objet {fr, en} en simple chaîne française —
// ce comportement empêchait justement ce que ce jour met en place.
const BILINGUAL_FIELDS = ['name', 'description', 'shortDescription'];

/**
 * Normalise une valeur de champ bilingue en { fr, en } sans écraser un `en`
 * déjà fourni. `fr` prend la chaîne d'origine si la valeur était déjà une
 * simple chaîne (documents/payloads historiques).
 */
const normalizeBilingualShape = (value) => {
  if (value === undefined || value === null || value === '') return value;
  if (typeof value === 'string') return { fr: value.trim() };
  if (typeof value === 'object') {
    const fr = typeof value.fr === 'string' ? value.fr.trim() : '';
    const en = typeof value.en === 'string' && value.en.trim() ? value.en.trim() : undefined;
    return en ? { fr, en } : { fr };
  }
  return value;
};

/**
 * Complète la langue manquante d'un champ bilingue par traduction automatique.
 *
 * - `en` absent : fr -> en. En cas d'échec, le champ reste { fr } seul (pas
 *   bloquant, `toPlainText` retombe sur fr côté lecture).
 * - `fr` absent (Jour 48 : vendeur qui saisit en anglais, interface en
 *   anglais) : en -> fr. `fr` étant obligatoire pour la validation, un échec
 *   du service recopie le texte anglais dans `fr` plutôt que de bloquer
 *   l'enregistrement.
 */
const fillAutoTranslation = async (shaped) => {
  if (!shaped || typeof shaped !== 'object') return shaped;

  if (shaped.fr && !shaped.en) {
    try {
      const { translatedText, ok } = await translateText(shaped.fr, 'fr', 'en');
      if (ok && translatedText) {
        return { ...shaped, en: translatedText };
      }
    } catch (error) {
      // Best-effort : on garde { fr } seul si la traduction échoue
    }
    return shaped;
  }

  if (shaped.en && !shaped.fr) {
    try {
      const { translatedText, ok } = await translateText(shaped.en, 'en', 'fr');
      if (ok && translatedText) {
        return { fr: translatedText, en: shaped.en };
      }
    } catch (error) {
      // repli ci-dessous
    }
    return { fr: shaped.en, en: shaped.en };
  }

  return shaped;
};

/**
 * Ajoute les middleware au schéma Product
 */
function addProductMiddleware(productSchema) {
  // Plus de flattening au chargement : un document déjà migré en {fr, en}
  // doit rester tel quel. Les documents legacy (chaîne simple) restent lus
  // tels quels aussi ; `toPlainText` (frontend/backend) gère les deux formes.

  // Champs bilingues normalisés et complétés AVANT la validation (Jour 48) :
  // le schéma exige `fr`, qu'un payload { en } seul n'a qu'après traduction.
  // save() déclenche validate(), donc ce hook couvre aussi les sauvegardes.
  productSchema.pre('validate', async function(next) {
    for (const field of BILINGUAL_FIELDS) {
      if (this[field] !== undefined && this[field] !== null && this.isModified(field)) {
        const shaped = normalizeBilingualShape(this[field]);
        this[field] = await fillAutoTranslation(shaped);
      }
    }
    next();
  });

  // Middleware pre-save
  productSchema.pre('save', async function(next) {
    // Générer le slug à partir du nom français
    if (this.isModified('name')) {
      const nameForSlug = toPlainText(this.name, 'product');
      let baseSlug = slugify(nameForSlug, {
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g 
      });
      
      // Gérer les slugs dupliqués en ajoutant un suffixe numérique
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        try {
          const query = { slug };

          const existingProduct = await this.constructor.findOne(query);
          if (!existingProduct || existingProduct._id.toString() === this._id.toString()) {
            break;
          }
          slug = `${baseSlug}-${counter}`;
          counter++;
        } catch (error) {
          // En cas d'erreur, utiliser le slug de base avec timestamp
          slug = `${baseSlug}-${Date.now()}`;
          break;
        }
      }
      
      this.slug = slug;
    }
    
    
    // Valider qu'il y a au moins une image principale
    if (this.images && this.images.length > 0) {
      const primaryImages = this.images.filter(img => img.isPrimary);
      if (primaryImages.length === 0) {
        this.images[0].isPrimary = true;
      } else if (primaryImages.length > 1) {
        // Garder seulement la première comme principale
        this.images.forEach((img, index) => {
          img.isPrimary = index === this.images.findIndex(i => i.isPrimary);
        });
      }
    }
    
    next();
  });

  const normalizeUpdatePayload = async (payload) => {
    if (!payload || typeof payload !== 'object') return;
    for (const field of BILINGUAL_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        const shaped = normalizeBilingualShape(payload[field]);
        payload[field] = await fillAutoTranslation(shaped);
      }
    }
  };

  productSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany', 'findByIdAndUpdate'], async function(next) {
    const update = this.getUpdate();
    if (update) {
      if (update.$set) {
        await normalizeUpdatePayload(update.$set);
      }
      await normalizeUpdatePayload(update);
    }
    next();
  });
}

module.exports = addProductMiddleware;

