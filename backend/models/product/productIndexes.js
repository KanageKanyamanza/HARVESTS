/**
 * Ajoute les index au schéma Product
 */
function addProductIndexes(productSchema) {
  // Index pour la recherche et performance
  // Jour 45 (bascule bilingue) : name/description sont devenus Mixed ({fr,en}
  // ou chaîne legacy) — un index text sur `name`/`description` directement
  // n'indexerait plus rien pour les documents migrés. On indexe les deux
  // sous-champs (name.fr/name.en n'existent que sur les documents migrés ;
  // les documents legacy restent indexés via searchUtils.js en attendant la
  // migration, voir scripts/migrateProductTranslations.js).
  productSchema.index({
    'name.fr': 'text',
    'name.en': 'text',
    'description.fr': 'text',
    'description.en': 'text',
    tags: 'text',
  });
  productSchema.index({ producer: 1, status: 1 });
  productSchema.index({ transformer: 1, status: 1 });
  productSchema.index({ restaurateur: 1, status: 1 });
  productSchema.index({ category: 1, subcategory: 1 });
  productSchema.index({ producer: 1, slug: 1 }, { unique: true, sparse: true });
  productSchema.index({ transformer: 1, slug: 1 }, { unique: true, sparse: true });
  productSchema.index({ restaurateur: 1, slug: 1 }, { unique: true, sparse: true });
  // Index pour originType et sourceDish (non-unique car plusieurs produits peuvent avoir originType: catalog et sourceDish: null)
  productSchema.index({ originType: 1, sourceDish: 1 });
  productSchema.index({ isFeatured: 1 });
  productSchema.index({ createdAt: -1 });
  productSchema.index({ price: 1 });

  // Index géospatial pour la recherche par localisation
  productSchema.index({ 'producer.address.coordinates': '2dsphere' });
}

module.exports = addProductIndexes;

