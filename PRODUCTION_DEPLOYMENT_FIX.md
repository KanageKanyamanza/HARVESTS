# 🔧 Guide de Correction des Erreurs de Production

## 🚨 Problèmes Identifiés

### 1. Erreur MIME Type Frontend
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"
```

### 2. Erreur Connexion MongoDB Backend
```
❌ Erreur de connexion à la base de données: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

## ✅ Solutions Appliquées

### Frontend - Correction MIME Type

1. **Configuration Vercel mise à jour** (`frontend/vercel.json`)
   - Ajout des headers pour servir les fichiers JS avec le bon type MIME
   - Configuration des routes pour les assets

2. **Fichier HTML de production corrigé** (`frontend/dist/index.html`)
   - Métadonnées mises à jour (langue, titre, description)
   - Icône corrigée

### Backend - Correction Connexion MongoDB

1. **Script admin corrigé** (`backend/scripts/quick-admin-setup.js`)
   - Priorité aux variables d'environnement de production
   - Support de `DATABASE`, `DATABASE_URL`, et `DATABASE_LOCAL`
   - Configuration de connexion optimisée

2. **Serveur principal corrigé** (`backend/server.js`)
   - Même logique de connexion que le script admin
   - Configuration de timeout et pool de connexions

3. **Fichier d'exemple de production** (`backend/env.production.example`)
   - Template complet pour la configuration de production

## 🚀 Actions Requises pour le Déploiement

### 1. Variables d'Environnement Backend (Render/Railway/Heroku)

Configurez ces variables dans votre plateforme de déploiement :

```bash
# Base de données (OBLIGATOIRE)
DATABASE=mongodb+srv://harvests:<PASSWORD>@cluster.mongodb.net/harvests?retryWrites=true&w=majority
DATABASE_PASSWORD=votre_mot_de_passe_mongodb

# Ou utilisez DATABASE_URL directement
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/harvests?retryWrites=true&w=majority

# Environnement
NODE_ENV=production
PORT=8000

# JWT
JWT_SECRET=votre_jwt_secret_tres_long_et_securise

# Admin (pour création automatique)
ADMIN_EMAIL=admin@harvests.sn
ADMIN_PASSWORD=Admin@Harvests2025!
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=Harvests

# Autres variables selon vos besoins...
```

### 2. Redéploiement Frontend (Vercel)

1. **Commitez les changements** :
   ```bash
   git add frontend/vercel.json frontend/dist/index.html
   git commit -m "fix: Correction MIME type et métadonnées frontend"
   git push origin main
   ```

2. **Vercel redéploiera automatiquement** avec la nouvelle configuration

### 3. Redéploiement Backend

1. **Commitez les changements** :
   ```bash
   git add backend/server.js backend/scripts/quick-admin-setup.js backend/env.production.example
   git commit -m "fix: Correction connexion MongoDB et configuration production"
   git push origin main
   ```

2. **Votre plateforme redéploiera** avec les corrections

## 🔍 Vérification Post-Déploiement

### Frontend
- ✅ Les fichiers JS se chargent sans erreur MIME
- ✅ L'application se lance correctement
- ✅ Pas d'erreurs dans la console

### Backend
- ✅ Connexion MongoDB réussie
- ✅ Premier admin créé automatiquement
- ✅ API accessible sur le port 8000

## 📋 Checklist de Déploiement

- [ ] Variables d'environnement configurées sur la plateforme
- [ ] `DATABASE` ou `DATABASE_URL` défini correctement
- [ ] `NODE_ENV=production` défini
- [ ] Frontend redéployé sur Vercel
- [ ] Backend redéployé sur votre plateforme
- [ ] Test de connexion à l'API
- [ ] Test de création d'admin
- [ ] Vérification des logs de production

## 🆘 En Cas de Problème

### MongoDB ne se connecte toujours pas
1. Vérifiez que `DATABASE` ou `DATABASE_URL` est correct
2. Vérifiez que le mot de passe ne contient pas de caractères spéciaux non échappés
3. Vérifiez que l'IP de votre serveur est autorisée sur MongoDB Atlas

### Frontend ne se charge toujours pas
1. Vérifiez que Vercel a bien redéployé
2. Videz le cache du navigateur
3. Vérifiez les logs de déploiement Vercel

### Admin non créé
1. Vérifiez les logs du serveur
2. Exécutez manuellement : `node scripts/quick-admin-setup.js --auto-create`
3. Vérifiez que les variables `ADMIN_*` sont définies

## 📞 Support

Si les problèmes persistent, vérifiez :
1. Les logs de votre plateforme de déploiement
2. Les variables d'environnement
3. La connectivité réseau vers MongoDB
4. Les permissions de votre base de données
