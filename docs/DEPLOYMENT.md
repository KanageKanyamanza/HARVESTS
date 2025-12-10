# 🚀 Guide de Déploiement - Harvests Platform

Guide complet pour déployer Harvests en production.

## 📋 Prérequis

- Compte sur une plateforme de déploiement (Render, Heroku, AWS, etc.)
- MongoDB Atlas (ou autre MongoDB cloud)
- Comptes pour services externes (SendGrid, Cloudinary, Stripe)
- Domaine (optionnel mais recommandé)

---

## 🌐 Options de Déploiement

### Option 1: Render (Recommandé)

Render est une plateforme moderne avec support gratuit.

#### Backend sur Render

1. **Créer un compte** sur https://render.com
2. **Nouveau Web Service**
3. **Connecter GitHub** repository
4. **Configuration**:
   ```
   Name: harvests-backend
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```
5. **Variables d'environnement**: Ajouter toutes les variables de `.env`
6. **Déployer**

#### Frontend sur Vercel

1. **Créer un compte** sur https://vercel.com
2. **Import Project** depuis GitHub
3. **Configuration**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Variables d'environnement**: Ajouter `VITE_API_URL`
5. **Déployer**

### Option 2: Heroku

#### Backend

```bash
# Installer Heroku CLI
npm install -g heroku

# Login
heroku login

# Créer app
heroku create harvests-backend

# Ajouter MongoDB Atlas
heroku addons:create mongolab:sandbox

# Variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# ... autres variables

# Déployer
git push heroku main
```

#### Frontend

```bash
# Créer app
heroku create harvests-frontend

# Buildpacks
heroku buildpacks:set heroku/nodejs

# Déployer
git subtree push --prefix frontend heroku main
```

### Option 3: AWS

#### Backend (EC2)

1. **Lancer instance EC2**
2. **Installer Node.js et MongoDB**
3. **Cloner repository**
4. **Configurer PM2**:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name harvests-api
   pm2 save
   pm2 startup
   ```
5. **Configurer Nginx** comme reverse proxy

#### Frontend (S3 + CloudFront)

1. **Créer bucket S3**
2. **Upload build**:
   ```bash
   cd frontend
   npm run build
   aws s3 sync dist/ s3://harvests-frontend
   ```
3. **Configurer CloudFront** pour CDN
4. **Configurer Route53** pour domaine

---

## ⚙️ Configuration Production

### Variables d'Environnement Backend

```bash
# Environnement
NODE_ENV=production
PORT=8000

# MongoDB Atlas
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/harvests
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=production-secret-min-32-chars
JWT_EXPIRES_IN=90d

# Email (SendGrid recommandé)
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@harvests.sn

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paiements
STRIPE_SECRET_KEY=sk_live_xxxxx
PAYPAL_CLIENT_ID=live_xxxxx
PAYPAL_CLIENT_SECRET=live_xxxxx
PAYPAL_ENV=live

# URLs
FRONTEND_URL=https://www.harvests.site
ADMIN_URL=https://admin.harvests.site
```

### Variables d'Environnement Frontend

```bash
# API Backend
VITE_API_URL=https://api.harvests.sn/api/v1

# Services
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx

# Application
VITE_APP_NAME=Harvests
VITE_DEFAULT_COUNTRY=SN
VITE_DEFAULT_CURRENCY=XOF
```

---

## 🔒 Sécurité Production

### SSL/HTTPS

- **Obligatoire** en production
- Configurer certificat SSL (Let's Encrypt gratuit)
- Forcer HTTPS dans l'application

### Headers Sécurité

Déjà configurés via Helmet:
```javascript
// backend/app.js
app.use(helmet);
```

### Rate Limiting

Ajuster pour production:
```javascript
// Plus strict en production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50 // Réduire à 50 req/15min
});
```

### CORS

Configurer uniquement les domaines autorisés:
```javascript
const corsOptions = {
  origin: ['https://www.harvests.site', 'https://harvests.site'],
  credentials: true
};
```

---

## 📊 Monitoring

### Logs

#### Winston (Déjà configuré)

```javascript
// Logs automatiques dans backend/logs/
// Rotation quotidienne
```

#### Services Externes

- **Sentry**: Erreurs en production
- **LogRocket**: Session replay
- **New Relic**: Performance monitoring

### Health Checks

Endpoint déjà disponible:
```
GET /api/v1/health
```

Configurer monitoring:
- **Uptime Robot**: Vérification toutes les 5 min
- **Pingdom**: Monitoring avancé

---

## 🔄 CI/CD

### GitHub Actions

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: cd backend && npm test
      - name: Deploy to Render
        run: |
          # Déploiement automatique
```

