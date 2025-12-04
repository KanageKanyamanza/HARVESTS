const slugify = require('slugify');
const { toPlainText } = require('../../utils/localization');

const PLAINTEXT_FIELDS = ['name', 'description', 'shortDescription'];

const normalizePlainText = (value, fallback = '') => {
  const normalized = toPlainText(value, fallback);
  return typeof normalized === 'string' ? normalized : fallback;
};

/**
 * Ajoute les middleware au schéma Product
 */
function addProductMiddleware(productSchema) {
  productSchema.pre('init', function(doc) {
    if (doc) {
      PLAINTEXT_FIELDS.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(doc, field)) {
          doc[field] = normalizePlainText(doc[field], doc[field] || '');
        }
      });
    }
  });

  // Middleware pre-save
  productSchema.pre('save', async function(next) {
    PLAINTEXT_FIELDS.forEach((field) => {
      if (this[field] !== undefined && this[field] !== null) {
        this[field] = normalizePlainText(this[field], this[field]);
      }
    });

    // Générer le slug à partir du nom français
    if (this.isModified('name')) {
      const nameForSlug = this.name || 'product';
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
          const slugQueries = [];
          if (this.producer) slugQueries.push({ producer: this.producer, slug });
          if (this.transformer) slugQueries.push({ transformer: this.transformer, slug });
          if (this.restaurateur) slugQueries.push({ restaurateur: this.restaurateur, slug });

          const query = slugQueries.length > 0 ? { $or: slugQueries } : { slug };

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

  const normalizeUpdatePayload = (payload) => {
    if (!payload || typeof payload !== 'object') return;
    PLAINTEXT_FIELDS.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        payload[field] = normalizePlainText(payload[field], payload[field]);
      }
    });
  };

  productSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany', 'findByIdAndUpdate'], function(next) {
    const update = this.getUpdate();
    if (update) {
      if (update.$set) {
        normalizeUpdatePayload(update.$set);
      }
      normalizeUpdatePayload(update);
    }
    next();
  });
}

module.exports = addProductMiddleware;

