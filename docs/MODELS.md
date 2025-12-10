# 🗄️ Modèles de Données - Harvests Platform

Documentation complète des modèles MongoDB et leurs relations.

## 📋 Vue d'Ensemble

Harvests utilise **MongoDB** avec **Mongoose** pour la gestion des données. L'architecture utilise le pattern **Discriminator** pour les différents types d'utilisateurs.

---

## 👥 Modèles Utilisateurs

### User (Modèle de Base)

Modèle de base avec champs communs à tous les types d'utilisateurs.

**Fichier**: `backend/models/User.js`

**Schéma**:

```javascript
{
  // Authentification
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format email invalide']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Ne pas retourner par défaut
  },
  userType: {
    type: String,
    required: true,
    enum: ['producer', 'transformer', 'consumer', 'restaurateur', 'exporter', 'transporter', 'admin']
  },
  
  // Profil
  firstName: String,
  lastName: String,
  phone: String,
  bio: String,
  
  // Localisation
  address: {
    street: String,
    city: String,
    region: String,
    country: { type: String, default: 'Sénégal' },
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Images
  avatar: String,        // URL Cloudinary
  shopBanner: String,   // URL Cloudinary
  shopLogo: String,     // URL Cloudinary
  
  // Sécurité
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: { type: Boolean, default: true },
  accountApproved: { type: Boolean, default: false },
  
  // Préférences
  currency: { type: String, default: 'XOF' },
  language: { type: String, default: 'fr' },
  preferredLanguage: { type: String, enum: ['fr', 'en', 'pt', 'ar'] },
  timezone: { type: String, default: 'Africa/Dakar' },
  
  // Statistiques
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  salesStats: {
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },
  
  // Métadonnées
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Producer (Producteur)

**Fichier**: `backend/models/Producer.js`

**Champs supplémentaires**:

```javascript
{
  farmName: String,
  farmSize: {
    value: Number,
    unit: { type: String, enum: ['hectares', 'acres', 'm²'], default: 'hectares' }
  },
  farmingType: {
    type: String,
    enum: ['organic', 'conventional', 'mixed']
  },
  crops: [{
    name: String,
    category: String,
    plantingSeasons: [String],
    harvestSeasons: [String]
  }],
  certifications: [{
    type: String,
    issuer: String,
    date: Date,
    expiry: Date
  }]
}
```

### Transformer (Transformateur)

**Fichier**: `backend/models/Transformer.js`

**Champs supplémentaires**:

```javascript
{
  companyName: String,
  transformationType: {
    type: String,
    enum: ['milling', 'packaging', 'preservation', 'processing', 'other']
  },
  facilities: [{
    name: String,
    location: String,
    capacity: Number
  }],
  certifications: [{
    type: String,
    issuer: String,
    date: Date
  }]
}
```

### Consumer (Consommateur)

**Fichier**: `backend/models/Consumer.js`

**Champs supplémentaires**:

```javascript
{
  preferences: {
    dietaryRestrictions: [String],
    allergies: [String],
    favoriteCategories: [String]
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  }
}
```

### Restaurateur

**Fichier**: `backend/models/Restaurateur.js`

**Champs supplémentaires**:

```javascript
{
  restaurantName: String,
  cuisineType: {
    type: String,
    enum: ['african', 'european', 'asian', 'american', 'fusion', 'other']
  },
  capacity: Number,
  operatingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    // ... autres jours
  },
  dishes: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    ingredients: [String],
    allergens: [String],
    preparationTime: Number
  }]
}
```

### Exporter (Exportateur)

**Fichier**: `backend/models/Exporter.js`

**Champs supplémentaires**:

```javascript
{
  companyName: String,
  exportLicenses: [{
    type: String,
    number: String,
    country: String,
    expiry: Date
  }],
  targetMarkets: [String]
}
```

### Transporter (Transporteur)

**Fichier**: `backend/models/Transporter.js`

**Champs supplémentaires**:

```javascript
{
  companyName: String,
  vehicles: [{
    type: { type: String, enum: ['truck', 'van', 'motorcycle', 'bicycle'] },
    capacity: Number,
    licensePlate: String
  }],
  serviceAreas: [String],
  deliveryOptions: [{
    type: String,
    price: Number,
    estimatedTime: String
  }]
}
```

---

## 📦 Modèles Business

### Product (Produit)

**Fichier**: `backend/models/Product.js`

**Schéma**:

```javascript
{
  // Informations de base
  name: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String,
  shortDescription: String,
  
  // Relations
  producer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transformer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  restaurateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userType: { type: String, enum: ['producer', 'transformer', 'restaurateur'] },
  
  // Catégorisation
  category: {
    type: String,
    enum: ['cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'spices', 'herbs', 'nuts', 'seeds', 'dairy', 'meat', 'poultry', 'fish', 'processed-foods', 'beverages', 'other']
  },
  subcategory: String,
  tags: [String],
  
  // Prix
  hasVariants: { type: Boolean, default: false },
  price: Number, // Si pas de variantes
  compareAtPrice: Number,
  
  // Variantes
  variants: [{
    name: String,
    price: Number,
    compareAtPrice: Number,
    weight: {
      value: Number,
      unit: { type: String, enum: ['g', 'kg', 'lb', 'oz'], default: 'kg' }
    },
    inventory: {
      quantity: Number,
      lowStockAlert: Number
    },
    sku: String
  }],
  
  // Images
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
    order: Number
  }],
  
  // Inventaire
  inventory: {
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackQuantity: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    reservedQuantity: { type: Number, default: 0 }
  },
  
  // Statut
  status: {
    type: String,
    enum: ['draft', 'pending-review', 'approved', 'rejected', 'inactive'],
    default: 'draft'
  },
  isPublic: { type: Boolean, default: true },
  
  // Métadonnées
  createdAt: Date,
  updatedAt: Date
}
```

### Order (Commande)

**Fichier**: `backend/models/Order.js`

**Schéma**:

```javascript
{
  orderNumber: { type: String, unique: true },
  
  // Relations
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Items
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variant: { type: mongoose.Schema.Types.ObjectId },
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  
  // Prix
  subtotal: Number,
  shippingCost: Number,
  tax: Number,
  discount: Number,
  total: Number,
  
  // Adresse de livraison
  deliveryAddress: {
    street: String,
    city: String,
    region: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Paiement
  payment: {
    method: { type: String, enum: ['cash', 'wave', 'orange-money', 'stripe', 'paypal'] },
    provider: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']
    },
    amount: Number,
    currency: String,
    transactionId: String
  },
  
  // Statut
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready-for-pickup', 'in-transit', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Livraison
  delivery: {
    method: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    trackingNumber: String
  },
  
  // Métadonnées
  createdAt: Date,
  updatedAt: Date
}
```

### Review (Avis)

**Fichier**: `backend/models/Review.js`

**Schéma**:

```javascript
{
  // Relations
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Contenu
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: String,
  images: [String],
  
  // Modération
  isApproved: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // Achat vérifié
  
  // Métadonnées
  createdAt: Date,
  updatedAt: Date
}
```

### Payment (Paiement)

**Fichier**: `backend/models/Payment.js`

**Schéma**:

```javascript
{
  // Relations
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Montant
  amount: { type: Number, required: true },
  currency: { type: String, default: 'XOF' },
  
  // Méthode
  method: {
    type: String,
    enum: ['cash', 'wave', 'orange-money', 'stripe', 'paypal'],
    required: true
  },
  
  // Statut
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Détails selon méthode
  waveDetails: {
    phone: String,
    transactionId: String
  },
  stripeDetails: {
    paymentIntentId: String,
    customerId: String
  },
  paypalDetails: {
    orderId: String,
    payerId: String
  },
  
  // Métadonnées
  createdAt: Date,
  updatedAt: Date
}
```

### Notification

**Fichier**: `backend/models/Notification.js`

**Schéma**:

```javascript
{
  // Relations
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Contenu
  type: {
    type: String,
    enum: ['order', 'payment', 'review', 'message', 'system', 'marketing']
  },
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed, // Données supplémentaires
  
  // Statut
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // Canaux
  channels: [{
    type: { type: String, enum: ['email', 'sms', 'push', 'in-app'] },
    sent: { type: Boolean, default: false },
    sentAt: Date
  }],
  
  // Métadonnées
  createdAt: Date
}
```

### Message

**Fichier**: `backend/models/Message.js`

**Schéma**:

```javascript
{
  // Relations
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Contenu
  content: String,
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  attachments: [{
    url: String,
    type: String,
    name: String
  }],
  
  // Statut
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // Métadonnées
  createdAt: Date
}
```

### Conversation

**Fichier**: `backend/models/Conversation.js`

**Schéma**:

```javascript
{
  // Participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Dernier message
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  },
  
  // Statut
  isArchived: { type: Boolean, default: false },
  
  // Métadonnées
  createdAt: Date,
  updatedAt: Date
}
```

### Blog

**Fichier**: `backend/models/Blog.js`

**Schéma**:

```javascript
{
  // Contenu
  title: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true },
  content: String,
  excerpt: String,
  featuredImage: String,
  images: [String],
  
  // Auteur
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Catégorisation
  category: String,
  tags: [String],
  
  // Statut
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  
  // Statistiques
  views: { type: Number, default: 0 },
  
  // Métadonnées
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 Relations

