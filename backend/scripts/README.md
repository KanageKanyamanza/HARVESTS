# 🔧 Scripts de Gestion des Administrateurs

Ce dossier contient les scripts pour gérer les administrateurs du système Harvests.

## 📁 Fichiers

- **`admin-manager.js`** - Script principal de gestion des administrateurs
- **`quick-admin-setup.js`** - Configuration rapide du premier super-admin
- **`package.json`** - Configuration des scripts

## 🚀 Démarrage Rapide

### 1. Configuration Initiale

```bash
# Créer le premier super-administrateur
npm run setup
# ou
node scripts/quick-admin-setup.js
```

### 2. Gestion des Administrateurs

```bash
# Ouvrir le gestionnaire interactif
npm run admin
# ou
node scripts/admin-manager.js

# Commandes directes
npm run create    # Créer un admin
npm run list      # Lister les admins
npm run stats     # Afficher les statistiques
```

## 🔐 Rôles Disponibles

### Super Admin
- **Accès complet** à toutes les fonctionnalités
- Peut créer, modifier et supprimer tous les administrateurs
- Accès à tous les paramètres système

### Admin
- **Gestion complète** des utilisateurs, produits et commandes
- Peut créer et modifier les modérateurs et support
- Accès aux analytics et rapports

### Moderator
- **Modération** des contenus et utilisateurs
- Peut approuver/rejeter les produits
- Gestion des commandes et support client

### Support
- **Support client** uniquement
- Lecture des données utilisateurs et commandes
- Accès limité aux fonctionnalités

## 🛠️ Utilisation du Gestionnaire

### Menu Interactif

```bash
node scripts/admin-manager.js
```

**Options disponibles:**
1. **Créer un administrateur** - Formulaire guidé
2. **Lister les administrateurs** - Vue d'ensemble
3. **Modifier un administrateur** - Mise à jour des données
4. **Supprimer un administrateur** - Suppression sécurisée
5. **Réinitialiser un mot de passe** - Reset sécurisé
6. **Afficher les statistiques** - Vue d'ensemble du système

### Commandes Directes

```bash
# Créer un admin (mode interactif)
node scripts/admin-manager.js create

# Lister tous les admins
node scripts/admin-manager.js list

# Afficher les statistiques
node scripts/admin-manager.js stats
```

## 🔒 Sécurité

### Critères de Mot de Passe
- **Minimum 8 caractères**
- **1 majuscule** (A-Z)
- **1 minuscule** (a-z)
- **1 chiffre** (0-9)
- **Caractères spéciaux autorisés**: @$!%*?&

### Protection des Comptes
- **Verrouillage automatique** après 5 tentatives échouées
- **Durée de verrouillage**: 2 heures
- **Vérification email** requise
- **Historique des connexions**

## 📊 Permissions par Rôle

### Super Admin
```
all
```

### Admin
```
users:read, users:write, users:delete
products:read, products:write, products:delete, products:approve
orders:read, orders:write, orders:delete, orders:manage
analytics:read, analytics:export
settings:read, settings:write
reports:read, reports:export
```

### Moderator
```
users:read, users:write
products:read, products:write, products:approve
orders:read, orders:write, orders:manage
analytics:read
reports:read
```

### Support
```
users:read
products:read
orders:read, orders:write
analytics:read
```

## 🏢 Départements

- **Technical** - Développement et maintenance
- **Support** - Support client
- **Marketing** - Marketing et communication
- **Finance** - Gestion financière
- **Operations** - Opérations quotidiennes

## ⚠️ Important

1. **Changez les mots de passe par défaut** après la première connexion
2. **Ne supprimez jamais le dernier super-admin**
3. **Sauvegardez régulièrement** la base de données
4. **Utilisez des mots de passe forts** et uniques

## 🆘 Dépannage

### Erreur de Connexion à la Base de Données
```bash
# Vérifier que MongoDB est démarré
# Vérifier la variable DATABASE_LOCAL dans .env
```

### Erreur de Permissions
```bash
# Vérifier que le fichier .env existe
# Vérifier les permissions de lecture/écriture
```

### Compte Verrouillé
```bash
# Attendre 2 heures ou utiliser le script de reset
node scripts/admin-manager.js
# Option 5: Réinitialiser un mot de passe
```

## 📞 Support

Pour toute question ou problème:
1. Vérifiez les logs d'erreur
2. Consultez la documentation
3. Contactez l'équipe technique
