# 🔒 Documentation Sécurité - Harvests Platform

Documentation complète des mesures de sécurité implémentées dans Harvests.

## 🛡️ Vue d'Ensemble

Harvests implémente une sécurité multi-niveaux pour protéger l'application, les données et les utilisateurs.

---

## 🔐 Authentification

### JWT (JSON Web Tokens)

#### Configuration

```javascript
// JWT Secret: Minimum 32 caractères
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
```

#### Implémentation

- **Token dans Header**: `Authorization: Bearer <token>`
- **Token dans Cookie**: httpOnly cookie (automatique)
- **Expiration**: 90 jours
- **Refresh Token**: Supporté (optionnel)

#### Sécurité Token

- **Signature**: HMAC SHA256
- **Validation**: Vérification signature et expiration
- **Rotation**: Supportée (optionnel)

### Mots de Passe

#### Hashing

```javascript
// bcrypt avec 12 rounds
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(password, salt);
```

#### Exigences

- **Longueur minimale**: 8 caractères
- **Complexité**: Au moins une majuscule, une minuscule et un chiffre
- **Validation**: Regex automatique

#### Reset Password

- **Token sécurisé**: Crypto random bytes
- **Expiration**: 10 minutes
- **One-time use**: Token invalidé après utilisation

---

## 🚫 Rate Limiting

### Configuration Globale

```javascript
// 100 requêtes par 15 minutes par IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Trop de requêtes depuis cette IP'
});
```

### Rate Limiting par Route

#### Authentification

```javascript
// 5 tentatives par 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});
```

#### Upload

```javascript
// 10 uploads par heure
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10
});
```

### Headers de Réponse

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 🛡️ Protection contre les Attaques

### Helmet.js

Headers de sécurité HTTP automatiques:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "https://res.cloudinary.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### CORS (Cross-Origin Resource Sharing)

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      'http://localhost:5173',
      'https://www.harvests.site',
      'https://harvests.site'
    ];
    
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### NoSQL Injection Protection

```javascript
// Nettoyage automatique des requêtes
const mongoSanitize = require('express-mongo-sanitize');

app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized ${key} in request`);
  }
}));
```

### XSS (Cross-Site Scripting) Protection

```javascript
// Nettoyage des données
const xss = require('xss');

app.use(xss({
  whitelist: {
    // Tags autorisés
    p: [],
    strong: [],
    em: []
  }
}));
```

### HPP (HTTP Parameter Pollution)

```javascript
// Prévention de la pollution des paramètres
app.use(hpp({
  whitelist: ['category', 'price', 'sort']
}));
```

---

## 🔒 Validation des Données

### Input Validation

#### Express Validator

```javascript
const { body, validationResult } = require('express-validator');

router.post('/',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('phone').matches(/^[\+]?[0-9\s\-\(\)]{8,20}$/)
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ...
  }
);
```

#### Joi Validation

```javascript
const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
});
```

### Mongoose Validation

```javascript
// Validation au niveau du modèle
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format email invalide']
  }
});
```

---

## 🔐 Autorisation

### Middleware d'Authentification

```javascript
const protect = async (req, res, next) => {
  // 1. Récupérer token
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  // 2. Vérifier token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Récupérer utilisateur
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 401));
  }
  
  // 4. Vérifier si compte actif
  if (!user.isActive) {
    return next(new AppError('Compte désactivé', 401));
  }
  
  // 5. Attacher utilisateur à la requête
  req.user = user;
  next();
};
```

### Middleware d'Autorisation

```javascript
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Accès non autorisé', 403));
    }
    next();
  };
};

// Utilisation
router.delete('/:id', protect, restrictTo('admin'), deleteUser);
```

### Vérification de Propriété

```javascript
const checkOwnership = async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);
  
  if (resource.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Accès non autorisé', 403));
  }
  
  next();
};
```

---

## 🔒 Sécurité des Fichiers

### Upload Sécurisé

#### Validation des Types

```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = 5 * 1024 * 1024; // 5MB

const upload = multer({
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});
```

#### Cloudinary Configuration

```javascript
// Upload sécurisé vers Cloudinary
cloudinary.uploader.upload(file, {
  folder: 'harvests',
  resource_type: 'image',
  transformation: [
    { width: 800, height: 600, crop: 'fill' },
    { quality: 'auto' }
  ]
});
```

---

## 🔐 Sécurité Email

### Vérification Email

```javascript
// Token sécurisé
const emailToken = crypto.randomBytes(32).toString('hex');
const hashedToken = crypto.createHash('sha256').update(emailToken).digest('hex');

user.emailVerificationToken = hashedToken;
user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
```

### Protection contre le Spam

- **Rate limiting**: 3 emails/heure par utilisateur
- **Validation**: Vérification format email
- **Blacklist**: Emails bloqués

---

## 🔒 Sécurité Base de Données

### MongoDB Security

#### Connection String

```javascript
// Utilisation de credentials sécurisés
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true, // En production
  authSource: 'admin'
});
```

#### Index et Performance

```javascript
// Index pour sécurité et performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'passwordResetToken': 1 }, { expireAfterSeconds: 600 });
```

### Protection des Données Sensibles

```javascript
// Ne pas retourner le mot de passe
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.emailVerificationToken;
  return obj;
};
```

---

## 🔐 Sécurité Paiements

### Stripe

```javascript
// Vérification signature webhook
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
```

### Validation Montants

```javascript
// Vérifier que le montant correspond
if (payment.amount !== order.total) {
  throw new AppError('Montant incorrect', 400);
}
```

---

## 📊 Logging et Monitoring

### Winston Logging

```javascript
// Logs de sécurité
logger.warn('Tentative de connexion échouée', {
  email: req.body.email,
  ip: req.ip,
  userAgent: req.get('user-agent')
});

logger.error('Tentative d\'accès non autorisé', {
  userId: req.user?._id,
  route: req.path,
  ip: req.ip
});
```

### Audit Log

```javascript
// Enregistrer actions sensibles
await AuditLog.create({
  user: req.user._id,
  action: 'delete_product',
  resource: 'Product',
  resourceId: req.params.id,
  ip: req.ip,
  userAgent: req.get('user-agent')
});
```

---

## 🔒 Checklist Sécurité

### Développement

- [ ] Variables d'environnement sécurisées
- [ ] Secrets jamais commités
- [ ] Validation de tous les inputs
- [ ] Rate limiting configuré
- [ ] Headers de sécurité (Helmet)
- [ ] CORS configuré correctement

### Production

- [ ] HTTPS activé
- [ ] Certificat SSL valide
- [ ] Secrets en variables d'environnement
- [ ] Base de données sécurisée
- [ ] Monitoring activé
- [ ] Backups réguliers
- [ ] Logs de sécurité activés

---

## 🚨 Incident Response

### En cas d'Attaque

1. **Isoler**: Désactiver comptes compromis
2. **Analyser**: Examiner logs et métriques
3. **Corriger**: Appliquer correctifs
4. **Notifier**: Informer utilisateurs si nécessaire
5. **Documenter**: Enregistrer l'incident

### Contacts

- **Sécurité**: security@harvests.sn
- **Support**: support@harvests.sn

---

*Pour plus d'informations, consultez [Documentation API](./API_DOCUMENTATION.md) ou [Architecture](./ARCHITECTURE.md)*

