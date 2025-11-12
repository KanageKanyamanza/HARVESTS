const Product = require('../models/Product');
const Order = require('../models/Order');
const Consumer = require('../models/Consumer');
const { toPlainText } = require('../utils/localization');

/**
 * Convertit une valeur potentiellement localisée en texte simple.
 * Utilise `toPlainText` mais accepte également les valeurs déjà string.
 */
const normalizeText = (value, fallback = '') => {
  const plain = toPlainText(value, fallback);
  return typeof plain === 'string' ? plain : fallback;
};

/**
 * Met à jour les champs textuels d'un produit vers des chaînes simples.
 */
const migrateProductDocument = (product) => {
  let changed = false;

  const newName = normalizeText(product.name, product.slug || product._id?.toString() || 'Produit');
  if (product.name !== newName) {
    product.name = newName;
    changed = true;
  }

  const newDescription = normalizeText(product.description, '');
  if (product.description !== newDescription) {
    product.description = newDescription;
    changed = true;
  }

  const newShortDescription = normalizeText(
    product.shortDescription,
    newDescription.slice(0, 160)
  );
  if (product.shortDescription !== newShortDescription) {
    product.shortDescription = newShortDescription;
    changed = true;
  }

  return changed;
};

/**
 * Met à jour les snapshots de commande vers des chaînes simples.
 */
const itemsEquivalent = (segmentItem, baseItem) => {
  if (!segmentItem || !baseItem) {
    return false;
  }

  const productMatches =
    segmentItem.product &&
    baseItem.product &&
    segmentItem.product.toString() === baseItem.product.toString();

  const sellerMatches =
    (!segmentItem.seller || !baseItem.seller) ||
    (segmentItem.seller.toString() === baseItem.seller.toString());

  const quantityMatches =
    Number(segmentItem.quantity) === Number(baseItem.quantity);

  const unitPriceMatches =
    Number(segmentItem.unitPrice) === Number(baseItem.unitPrice);

  const variantMatches =
    (!segmentItem.variant && !baseItem.variant) ||
    (segmentItem.variant && baseItem.variant && segmentItem.variant.toString() === baseItem.variant.toString());

  return productMatches && sellerMatches && quantityMatches && unitPriceMatches && variantMatches;
};

const migrateOrderDocument = (order) => {
  let changed = false;

  const normalizeItem = (item, baseItem) => {
    if (!item) {
      return false;
    }

    if (baseItem && baseItem._id && (!item._id || item._id.toString() !== baseItem._id.toString())) {
      item._id = baseItem._id;
      changed = true;
    }

    const currentStatus = item.status || 'pending';
    if (!item.status || item.status !== currentStatus) {
      item.status = currentStatus;
      changed = true;
    }

    if (!Array.isArray(item.statusHistory) || item.statusHistory.length === 0) {
      item.statusHistory = [{
        status: item.status,
        timestamp: new Date()
      }];
      changed = true;
    }

    const snapshot = item.productSnapshot || {};
    const originalName = snapshot.name ?? item.name;
    const originalDescription = snapshot.description ?? item.description;

    const newName = normalizeText(originalName, normalizeText(item.name, 'Produit'));
    const newDescription = normalizeText(originalDescription, '');

    if (!snapshot.name || snapshot.name !== newName) {
      item.productSnapshot = item.productSnapshot || {};
      item.productSnapshot.name = newName;
      changed = true;
    }

    if (!snapshot.description || snapshot.description !== newDescription) {
      item.productSnapshot = item.productSnapshot || {};
      item.productSnapshot.description = newDescription;
      changed = true;
    }
  };

(order.items || []).forEach((item) => normalizeItem(item));

  const baseItemsById = new Map();
  (order.items || []).forEach((item) => {
    if (item && item._id) {
      baseItemsById.set(item._id.toString(), item);
    }
  });

  (order.segments || []).forEach((segment) => {
    (segment.items || []).forEach((item) => {
      let baseItem = item && item._id ? baseItemsById.get(item._id.toString()) : null;
      if (!baseItem) {
        baseItem = (order.items || []).find((candidate) => itemsEquivalent(item, candidate));
      }
      normalizeItem(item, baseItem);
    });
  });

  if (changed) {
    order.markModified('items');
    order.markModified('segments');
  }

  return changed;
};

/**
 * Certains consommateurs anciennes versions stockaient les favoris avec des snapshots.
 * Cette migration assure que les noms sont bien en texte simple.
 */
const migrateFavorites = async () => {
  const cursor = Consumer.find({
    'favorites.productSnapshot.name.fr': { $exists: true }
  }).cursor();

  let updated = 0;
  for await (const consumer of cursor) {
    let changed = false;

    (consumer.favorites || []).forEach((favorite) => {
      if (!favorite.productSnapshot) {
        return;
      }
      const originalName = favorite.productSnapshot.name;
      const originalDescription = favorite.productSnapshot.description;

      const newName = normalizeText(originalName, 'Produit');
      const newDescription = normalizeText(originalDescription, '');

      if (favorite.productSnapshot.name !== newName) {
        favorite.productSnapshot.name = newName;
        changed = true;
      }

      if (favorite.productSnapshot.description !== newDescription) {
        favorite.productSnapshot.description = newDescription;
        changed = true;
      }
    });

    if (changed) {
      consumer.markModified('favorites');
      await consumer.save({ validateBeforeSave: false });
      updated += 1;
    }
  }

  if (updated > 0) {
    console.log(`✅ Migration favoris consommateurs : ${updated} documents mis à jour`);
  }
};

const migrateProducts = async () => {
  const cursor = Product.find({}).cursor();
  let updated = 0;

  for await (const product of cursor) {
    const changed = migrateProductDocument(product);
    if (changed) {
      await product.save({ validateBeforeSave: false });
      updated += 1;
    }
  }

  if (updated > 0) {
    console.log(`✅ Migration produits : ${updated} documents mis à jour`);
  } else {
    console.log('ℹ️  Migration produits : aucune mise à jour nécessaire');
  }
};

const migrateOrders = async () => {
  const cursor = Order.find({
    $or: [
      { 'items.productSnapshot.name.fr': { $exists: true } },
      { 'segments.items.productSnapshot.name.fr': { $exists: true } },
      { 'items.status': { $exists: false } },
      { 'segments.items.status': { $exists: false } },
      { 'items.statusHistory': { $exists: false } },
      { 'segments.items.statusHistory': { $exists: false } }
    ]
  }).cursor();

  let updated = 0;
  for await (const order of cursor) {
    const changed = migrateOrderDocument(order);
    if (changed) {
      await order.save({ validateBeforeSave: false });
      updated += 1;
    }
  }

  if (updated > 0) {
    console.log(`✅ Migration commandes : ${updated} documents mis à jour (snapshots)`);
  } else {
    console.log('ℹ️  Migration commandes : aucune mise à jour nécessaire');
  }
};

/**
 * Migration principale orchestrant la conversion de tous les champs localisés connus.
 */
const migrateLocalizedFields = async () => {
  console.log('🔄 Démarrage de la migration des champs localisés en texte simple...');

  await migrateProducts();
  await migrateOrders();
  await migrateFavorites();

  console.log('✅ Migration des champs localisés terminée');
};

module.exports = {
  migrateLocalizedFields
};

