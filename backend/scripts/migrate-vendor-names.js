/**
 * Script de migration : Déplacer firstName → farmName / restaurantName / companyName
 * pour tous les vendeurs créés avant la correction du formulaire d'inscription.
 *
 * Règle : si le champ métier (farmName/restaurantName/companyName) est vide ou
 * égal à "À compléter", et que firstName contient une vraie valeur (pas "À compléter"),
 * on copie firstName dans le bon champ métier.
 *
 * Usage : node scripts/migrate-vendor-names.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// ─── Connexion DB ─────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_LOCAL || process.env.DATABASE_PROD;
if (!MONGO_URI) {
  console.error('❌ MONGODB_URI introuvable dans .env');
  process.exit(1);
}

// ─── Logique de migration ──────────────────────────────────────────
const PLACEHOLDER = 'À compléter';

const isEmpty = (val) => !val || val.trim() === '' || val.trim() === PLACEHOLDER;

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté à MongoDB\n');

  const db = mongoose.connection.db;
  const users = db.collection('users');

  // Mapping userType → champ métier cible
  const migrations = [
    {
      userType: 'producer',
      targetField: 'farmName',
      label: 'Producteurs (farmName)',
    },
    {
      userType: 'restaurateur',
      targetField: 'restaurantName',
      label: 'Restaurateurs (restaurantName)',
    },
    {
      userType: 'transformer',
      targetField: 'companyName',
      label: 'Transformateurs (companyName)',
    },
    {
      userType: 'exporter',
      targetField: 'companyName',
      label: 'Exportateurs (companyName)',
    },
    {
      userType: 'transporter',
      targetField: 'companyName',
      label: 'Transporteurs (companyName)',
    },
  ];

  let totalUpdated = 0;

  for (const { userType, targetField, label } of migrations) {
    // Chercher les utilisateurs dont le champ métier est vide/placeholder
    // ET dont firstName contient une vraie valeur
    const candidates = await users.find({
      userType,
      $or: [
        { [targetField]: { $exists: false } },
        { [targetField]: null },
        { [targetField]: '' },
        { [targetField]: PLACEHOLDER },
      ],
      firstName: {
        $exists: true,
        $ne: null,
        $ne: '',
        $ne: PLACEHOLDER,
      },
    }).toArray();

    console.log(`📋 ${label} : ${candidates.length} compte(s) à migrer`);

    let count = 0;
    for (const user of candidates) {
      const newName = user.firstName?.trim();
      if (!newName || newName === PLACEHOLDER) continue;

      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            [targetField]: newName,
            firstName: PLACEHOLDER, // On vide firstName pour ce vendeur
          },
        }
      );

      console.log(`  ✔ [${userType}] ${user.email} → ${targetField} = "${newName}"`);
      count++;
    }

    console.log(`  → ${count} mis à jour\n`);
    totalUpdated += count;
  }

  console.log(`\n🎉 Migration terminée : ${totalUpdated} compte(s) mis à jour au total.`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Erreur de migration :', err.message);
  mongoose.disconnect();
  process.exit(1);
});
