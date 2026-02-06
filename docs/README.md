# 📚 Documentation Complète - Harvests Platform

Bienvenue dans la documentation complète de la plateforme **Harvests** - L'Amazon des produits agricoles africains.

## 📖 Table des Matières

### 🚀 Démarrage Rapide
- [Guide d'Installation](./INSTALLATION.md) - Installation et configuration complète
- [Guide de Développement](./DEVELOPMENT.md) - Guide pour les développeurs
- [Guide de Déploiement](./DEPLOYMENT.md) - Déploiement en production

### 📡 API Documentation
- [Documentation API Complète](./API_DOCUMENTATION.md) - Tous les endpoints détaillés
- [Guide Swagger](./SWAGGER_GUIDE.md) - Utilisation de Swagger UI
- [Spécification OpenAPI](./SWAGGER_GUIDE.md#spécification-openapi) - Format JSON/YAML

### 🏗️ Architecture
- [Architecture Détaillée](./ARCHITECTURE.md) - Structure complète de l'application
- [Modèles de Données](./MODELS.md) - Schémas et relations
- [Services Centralisés](./CENTRALIZED_SERVICES.md) - Services partagés

### 🔒 Sécurité
- [Documentation Sécurité](./SECURITY.md) - Mesures de sécurité implémentées
- [Authentification](./API_DOCUMENTATION.md#authentication) - Système JWT
- [Rate Limiting](./SECURITY.md#rate-limiting) - Protection DDoS

### 🔄 Migration & Guides
- [Guide de Migration des Profils](./PROFILE_MIGRATION_GUIDE.md) - Migration vers système universel
- [Résumé de Migration](./MIGRATION_SUMMARY.md) - État des migrations
- [Guide d'Implémentation](./IMPLEMENTATION_SUMMARY.md) - Services centralisés

## 🌐 Accès Rapide

### Documentation Interactive
- **Swagger UI**: http://localhost:5000/api/docs
- **OpenAPI JSON**: http://localhost:5000/api/docs.json

### Applications
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/v1/health

## 📋 Vue d'Ensemble

### Qu'est-ce que Harvests ?

Harvests est une plateforme e-commerce moderne connectant producteurs et consommateurs à travers l'Afrique, avec support multilingue et paiements locaux.

### Fonctionnalités Principales

- ✅ **6 Types d'Utilisateurs**: Producteurs, Transformateurs, Consommateurs, Restaurateurs, Exportateurs, Transporteurs
- ✅ **E-commerce Complet**: Catalogue, commandes, paiements, livraisons
- ✅ **Recherche Intelligente**: Gestion pluriel/singulier + détection géographique
- ✅ **Paiements Multiples**: Stripe, PayPal, Wave Money, Orange Money
- ✅ **Chatbot Intégré**: Assistant virtuel pour recherche et support
- ✅ **Blog & Contenu**: Système de blog avec visiteurs
- ✅ **Notifications**: Email, push, in-app
- ✅ **API Bilingue**: Français et Anglais avec détection automatique

## 🛠️ Technologies

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Base de données**: MongoDB + Mongoose
- **Authentification**: JWT + bcryptjs
- **Email**: Nodemailer + SendGrid + Templates Pug
- **Upload**: Cloudinary
- **Documentation**: Swagger/OpenAPI 3.0

### Frontend
- **Framework**: React 19
- **Build**: Vite
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router Dom
- **État**: Context API
- **i18n**: React i18next

## 📊 Structure du Projet

```
HARVESTS/
├── backend/              # API Node.js + Express
│   ├── controllers/     # Logique métier
│   ├── models/          # Modèles Mongoose (14+ modèles)
│   ├── routes/          # Routes API (26 routes)
│   ├── services/        # Services métier
│   ├── middleware/      # Middlewares (sécurité, i18n)
│   ├── config/          # Configuration
│   └── docs/            # Documentation backend
├── frontend/            # Interface React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── services/    # Services API
│   │   └── hooks/       # Hooks personnalisés
│   └── public/
└── docs/                # Documentation complète (ce dossier)
```

## 🚀 Démarrage Rapide

### Installation Complète
```bash
# Cloner le repository
git clone https://github.com/ZooM982/HARVESTS.git
cd HARVESTS

# Installation
npm run setup

# Démarrer en développement
npm run dev
```

### Accès
- 🌐 **Frontend**: http://localhost:5173
- 📡 **Backend**: http://localhost:5000
- 📚 **Swagger**: http://localhost:5000/api/docs

## 📖 Documentation par Catégorie

### Pour les Développeurs
1. [Guide de Développement](./DEVELOPMENT.md) - Workflow, conventions, bonnes pratiques
2. [Architecture](./ARCHITECTURE.md) - Structure détaillée du code
3. [Modèles de Données](./MODELS.md) - Schémas MongoDB
4. [API Documentation](./API_DOCUMENTATION.md) - Tous les endpoints

### Pour les DevOps
1. [Guide de Déploiement](./DEPLOYMENT.md) - Production, CI/CD
2. [Installation](./INSTALLATION.md) - Configuration serveur
3. [Sécurité](./SECURITY.md) - Mesures de sécurité

### Pour les Utilisateurs API
1. [API Documentation](./API_DOCUMENTATION.md) - Référence complète
2. [Guide Swagger](./SWAGGER_GUIDE.md) - Utilisation interactive
3. [Exemples de Code](./API_DOCUMENTATION.md#exemples) - Snippets

## 🔍 Recherche dans la Documentation

### Par Fonctionnalité
- **Authentification**: [API Docs - Auth](./API_DOCUMENTATION.md#authentication)
- **Produits**: [API Docs - Products](./API_DOCUMENTATION.md#products)
- **Commandes**: [API Docs - Orders](./API_DOCUMENTATION.md#orders)
- **Paiements**: [API Docs - Payments](./API_DOCUMENTATION.md#payments)
- **Chatbot**: [API Docs - Chat](./API_DOCUMENTATION.md#chatbot)

### Par Type d'Utilisateur
- **Producteurs**: [API Docs - Producers](./API_DOCUMENTATION.md#producers)
- **Transformateurs**: [API Docs - Transformers](./API_DOCUMENTATION.md#transformers)
- **Consommateurs**: [API Docs - Consumers](./API_DOCUMENTATION.md#consumers)
- **Restaurateurs**: [API Docs - Restaurateurs](./API_DOCUMENTATION.md#restaurateurs)

## 📞 Support

- 📧 **Email**: contact@harvests.site
- 🐛 **Issues**: [GitHub Issues](https://github.com/ZooM982/HARVESTS/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ZooM982/HARVESTS/discussions)

## 📄 License

MIT License - Voir [LICENSE](../LICENSE)

---

**🌍 Harvests - Révolutionner l'agriculture africaine, un clic à la fois !**

*Made with ❤️ in Africa*

