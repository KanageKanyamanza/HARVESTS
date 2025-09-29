# 🔧 Guide d'Administration - Harvests Marketplace

## 🎯 Vue d'ensemble

Le système d'administration de Harvests a été complètement refondu pour offrir une gestion complète et sécurisée de votre marketplace agricole.

## 🚀 Démarrage Rapide

### 1. Configuration Initiale
```bash
cd backend
npm run admin:setup
```

### 2. Démarrage du Système
```bash
npm run admin:start
```

### 3. Gestion des Administrateurs
```bash
npm run admin:manage
```

## 🔐 Comptes Administrateurs

### Super Admin (Créé automatiquement)
- **Email**: admin@harvests.com
- **Mot de passe**: Admin@harvests123!
- **Rôle**: Super-administrateur
- **Permissions**: Accès complet

### Rôles Disponibles

#### 1. Super Admin
- **Accès complet** à toutes les fonctionnalités
- Peut créer, modifier et supprimer tous les administrateurs
- Accès à tous les paramètres système
- Gestion des permissions

#### 2. Admin
- **Gestion complète** des utilisateurs, produits et commandes
- Peut créer et modifier les modérateurs et support
- Accès aux analytics et rapports
- Gestion des avis et messages

#### 3. Moderator
- **Modération** des contenus et utilisateurs
- Peut approuver/rejeter les produits
- Gestion des commandes et support client
- Accès aux analytics de base

#### 4. Support
- **Support client** uniquement
- Lecture des données utilisateurs et commandes
- Gestion des messages de support
- Accès limité aux fonctionnalités

## 🏢 Départements

- **Technical** - Développement et maintenance
- **Support** - Support client
- **Marketing** - Marketing et communication
- **Finance** - Gestion financière
- **Operations** - Opérations quotidiennes

## 🎛️ Interface d'Administration

### Dashboard Principal
- **Statistiques en temps réel** de la marketplace
- **Répartition des utilisateurs** (Producteurs, Consommateurs, Transporteurs)
- **Actions rapides** pour les tâches courantes
- **Graphiques** d'évolution des ventes
- **Commandes récentes** à suivre

### Gestion des Administrateurs
- **Création** de nouveaux comptes administrateurs
- **Modification** des rôles et permissions
- **Activation/Désactivation** des comptes
- **Réinitialisation** des mots de passe
- **Statistiques** des administrateurs

### Modules de Gestion
- **Utilisateurs** - Gestion complète des utilisateurs
- **Produits** - Validation et modération des produits
- **Commandes** - Suivi et gestion des commandes
- **Avis** - Modération des avis clients
- **Messages** - Support client et communication
- **Analytiques** - Rapports et statistiques

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
- **Tokens JWT** sécurisés

## 📊 Permissions Détaillées

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

## 🛠️ Scripts Disponibles

### Configuration
- `npm run admin:setup` - Créer le premier super-admin
- `npm run admin:start` - Démarrer avec vérifications

### Gestion
- `npm run admin:manage` - Gestionnaire interactif
- `node scripts/admin-manager.js create` - Créer un admin
- `node scripts/admin-manager.js list` - Lister les admins
- `node scripts/admin-manager.js stats` - Statistiques

## 🌐 URLs d'Accès

- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:5173
- **Interface Admin**: http://localhost:5173/admin
- **Documentation API**: http://localhost:8000/api-docs

## 📱 Interface Mobile

L'interface d'administration est entièrement responsive et s'adapte aux écrans mobiles et tablettes.

## 🔧 Dépannage

### Erreur de Connexion à la Base de Données
```bash
# Vérifier que MongoDB est démarré
# Vérifier la variable DATABASE_LOCAL dans .env
```

### Compte Verrouillé
```bash
# Attendre 2 heures ou utiliser le script de reset
npm run admin:manage
# Option 5: Réinitialiser un mot de passe
```

### Problème de Permissions
```bash
# Vérifier que le fichier .env existe
# Vérifier les permissions de lecture/écriture
```

## 📞 Support

Pour toute question ou problème:
1. Vérifiez les logs d'erreur
2. Consultez ce guide
3. Utilisez les scripts de diagnostic
4. Contactez l'équipe technique

## 🎉 Fonctionnalités Avancées

### Gestion des Rôles
- **Hiérarchie des rôles** avec permissions automatiques
- **Assignation de départements** pour l'organisation
- **Gestion des permissions** granulaires

### Analytics et Rapports
- **Statistiques en temps réel** de la marketplace
- **Rapports détaillés** par période
- **Export de données** en différents formats

### Interface Utilisateur
- **Design moderne** et intuitif
- **Navigation fluide** avec sidebar
- **Actions rapides** pour les tâches courantes
- **Notifications** en temps réel

---

**🎯 Votre marketplace agricole est maintenant prête à être gérée de manière professionnelle et sécurisée !**
