# 🚀 DÉMARRAGE RAPIDE HARVESTS (sans domaine)

## ⚡ **CONFIGURATION EXPRESS - 2 MINUTES**

### **1. Copiez le fichier de configuration :**
```bash
cp env.example .env
```

### **2. Éditez votre `.env` avec cette configuration simple :**
```env
NODE_ENV=development
PORT=8000

# Base de données (local ou MongoDB Atlas)
DATABASE_LOCAL=mongodb://localhost:27017/harvests

# JWT (changez cette clé en production)
JWT_SECRET=votre-super-secret-jwt-key-au-moins-32-caracteres-long
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email avec Nodemailer (AUCUN DOMAINE REQUIS)
USE_ETHEREAL=true
EMAIL_FROM=noreply@harvests.local
```

### **3. Démarrez l'application :**
```bash
npm run dev
```

### **4. Testez l'API :**
```bash
curl http://localhost:8000/api/v1/health
```

---

## 📧 **OPTIONS EMAIL SANS DOMAINE**

### **🥇 Ethereal Email (RECOMMANDÉ)**
```env
USE_ETHEREAL=true
EMAIL_FROM=noreply@harvests.local  # ← Domaine fictif OK
```
- ✅ **Aucun compte requis**
- ✅ **Auto-génération** de credentials
- ✅ **Preview emails** dans le navigateur
- ✅ **Gratuit illimité**

### **🥈 Gmail Personnel**
```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=abcd-efgh-ijkl-mnop
EMAIL_FROM=noreply@harvests.local  # ← Domaine fictif OK
```
- ✅ **500 emails/jour gratuit**
- ✅ **Emails vraiment envoyés**
- ✅ **Configuration en 5 minutes**

### **🥉 SMTP Local (si disponible)**
```env
LOCAL_SMTP_HOST=localhost
LOCAL_SMTP_PORT=1025
EMAIL_FROM=test@harvests.local
```

---

## 🧪 **TESTER VOS EMAILS**

### **Avec Ethereal :**
```bash
node test-email-direct.js
```
**Résultat :** URL de preview automatique

### **Avec Gmail :**
Les emails arrivent vraiment dans la boîte mail

---

## 🎯 **RÉSUMÉ**

**✅ VOUS POUVEZ DÉMARRER SANS DOMAINE !**

- **EMAIL_FROM** peut être n'importe quoi (ex: `test@harvests.local`)
- **Nodemailer** s'en fiche du domaine pour les tests
- **Ethereal** génère tout automatiquement
- **Gmail** fonctionne avec n'importe quel FROM

**🚀 Votre backend Harvests est prêt à fonctionner immédiatement !**

---

*Guide de démarrage rapide - Harvests Backend*
