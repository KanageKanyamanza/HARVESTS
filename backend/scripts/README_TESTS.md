# 🧪 Tests du Système de Souscriptions

Ce dossier contient les scripts de test pour le système de souscriptions.

## 📋 Scripts Disponibles

### 1. `testSubscriptions.js`
Tests unitaires du modèle Subscription et des méthodes de base.

**Commandes:**
```bash
npm run test:subscriptions
# ou
node scripts/testSubscriptions.js
```

**Tests effectués:**
- ✅ Création d'une souscription
- ✅ Activation d'un plan gratuit
- ✅ Obtention des plans disponibles
- ✅ Récupération des souscriptions d'un utilisateur
- ✅ Calcul des statistiques
- ✅ Mise à jour du statut
- ✅ Annulation d'une souscription

### 2. `testSubscriptionPayment.js`
Tests du processus de paiement et d'activation automatique.

**Commandes:**
```bash
npm run test:subscriptions:payment
# ou
node scripts/testSubscriptionPayment.js
```

**Tests effectués:**
- ✅ Création d'un paiement de souscription
- ✅ Activation automatique après paiement réussi
- ✅ Calcul des dates de fin (mensuel/annuel)
- ✅ Calcul de la prochaine date de facturation

### 3. `testSubscriptionAPI.js`
Tests des endpoints API (nécessite le serveur démarré).

**Commandes:**
```bash
npm run test:subscriptions:api
# ou
node scripts/testSubscriptionAPI.js
```

**Prérequis:**
- Le serveur backend doit être démarré (`npm run dev`)
- Variables d'environnement dans `.env`:
  - `TEST_USER_EMAIL`: Email d'un utilisateur de test
  - `TEST_USER_PASSWORD`: Mot de passe de l'utilisateur
  - `TEST_ADMIN_EMAIL`: Email d'un admin (optionnel)
  - `TEST_ADMIN_PASSWORD`: Mot de passe de l'admin (optionnel)
  - `API_BASE_URL`: URL de l'API (défaut: http://localhost:5000/api/v1)

**Tests effectués:**
- ✅ GET `/subscriptions/me` - Obtenir mes souscriptions
- ✅ POST `/subscriptions` - Créer une souscription
- ✅ POST `/subscriptions/activate-free` - Activer un plan gratuit
- ✅ GET `/subscriptions/:id` - Obtenir une souscription par ID
- ✅ PATCH `/subscriptions/:id/cancel` - Annuler une souscription
- ✅ GET `/subscriptions/stats/overview` - Statistiques (admin)
- ✅ GET `/subscriptions/admin` - Toutes les souscriptions (admin)
- ✅ PATCH `/subscriptions/admin/:id/status` - Mettre à jour le statut (admin)

## 🔧 Configuration

### Variables d'environnement requises

Pour les tests de base de données:
```env
MONGODB_URI=mongodb://localhost:27017/harvests
# ou
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/harvests
```

Pour les tests API:
```env
API_BASE_URL=http://localhost:5000/api/v1
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin123
```

## 📊 Résultats Attendus

### Test de création de souscription
```
✅ Souscription créée avec succès:
   ID: 507f1f77bcf86cd799439011
   Plan: Standard
   Période: monthly
   Montant: 3000 XAF
   Statut: pending
   Date de fin calculée: 2024-02-01T00:00:00.000Z
```

### Test de paiement et activation
```
✅ Souscription activée après paiement:
   Statut: active
   Paiement: completed
   Date début: 2024-01-01T00:00:00.000Z
   Date fin: 2025-01-01T00:00:00.000Z
   Prochaine facturation: 2025-01-01T00:00:00.000Z
```

## 🐛 Dépannage

### Erreur de connexion MongoDB
```
❌ Erreur de connexion MongoDB: connect ECONNREFUSED
```

**Solutions:**
1. Vérifier que MongoDB est démarré: `mongod` ou service MongoDB actif
2. Vérifier la variable `MONGODB_URI` dans `.env`
3. Vérifier les credentials si MongoDB Atlas

### Erreur API
```
❌ Erreur: connect ECONNREFUSED 127.0.0.1:5000
```

**Solutions:**
1. Démarrer le serveur backend: `npm run dev`
2. Vérifier le port dans `API_BASE_URL`
3. Vérifier les credentials de test dans `.env`

### Aucun utilisateur trouvé
```
⚠️  Aucun utilisateur producteur trouvé
```

**Solutions:**
1. Créer un utilisateur producteur dans la base de données
2. Utiliser un email existant dans les tests API

## 📝 Notes

- Les tests créent des données réelles dans la base de données
- Pour les tests de production, utiliser une base de données de test séparée
- Les tests API nécessitent une authentification valide
- Les tests peuvent être exécutés individuellement ou tous ensemble

## 🔄 Exécution de tous les tests

```bash
# Tests unitaires
npm run test:subscriptions

# Tests de paiement
npm run test:subscriptions:payment

# Tests API (nécessite serveur démarré)
npm run test:subscriptions:api
```

