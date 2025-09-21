# 📧 Configuration Gmail pour Harvests

## 🎯 Étapes de configuration

### 1. Activer l'authentification à 2 facteurs
1. Aller sur [myaccount.google.com](https://myaccount.google.com)
2. Sécurité → Authentification à 2 facteurs
3. Activer l'A2F

### 2. Créer un mot de passe d'application
1. Aller sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sélectionner "Autre (nom personnalisé)"
3. Taper "Harvests Backend"
4. Copier le mot de passe généré (16 caractères)

### 3. Configurer les variables d'environnement

Éditer le fichier `.env` :

```bash
# Configuration Gmail
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop  # Le mot de passe d'app généré
EMAIL_FROM=noreply@harvests.cm

# Autres variables requises
DATABASE_LOCAL=mongodb://localhost:27017/harvests
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NODE_ENV=development
PORT=8000
```

### 4. Tester la configuration

```bash
# Tester l'envoi d'email
node test-email-config.js

# Tester l'inscription complète
node test-api-simple.js
```

## 🔧 Dépannage

### Erreur "Invalid login"
- Vérifiez que l'A2F est activée
- Régénérez un nouveau mot de passe d'application
- Vérifiez que l'email est correct

### Erreur "Less secure app access"
- Gmail n'utilise plus cette option
- Utilisez OBLIGATOIREMENT un mot de passe d'application

### Limite de 500 emails/jour
- Gmail gratuit : 500 emails/jour
- Gmail Workspace : 2000 emails/jour
- Pour plus : utiliser SendGrid, Mailgun, etc.

## ✅ Validation

Une fois configuré, vous devriez voir :
```
✅ Email envoyé !
📨 Message ID: <xxx@gmail.com>
🔗 Preview disponible
```

## 🚀 Production

Pour la production, utilisez :
- **SendGrid** (99% de délivrabilité)
- **Mailgun** (APIs avancées)
- **AWS SES** (économique)
- **Gmail Workspace** (professionnel)

---

**📧 Configuration Gmail terminée pour Harvests !**
