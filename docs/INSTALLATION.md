# 📦 Guide d'Installation - Harvests Platform

Guide complet pour installer et configurer la plateforme Harvests.

## 📋 Prérequis

### Logiciels Requis

- **Node.js**: Version 16+ (recommandé: 18 LTS)
- **MongoDB**: Version 4.4+ (ou MongoDB Atlas)
- **Git**: Pour cloner le repository
- **npm** ou **yarn**: Gestionnaire de paquets

### Vérification

```bash
# Vérifier Node.js
node --version  # Doit être >= 16.0.0

# Vérifier npm
npm --version

# Vérifier MongoDB (si local)
mongod --version

# Vérifier Git
git --version
```

---

## 🚀 Installation Rapide

### Méthode Automatique

```bash
# 1. Cloner le repository
git clone https://github.com/ZooM982/HARVESTS.git
cd HARVESTS

# 2. Installation complète
npm run setup

# 3. Configuration
# Copier et configurer les fichiers .env (voir ci-dessous)

# 4. Démarrer
npm run dev
```

### Méthode Manuelle

```bash
# 1. Cloner le repository
git clone https://github.com/ZooM982/HARVESTS.git
cd HARVESTS

# 2. Installer dépendances backend
cd backend
npm install

# 3. Installer dépendances frontend
cd ../frontend
npm install

# 4. Retour à la racine
cd ..
```

---

## ⚙️ Configuration

### Backend Configuration

#### 1. Créer fichier `.env`

```bash
cd backend
cp env.example .env
```

#### 2. Configurer les variables

Éditer `backend/.env`:

```bash
# Environnement
NODE_ENV=development
PORT=8000
API_VERSION=1.0.0

# Base de données MongoDB
# Option 1: MongoDB Atlas (Production)
DATABASE=mongodb+srv://username:<PASSWORD>@cluster0.mongodb.net/harvests?retryWrites=true&w=majority
DATABASE_PASSWORD=your_mongodb_password

# Option 2: MongoDB Local (Développement)
DATABASE_LOCAL=mongodb://localhost:27017/harvests

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email (Choisir une option)
# Option 1: SendGrid (Recommandé pour production)
SENDGRID_API_KEY=SG.votre-cle-api-sendgrid
EMAIL_FROM=noreply@harvests.sn

# Option 2: Gmail (Développement)
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-app
EMAIL_FROM=noreply@harvests.sn

# Cloudinary (Upload images)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (Paiements)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayPal (Paiements)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENV=sandbox

# URLs
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:3001
```

### Frontend Configuration

#### 1. Créer fichier `.env`

```bash
cd frontend
cp env.example .env
```

#### 2. Configurer les variables

Éditer `frontend/.env`:

```bash
# API Backend
VITE_API_URL=http://localhost:8000/api/v1

# Application
VITE_APP_NAME=Harvests
VITE_APP_VERSION=1.0.0

# Services externes
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Configuration régionale
VITE_DEFAULT_COUNTRY=SN
VITE_DEFAULT_CURRENCY=XOF
VITE_DEFAULT_LANGUAGE=fr
```

---

## 🗄️ Configuration MongoDB

### Option 1: MongoDB Local

#### Installation

**Windows**:
```bash
# Télécharger depuis https://www.mongodb.com/try/download/community
# Installer et démarrer MongoDB Service
```

**macOS**:
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux**:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Configuration

```bash
# Dans backend/.env
DATABASE_LOCAL=mongodb://localhost:27017/harvests
```

### Option 2: MongoDB Atlas (Recommandé)

#### Créer un Cluster

1. Aller sur https://www.mongodb.com/cloud/atlas
2. Créer un compte gratuit
3. Créer un cluster (Free tier disponible)
4. Créer un utilisateur avec mot de passe
5. Whitelist votre IP (0.0.0.0/0 pour développement)

#### Obtenir la Connection String

```
mongodb+srv://username:<PASSWORD>@cluster0.xxxxx.mongodb.net/harvests?retryWrites=true&w=majority
```

#### Configuration

```bash
# Dans backend/.env
DATABASE=mongodb+srv://username:<PASSWORD>@cluster0.xxxxx.mongodb.net/harvests?retryWrites=true&w=majority
DATABASE_PASSWORD=your_password
```

---

## 📧 Configuration Email

### Option 1: SendGrid (Recommandé)

#### Créer un compte

1. Aller sur https://sendgrid.com
2. Créer un compte (100 emails/jour gratuit)
3. Créer une API Key
4. Vérifier l'expéditeur (Sender)

#### Configuration

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@harvests.sn
```

### Option 2: Gmail

#### Créer un App Password

1. Aller sur https://myaccount.google.com
2. Sécurité → Validation en 2 étapes (activer)
3. Mots de passe des applications → Créer
4. Copier le mot de passe généré

#### Configuration

```bash
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=noreply@harvests.sn
```

---

## ☁️ Configuration Cloudinary

### Créer un compte

1. Aller sur https://cloudinary.com
2. Créer un compte gratuit
3. Aller dans Dashboard
4. Copier les credentials

#### Configuration

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 💳 Configuration Paiements

### Stripe

1. Aller sur https://stripe.com
2. Créer un compte
3. Obtenir les clés API (Test mode)
4. Configurer webhooks (optionnel)

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### PayPal

1. Aller sur https://developer.paypal.com
2. Créer une application
3. Obtenir Client ID et Secret

```bash
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_ENV=sandbox
```

---

## 🚀 Démarrage

### Développement

```bash
# Depuis la racine du projet
npm run dev

# Ou séparément:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production

```bash
# Build frontend
cd frontend
npm run build

# Démarrer backend
cd backend
npm start
```

---

## ✅ Vérification

### Tester l'API

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Swagger UI
# Ouvrir http://localhost:8000/api/docs
```

### Tester le Frontend

```bash
# Ouvrir http://localhost:5173
# Vérifier que l'interface se charge
```

---

## 🐛 Dépannage

### Erreur MongoDB

```bash
# Vérifier que MongoDB est démarré
mongod --version

# Vérifier la connection string
# Tester la connexion
```

### Erreur Port déjà utilisé

```bash
# Changer le port dans .env
PORT=8001
```

### Erreur Email

```bash
# Vérifier les credentials
# Tester avec un email simple
# Vérifier les logs
```

### Erreur Cloudinary

```bash
# Vérifier les credentials
# Tester l'upload manuel
```

---

## 📚 Prochaines Étapes

1. ✅ Installation complète
2. ✅ Configuration terminée
3. 📖 Lire [Guide de Développement](./DEVELOPMENT.md)
4. 📖 Lire [Documentation API](./API_DOCUMENTATION.md)
5. 🚀 Commencer à développer

---

*Pour plus d'aide, consultez [Guide de Développement](./DEVELOPMENT.md) ou [Documentation API](./API_DOCUMENTATION.md)*

