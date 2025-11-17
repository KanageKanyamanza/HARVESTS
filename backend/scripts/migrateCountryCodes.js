/**
 * Script de migration pour convertir les codes pays en noms complets
 * À exécuter au démarrage du serveur pour mettre à jour les comptes existants
 */

const mongoose = require('mongoose');
const { getCountryName } = require('../utils/countryMapper');

// Modèles à mettre à jour
const User = require('../models/User');
const Producer = require('../models/Producer');
const Consumer = require('../models/Consumer');
const Transformer = require('../models/Transformer');
const Transporter = require('../models/Transporter');
const Exporter = require('../models/Exporter');
const Restaurateur = require('../models/Restaurateur');
const Order = require('../models/Order');
const Review = require('../models/Review');
const BlogVisit = require('../models/BlogVisit');

/**
 * Vérifie si une valeur est un code pays (2 lettres majuscules)
 */
function isCountryCode(value) {
  if (!value || typeof value !== 'string') return false;
  return value.length === 2 && /^[A-Z]{2}$/.test(value.trim());
}

/**
 * Migre le champ country d'un document
 */
async function migrateDocumentCountry(Model, modelName) {
  try {
    // Trouver tous les documents avec un code pays
    const documents = await Model.find({
      country: { $exists: true, $ne: null, $ne: '' }
    });

    let updated = 0;
    let skipped = 0;

    for (const doc of documents) {
      const currentCountry = doc.country;
      
      // Si c'est déjà un nom complet (plus de 2 caractères), ignorer
      if (!isCountryCode(currentCountry)) {
        skipped++;
        continue;
      }

      // Convertir le code en nom complet
      const countryName = getCountryName(currentCountry);
      
      // Si le nom est différent du code, mettre à jour
      if (countryName !== currentCountry) {
        await Model.updateOne(
          { _id: doc._id },
          { $set: { country: countryName } }
        );
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`✅ ${modelName}: ${updated} documents mis à jour, ${skipped} ignorés`);
    return { updated, skipped, total: documents.length };
  } catch (error) {
    console.error(`❌ Erreur lors de la migration de ${modelName}:`, error.message);
    return { updated: 0, skipped: 0, total: 0, error: error.message };
  }
}

/**
 * Migre les champs country dans les objets imbriqués (adresses, etc.)
 */
async function migrateNestedCountries() {
  try {
    // Migrer les adresses de livraison dans Consumer
    const consumers = await Consumer.find({
      'deliveryAddresses.country': { $exists: true }
    });

    let updatedAddresses = 0;
    for (const consumer of consumers) {
      let needsUpdate = false;
      const updatedAddresses = consumer.deliveryAddresses.map(addr => {
        if (addr.country && isCountryCode(addr.country)) {
          needsUpdate = true;
          return {
            ...addr.toObject(),
            country: getCountryName(addr.country)
          };
        }
        return addr;
      });

      if (needsUpdate) {
        await Consumer.updateOne(
          { _id: consumer._id },
          { $set: { deliveryAddresses: updatedAddresses } }
        );
        updatedAddresses++;
      }
    }

    // Migrer les adresses dans Order
    const orders = await Order.find({
      'delivery.deliveryAddress.country': { $exists: true }
    });

    let updatedOrders = 0;
    for (const order of orders) {
      const deliveryAddress = order.delivery?.deliveryAddress;
      if (deliveryAddress?.country && isCountryCode(deliveryAddress.country)) {
        await Order.updateOne(
          { _id: order._id },
          { $set: { 'delivery.deliveryAddress.country': getCountryName(deliveryAddress.country) } }
        );
        updatedOrders++;
      }
    }

    console.log(`✅ Adresses de livraison: ${updatedAddresses} consommateurs mis à jour`);
    console.log(`✅ Adresses de commandes: ${updatedOrders} commandes mises à jour`);
    
    return { updatedAddresses, updatedOrders };
  } catch (error) {
    console.error('❌ Erreur lors de la migration des pays imbriqués:', error.message);
    return { updatedAddresses: 0, updatedOrders: 0, error: error.message };
  }
}

/**
 * Fonction principale de migration
 */
async function migrateCountryCodes() {
  console.log('🔄 Démarrage de la migration des codes pays...');
  
  const results = {
    User: await migrateDocumentCountry(User, 'User'),
    Producer: await migrateDocumentCountry(Producer, 'Producer'),
    Consumer: await migrateDocumentCountry(Consumer, 'Consumer'),
    Transformer: await migrateDocumentCountry(Transformer, 'Transformer'),
    Transporter: await migrateDocumentCountry(Transporter, 'Transporter'),
    Exporter: await migrateDocumentCountry(Exporter, 'Exporter'),
    Restaurateur: await migrateDocumentCountry(Restaurateur, 'Restaurateur'),
    Order: await migrateDocumentCountry(Order, 'Order'),
    Review: await migrateDocumentCountry(Review, 'Review'),
    BlogVisit: await migrateDocumentCountry(BlogVisit, 'BlogVisit')
  };

  // Migrer les pays imbriqués
  const nestedResults = await migrateNestedCountries();
  results.nested = nestedResults;

  // Résumé
  const totalUpdated = Object.values(results)
    .filter(r => r && typeof r === 'object' && r.updated !== undefined)
    .reduce((sum, r) => sum + (r.updated || 0), 0);

  const totalSkipped = Object.values(results)
    .filter(r => r && typeof r === 'object' && r.skipped !== undefined)
    .reduce((sum, r) => sum + (r.skipped || 0), 0);

  console.log('\n📊 Résumé de la migration:');
  console.log(`   ✅ ${totalUpdated} documents mis à jour`);
  console.log(`   ⏭️  ${totalSkipped} documents ignorés (déjà en nom complet)`);
  console.log('✅ Migration des codes pays terminée\n');

  return results;
}

// Si exécuté directement
if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  
  dotenv.config({ path: './.env' });
  
  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );

  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('✅ Connexion à la base de données réussie');
      return migrateCountryCodes();
    })
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = migrateCountryCodes;

