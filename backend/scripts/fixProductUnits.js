const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function fixProductUnits() {
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_PROD;
  console.log('Connexion à la base de données:', dbUrl?.substring(0, 35) + '...');
  
  await mongoose.connect(dbUrl);
  console.log('Connecté à MongoDB Atlas avec succès.');

  const products = await Product.find({});
  console.log(`Trouvé ${products.length} produits à vérifier/mettre à jour.`);

  let updatedCount = 0;

  for (const product of products) {
    let newUnit = product.unit;

    // Traduction/Normalisation des unités anglaises ou vagues
    if (!newUnit || newUnit === 'unit' || newUnit === 'unité' || newUnit === 'unité(s)') {
      const name = (product.name || '').toLowerCase();
      const cat = (product.category || '').toLowerCase();

      if (name.includes('sac') || name.includes('25kg') || name.includes('50kg')) {
        newUnit = 'sac';
      } else if (name.includes('carton') || name.includes('caisse')) {
        newUnit = 'carton';
      } else if (name.includes('sachet') || name.includes('g') || name.includes('500g')) {
        newUnit = 'sachet';
      } else if (name.includes('bouteille') || name.includes('litre') || name.includes('jus')) {
        newUnit = 'L';
      } else if (name.includes('botte') || name.includes('bouquet')) {
        newUnit = 'botte';
      } else if (cat === 'vegetables' || cat === 'fruits' || cat === 'tubers' || cat === 'meat' || cat === 'fish') {
        newUnit = 'kg';
      } else if (cat === 'cereals' || cat === 'legumes') {
        newUnit = 'sac';
      } else if (cat === 'poultry') {
        newUnit = 'pièce';
      } else {
        newUnit = 'unité';
      }
    } else if (newUnit === 'bunch') {
      newUnit = 'botte';
    } else if (newUnit === 'bag') {
      newUnit = 'sac';
    } else if (newUnit === 'box') {
      newUnit = 'carton';
    } else if (newUnit === 'tonnes' || newUnit === 'tons') {
      newUnit = 'tonne';
    }

    if (newUnit !== product.unit) {
      console.log(`Produit "${product.name}" : ${product.unit || 'non défini'} -> ${newUnit}`);
      product.unit = newUnit;
      await product.save();
      updatedCount++;
    }
  }

  console.log(`Terminé ! ${updatedCount} produit(s) mis à jour dans MongoDB Atlas.`);
  await mongoose.disconnect();
}

fixProductUnits().catch((err) => {
  console.error('Erreur lors de la migration des unités:', err);
  mongoose.disconnect();
});
