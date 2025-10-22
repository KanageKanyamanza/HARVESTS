const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Schéma de base pour tous les utilisateurs
const baseUserSchema = new mongoose.Schema({
  // Informations de base communes
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Format d\'email invalide'
    }
  },
  
  password: {
    type: String,
    required: [true, 'Mot de passe requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false // N'inclut pas le mot de passe dans les requêtes par défaut
  },
  
  passwordChangedAt: {
    type: Date,
    select: false
  },
  
  userType: {
    type: String,
    required: [true, 'Type d\'utilisateur requis'],
    enum: ['producer', 'transformer', 'consumer', 'restaurateur', 'exporter', 'transporter'],
    immutable: true // Ne peut pas être modifié après création
  },
  
  // Rôle système (admin, user, etc.)
  role: {
    type: String,
    enum: ['user', 'admin', 'super-admin'],
    default: 'user'
  },
  
  // Informations de profil communes
  firstName: {
    type: String,
    required: [true, 'Prénom requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  
  lastName: {
    type: String,
    required: function() {
      // Requis seulement pour les consommateurs
      return this.userType === 'consumer';
    },
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    default: function() {
      // Valeur par défaut pour les non-consommateurs
      return this.userType !== 'consumer' ? 'À compléter' : undefined;
    }
  },
  
  phone: {
    type: String,
    required: [true, 'Numéro de téléphone requis'],
    validate: {
      validator: function(phone) {
        // Accepter tous les formats de téléphone internationaux
        if (!phone || typeof phone !== 'string') return false;
        
        // Nettoyer le numéro (garder seulement les chiffres)
        const cleaned = phone.replace(/\D/g, '');
        
        // Vérifier la longueur (7-15 chiffres selon les standards internationaux)
        return cleaned.length >= 7 && cleaned.length <= 15;
      },
      message: 'Format de téléphone invalide (7-15 chiffres requis)'
    },
    // Transformer le numéro avant sauvegarde
    set: function(phone) {
      if (!phone) return phone;
      // Garder le format original mais nettoyer pour la validation
      return phone;
    }
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  // Badge de profil (pour tous sauf consumer)
  badge: {
    type: String,
    enum: ['verified', 'premium', 'gold', 'platinum', 'diamond'],
    required: false
  },
  
  // Bannière de boutique (pour les profils vendeurs)
  shopBanner: {
    type: String,
    default: null
  },
  
  // Description de la boutique (pour les profils vendeurs)
  shopDescription: {
    type: String,
    maxlength: [500, 'La description de la boutique ne peut pas dépasser 500 caractères'],
    default: null
  },
  
  // Préférences linguistiques
  preferredLanguage: {
    type: String,
    enum: ['fr', 'en'],
    default: 'fr'
  },
  
  country: {
    type: String,
    required: [true, 'Pays requis'],
    trim: true,
    maxlength: [100, 'Le nom du pays ne peut pas dépasser 100 caractères'],
    default: 'Sénégal'
  },
  
  // Localisation (optionnelle lors de l'inscription)
  address: {
    street: { type: String, required: false, default: 'À compléter' },
    city: { type: String, required: false, default: 'À compléter' },
    region: { type: String, required: false, default: 'À compléter' },
    postalCode: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Vérification et sécurité
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Statut du compte
  isActive: {
    type: Boolean,
    default: true
  },
  
  isApproved: {
    type: Boolean,
    default: false // Nécessite approbation admin pour certains types
  },
  
  // Statut du profil
  isProfileComplete: {
    type: Boolean,
    default: function() {
      // Les consommateurs ont un profil complet après inscription
      return this.userType === 'consumer';
    }
  },
  
  suspendedUntil: Date,
  suspensionReason: String,
  
  // Métadonnées
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date,
  
  // Préférences
  language: {
    type: String,
    enum: ['fr', 'en', 'es'],
    default: 'fr'
  },
  
  currency: {
    type: String,
    enum: ['XOF', 'EUR', 'USD', 'XAF'],
    default: 'XOF'
  },
  
  // Préférences de notification centralisées
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
    priceAlerts: { type: Boolean, default: false }
  },

  // Informations financières centralisées
  bankAccount: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String,
    swiftCode: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },

  // Méthodes de paiement préférées
  paymentMethods: {
    type: [String],
    enum: ['cash', 'card', 'mobile-money', 'bank-transfer', 'crypto'],
    default: ['cash', 'mobile-money']
  },

  // Statistiques communes centralisées
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    breakdown: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 }
    }
  },

  // Statistiques de vente communes
  salesStats: {
    totalSales: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    monthlySales: [{
      month: String,
      year: Number,
      sales: Number,
      orders: Number
    }]
  },

  // Informations de vérification centralisées
  // TODO: Ajouter verificationStatus et deliveryAddresses après résolution du problème
  
}, {
  timestamps: true,
  discriminatorKey: 'userType',
  collection: 'users'
});

// Index pour performance
baseUserSchema.index({ email: 1 });
baseUserSchema.index({ userType: 1 });
baseUserSchema.index({ country: 1, 'address.region': 1 });
baseUserSchema.index({ isActive: 1, isApproved: 1 });

// Middleware pre-save pour hasher le mot de passe
baseUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  
  // Mettre à jour passwordChangedAt si ce n'est pas un nouveau document
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Soustraire 1 seconde pour s'assurer que le token est valide
  }
  
  next();
});

// Méthode pour comparer les mots de passe
baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer token de vérification email
baseUserSchema.methods.createEmailVerificationToken = function() {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 jours (pour les tests)
  
  return verifyToken;
};

// Méthode pour générer token de reset mot de passe
baseUserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Méthode pour vérifier si le compte est verrouillé
baseUserSchema.methods.isLocked = function() {
  return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
};

// Méthode pour incrémenter les tentatives de connexion
baseUserSchema.methods.incLoginAttempts = function() {
  // Si nous avons une date de verrouillage précédente et qu'elle est expirée, recommencer
  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        accountLockedUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Si nous atteignons la limite maximale et qu'il n'y a pas de verrouillage précédent, verrouiller le compte
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    // 30 minutes en production, 2 minutes en développement
    const lockoutDuration = process.env.NODE_ENV === 'production' 
      ? 30 * 60 * 1000  // 30 minutes
      : 2 * 60 * 1000;  // 2 minutes
    
    updates.$set = {
      accountLockedUntil: Date.now() + lockoutDuration
    };
  }
  
  return this.updateOne(updates);
};

// Méthode pour réinitialiser les tentatives de connexion
baseUserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      accountLockedUntil: 1
    }
  });
};

// Méthode pour vérifier si le mot de passe a été changé après l'émission du token
baseUserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Transformation JSON pour masquer les champs sensibles
baseUserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.loginAttempts;
  delete userObject.accountLockedUntil;
  
  return userObject;
};

const User = mongoose.model('User', baseUserSchema);

module.exports = User;