### GitLab CI

Créer `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - deploy

test:
  stage: test
  script:
    - cd backend && npm test

deploy:
  stage: deploy
  script:
    - # Déploiement
```

---

## 🗄️ Base de Données

### MongoDB Atlas

#### Configuration

1. **Créer cluster** (M10 minimum pour production)
2. **Whitelist IPs**: 0.0.0.0/0 (ou IPs spécifiques)
3. **Créer utilisateur** avec permissions
4. **Activer backup** automatique
5. **Configurer monitoring**

#### Index

Vérifier que les index sont créés:
```javascript
// Index automatiques via Mongoose
// Vérifier dans MongoDB Atlas
```

#### Backup

- **Backup automatique**: Activé par défaut sur M10+
- **Backup manuel**: Exporter via `mongodump`

---

## 📧 Email Production

### SendGrid (Recommandé)

1. **Créer compte** SendGrid
2. **Vérifier domaine** (SPF, DKIM)
3. **Créer API Key**
4. **Configurer webhooks** (optionnel)

### Configuration

```bash
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@harvests.sn
```

---

## ☁️ Cloudinary Production

### Configuration

1. **Upgrade plan** si nécessaire
2. **Configurer transformations** automatiques
3. **Configurer CDN**
4. **Activer backup**

### Optimisations

```javascript
// Transformations automatiques
const imageUrl = cloudinary.url(publicId, {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'auto'
});
```

---

## 💳 Paiements Production

### Stripe

1. **Activer compte live**
2. **Remplacer clés test** par clés live
3. **Configurer webhooks**
4. **Tester en mode test** d'abord

### PayPal

1. **Activer compte business**
2. **Remplacer sandbox** par live
3. **Configurer webhooks**

---

## 🚀 Checklist Déploiement

### Pré-déploiement

- [ ] Tous les tests passent
- [ ] Variables d'environnement configurées
- [ ] MongoDB Atlas configuré
- [ ] SSL/HTTPS configuré
- [ ] Domaines configurés
- [ ] Services externes configurés (SendGrid, Cloudinary, etc.)

### Déploiement

- [ ] Backend déployé
- [ ] Frontend déployé
- [ ] Health check fonctionne
- [ ] Swagger UI accessible
- [ ] Base de données connectée

### Post-déploiement

- [ ] Tester authentification
- [ ] Tester création produit
- [ ] Tester commande
- [ ] Tester paiement (mode test)
- [ ] Vérifier logs
- [ ] Configurer monitoring
- [ ] Configurer backups

---

## 🔧 Maintenance

### Mises à jour

```bash
# Backend
cd backend
git pull
npm install
npm restart

# Frontend
cd frontend
git pull
npm install
npm run build
# Redéployer
```

### Logs

```bash
# Voir logs en temps réel
# Render: Dashboard → Logs
# Heroku: heroku logs --tail
# AWS: CloudWatch
```

### Backup

- **MongoDB**: Backup automatique (Atlas)
- **Images**: Cloudinary backup
- **Code**: GitHub (version control)

---

## 🐛 Dépannage Production

### Erreurs Communes

#### 500 Internal Server Error

1. Vérifier logs
2. Vérifier variables d'environnement
3. Vérifier connexion MongoDB
4. Vérifier services externes

#### CORS Errors

1. Vérifier configuration CORS
2. Vérifier domaines autorisés
3. Vérifier headers

#### Database Connection

1. Vérifier connection string
2. Vérifier whitelist IPs
3. Vérifier credentials

---

## 📈 Scaling

### Horizontal Scaling

- **Load Balancer**: Distribuer trafic
- **Multiple instances**: Backend sur plusieurs serveurs
- **CDN**: Frontend via CloudFront/Cloudflare

### Vertical Scaling

- **Upgrade serveur**: Plus de RAM/CPU
- **Upgrade MongoDB**: Cluster plus puissant
- **Optimiser code**: Cache, index, etc.

---

*Pour plus d'aide, consultez [Guide d'Installation](./INSTALLATION.md) ou [Documentation API](./API_DOCUMENTATION.md)*

