# 🌾 Harvests Backend API

Backend API sécurisé pour la plateforme e-commerce agricole Harvests, construite avec Node.js, Express et MongoDB.

## 🚀 Fonctionnalités

### 👥 Types d'Utilisateurs Supportés
- **Producteurs** - Agriculteurs qui cultivent et vendent leurs produits
- **Transformateurs** - Entreprises qui transforment les produits agricoles
- **Consommateurs** - Acheteurs individuels
- **Restaurateurs** - Professionnels de la restauration
- **Exportateurs** - Entreprises d'export international
- **Transporteurs** - Services de livraison et logistique

### 🔐 Sécurité de Niveau Enterprise
- Authentification JWT avec refresh tokens
- Vérification email obligatoire
- Limitation de taux (rate limiting) avancée
- Protection contre les attaques XSS, NoSQL injection
- Chiffrement des mots de passe avec bcrypt
- Headers de sécurité avec Helmet
- Validation stricte des données d'entrée
- Logging des activités suspectes

### 📧 Système d'Email Automatisé
- Emails de bienvenue personnalisés
- Vérification d'email avec tokens sécurisés
- Réinitialisation de mot de passe
- Notifications de commandes et livraisons
- Templates responsive en français

## 🛠️ Technologies Utilisées

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT + bcryptjs
- **Email**: Nodemailer + Pug templates
- **Upload de fichiers**: Multer + Cloudinary
- **Paiements**: Stripe + Mobile Money
- **Cache**: Redis
- **Logs**: Winston
- **Tests**: Jest + Supertest

## 📦 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/harvests/backend.git
cd harvests-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
```bash
cp env.example .env
# Éditer le fichier .env avec vos configurations
```

4. **Démarrer MongoDB**
```bash
# Local
mongod

# Ou utiliser MongoDB Atlas (recommandé)
```

5. **Lancer l'application**
```bash
# Développement
npm run dev

# Production
npm start
```

## 🔧 Configuration

### Variables d'Environnement Essentielles

```env
# Base de données
DATABASE=mongodb+srv://user:<PASSWORD>@cluster.mongodb.net/harvests
DATABASE_PASSWORD=votre_mot_de_passe_mongodb

# JWT
JWT_SECRET=votre-clé-secrète-jwt-très-longue-et-sécurisée
JWT_EXPIRES_IN=90d

# Email
# Option 1: Ethereal (auto-généré, gratuit illimité)
USE_ETHEREAL=true
EMAIL_FROM=noreply@harvests.local

# Option 2: Gmail (500 emails/jour gratuit)  
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-app

# Production Email (SendGrid)
SENDGRID_PASSWORD=votre_clé_api_sendgrid
EMAIL_FROM=noreply@harvests.cm
```

## 🌐 Structure de l'API

### Endpoints Principaux

```
POST   /api/v1/auth/signup              # Inscription
POST   /api/v1/auth/login               # Connexion
GET    /api/v1/auth/verify-email/:token # Vérification email
POST   /api/v1/auth/forgot-password     # Mot de passe oublié

GET    /api/v1/users/me                 # Profil utilisateur
PATCH  /api/v1/users/update-me          # Mise à jour profil

# Routes spécialisées par type d'utilisateur
/api/v1/producers/*                     # Routes producteurs
/api/v1/transformers/*                  # Routes transformateurs  
/api/v1/consumers/*                     # Routes consommateurs
/api/v1/restaurateurs/*                 # Routes restaurateurs
/api/v1/exporters/*                     # Routes exportateurs
/api/v1/transporters/*                  # Routes transporteurs
```

### Exemples d'Utilisation

**Inscription d'un producteur:**
```json
POST /api/v1/auth/signup
{
  "firstName": "Jean",
  "lastName": "Kouam",
  "email": "jean@example.com",
  "password": "motdepasse123",
  "phone": "+237612345678",
  "userType": "producer",
  "address": {
    "street": "123 Rue des Agriculteurs",
    "city": "Yaoundé",
    "region": "Centre",
    "country": "Cameroon"
  },
  "specificData": {
    "farmName": "Ferme Bio Kouam",
    "farmSize": { "value": 5, "unit": "hectares" },
    "farmingType": "organic"
  }
}
```

**Connexion:**
```json
POST /api/v1/auth/login
{
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

## 🔐 Sécurité

### Mesures de Sécurité Implémentées

1. **Authentification Multi-Niveaux**
   - Vérification email obligatoire
   - Approbation manuelle pour certains types d'utilisateurs
   - Système de suspension de comptes

2. **Protection contre les Attaques**
   - Rate limiting par IP et utilisateur
   - Validation stricte des entrées
   - Sanitization des données NoSQL
   - Protection XSS
   - Headers de sécurité

3. **Gestion des Sessions**
   - JWT avec expiration
   - Cookies sécurisés httpOnly
   - Logout sécurisé
   - Protection contre le vol de session

## 📊 Modèles de Données

### Utilisateur de Base
```javascript
{
  email: String,           // Unique, requis
  password: String,        // Hashé avec bcrypt
  userType: String,        // producer|transformer|consumer|etc.
  firstName: String,
  lastName: String,
  phone: String,
  address: Object,
  isEmailVerified: Boolean,
  isActive: Boolean,
  isApproved: Boolean,     // Pour certains types
  // ... autres champs communs
}
```

### Spécialisations par Type
Chaque type d'utilisateur hérite du modèle de base et ajoute ses propres champs spécialisés.

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage des tests
npm run test:coverage
```

## 📝 Scripts Disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement avec nodemon
npm run debug      # Démarrer avec le debugger
npm test           # Lancer les tests
npm run lint       # Vérifier le code avec ESLint
npm run lint:fix   # Corriger automatiquement les erreurs ESLint
npm run format     # Formatter le code avec Prettier
```

## 🚀 Déploiement

### Prérequis Production
- Node.js 16+
- MongoDB Atlas ou instance MongoDB
- Redis (pour le cache)
- Service d'email (SendGrid recommandé)
- Cloudinary (pour les images)

### Variables d'Environnement Production
```env
NODE_ENV=production
DATABASE=mongodb+srv://...
JWT_SECRET=...
SENDGRID_PASSWORD=...
CLOUDINARY_CLOUD_NAME=...
REDIS_URL=...
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou support technique:
- Email: dev@harvests.cm
- Documentation: https://docs.harvests.cm
- Issues: https://github.com/harvests/backend/issues

---

**Développé avec ❤️ pour l'agriculture africaine par l'équipe Harvests**