### Diagramme de Relations

```
User (Producer)
    ↓ has many
Product
    ↓ has many
Order
    ↓ has one
Payment
    ↓ has many
Review
    ↓ references
User (Consumer)

User
    ↓ has many
Message
    ↓ belongs to
Conversation
    ↓ has many
Message

User (Admin)
    ↓ has many
Blog
```

### Index MongoDB

Index créés automatiquement pour performance:

```javascript
// User
{ email: 1 } // Unique
{ userType: 1 }
{ 'address.city': 1 }
{ 'address.region': 1 }

// Product
{ name: 'text' } // Text search
{ category: 1 }
{ producer: 1 }
{ status: 1 }

// Order
{ buyer: 1 }
{ seller: 1 }
{ orderNumber: 1 } // Unique
{ status: 1 }
{ createdAt: -1 }
```

---

## 📊 Statistiques et Agrégations

### Exemples d'Agrégations

#### Produits par Catégorie

```javascript
Product.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

#### Revenus par Mois

```javascript
Order.aggregate([
  { $match: { status: 'delivered' } },
  { $group: {
    _id: { $month: '$createdAt' },
    revenue: { $sum: '$total' }
  }},
  { $sort: { _id: 1 } }
]);
```

---

*Pour plus de détails, consultez les fichiers de modèles dans `backend/models/`*
