# 🛠️ Harvests - Documentation Technique par Profil

> [!NOTE]
> Pour une description fonctionnelle détaillée de chaque profil et de toutes les fonctionnalités de la plateforme, consultez [PROFILS_ET_FONCTIONNALITES.md](./PROFILS_ET_FONCTIONNALITES.md).

Cette documentation cartographie le code source (Backend & Frontend) pour chaque profil utilisateur de la plateforme Harvests.

---

## 🏛️ Architecture Commune (Core)

- **Base User Model** : `backend/models/User.js` (Discriminator key: `userType`)
- **Authentification** : `backend/controllers/auth/`
- **Frontend Routes** : `frontend/src/navigation/routes/`
- **Dashboard Layout** : `frontend/src/components/layout/ModularDashboardLayout.jsx`

---

## 🌾 1. Profil : Producteur (Producer)

### 🗺️ Backend (API)

- **Modèle Mongoose** : `backend/models/Producer.js`
- **Contrôleurs Principaux** :
  - `backend/controllers/producer/producerProductController.js` (Gestion produits)
  - `backend/controllers/producer/producerOrderController.js` (Gestion commandes)
  - `backend/controllers/producer/producerStatsController.js` (Statistiques)
- **Routes API** : `backend/routes/producerRoutes.js`

### 💻 Frontend (UI)

- **Dashboard Principal** : `frontend/src/pages/dashboard/producer/`
- **Navigation dédiée** : Générée dans `frontend/src/navigation/NavigationManager.js`
- **Pages Publiques** : `frontend/src/pages/ProducerProfile.jsx`

---

## 🏭 2. Profil : Transformateur (Transformer)

### 🗺️ Backend (API)

- **Modèle Mongoose** : `backend/models/Transformer.js`
- **Contrôleurs Principaux** : `backend/controllers/transformer/`
- **Routes API** : `backend/routes/transformerRoutes.js`

### 💻 Frontend (UI)

- **Dashboard Principal** : `frontend/src/pages/dashboard/transformer/`
- **Pages Publiques** : `frontend/src/pages/TransformerProfile.jsx`

---

## 🛒 3. Profil : Consommateur (Consumer)

### 🗺️ Backend (API)

- **Modèle Mongoose** : `backend/models/Consumer.js`
- **Contrôleurs Principaux** : `backend/controllers/consumer/`
- **Routes API** : `backend/routes/consumerRoutes.js`

### 💻 Frontend (UI)

- **Dashboard Utilisateur** : `frontend/src/pages/dashboard/consumer/`
- **Panier & Checkout** : `frontend/src/pages/Cart.jsx` et `frontend/src/pages/payments/`
- **Profil Public** : N/A (Profil privé)

---

## 🍽️ 4. Profil : Restaurateur (Restaurateur)

### 🗺️ Backend (API)

- **Modèle Mongoose** : `backend/models/Restaurateur.js`
- **Contrôleurs Principaux** : `backend/controllers/restaurateur/`

### 💻 Frontend (UI)

- **Dashboard Principal** : `frontend/src/pages/dashboard/restaurateur/`
- **Page Profil Public** : `frontend/src/pages/RestaurateurProfile.jsx`

---

## 🚛 5. Profil : Transporteur (Transporter)

### 🗺️ Backend (API)

- **Modèle Mongoose** : `backend/models/Transporter.js`
- **Contrôleurs Principaux** : `backend/controllers/transporter/`

### 💻 Frontend (UI)

- **Dashboard Logistique** : `frontend/src/pages/dashboard/transporter/`
- **Page Profil Public** : `frontend/src/pages/TransporterProfile.jsx`

---

## 🚢 6. Profil : Exportateur (Exporter)

### 🗺️ Backend (API)

- **Modèle Mongoose** : `backend/models/Exporter.js`
- **Contrôleurs Principaux** : `backend/controllers/exporter/`

### 💻 Frontend (UI)

- **Dashboard Export** : `frontend/src/pages/dashboard/exporter/`
- **Page Profil Public** : `frontend/src/pages/ExporterProfile.jsx`

---

## 🛡️ 7. Profil : Administrateur (Admin)

### 🗺️ Backend (API)

- **Modèle Mongoose** : `backend/models/Admin.js`
- **Contrôleurs Principaux** : `backend/controllers/admin/`
- **Middleware de Sécurité** : `backend/middleware/authMiddleware.js` (Vérification du rôle admin)

### 💻 Frontend (UI)

- **Panel Admin** : `frontend/src/pages/admin/`
- **Layout Dédié** : `frontend/src/components/layout/AdminLayout.jsx`

---

## ⚙️ Systèmes Partagés

### 💳 Paiements

- **Fichiers clés** : `backend/services/paymentService.js` / `frontend/src/services/paymentService.js`
- **Passerelles** : `Stripe` (International), `Wave` (Local), `PayPal`.

### 🔔 Notifications & Temps Réel

- **Backend Socket** : `backend/socket.js`
- **Frontend Context** : `frontend/src/contexts/SocketContext.jsx` et `NotificationContext.jsx`.

### 🌍 Internationalisation (i18n)

- **Fichiers de traduction** : `frontend/src/locales/` (fr, en, ar, pt).
- **Utilitaire** : `frontend/src/utils/i18n.js`.

---
**Note technique** : Tous les modèles étendent le schéma de base défini dans `User.js` via le mécanisme de discriminants de Mongoose, permettant une collection unique d'utilisateurs hautement performante.
