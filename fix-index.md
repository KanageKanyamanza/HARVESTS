# Instructions pour corriger l'index MongoDB

## Problème
L'index unique sur `originType` et `sourceDish` cause une erreur car plusieurs produits ont `originType: "catalog"` et `sourceDish: null`.

## Solution
1. Connectez-vous à MongoDB (via MongoDB Shell ou Compass)
2. Exécutez cette commande :

```javascript
db.products.dropIndex('originType_1_sourceDish_1')
```

3. Le nouvel index sera créé automatiquement au prochain démarrage du serveur (sans contrainte unique)

## Alternative : Script Node.js
Si vous préférez utiliser un script Node.js, exécutez depuis le répertoire racine du projet :

```bash
cd backend
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(async () => { const db = mongoose.connection.db; const collection = db.collection('products'); try { await collection.dropIndex('originType_1_sourceDish_1'); console.log('✅ Index supprimé'); } catch(e) { if(e.codeName !== 'IndexNotFound') throw e; console.log('ℹ️ Index déjà supprimé'); } await mongoose.connection.close(); }).catch(err => { console.error('❌ Erreur:', err); process.exit(1); });"
```

Après cela, redémarrez le serveur backend pour que le nouvel index soit créé.

