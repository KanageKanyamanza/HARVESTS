# 📧 Configuration EmailJS - Solution de Fallback

## 🎯 Objectif

EmailJS est configuré comme **solution de fallback** pour l'envoi d'emails en production. Si Nodemailer (Gmail/SMTP) échoue, le système basculera automatiquement vers EmailJS.

## 🚀 Avantages d'EmailJS

- ✅ **200 emails/mois GRATUIT**
- ✅ **Pas de serveur SMTP** à configurer
- ✅ **API simple** et fiable
- ✅ **Templates personnalisables**
- ✅ **Fallback automatique** intégré

## 📋 Configuration Requise

### 1. Créer un compte EmailJS

1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Créez un compte gratuit
3. Vérifiez votre email

### 2. Configurer un Service Email

1. Dans le dashboard EmailJS, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez votre fournisseur email :
   - **Gmail** (recommandé)
   - **Outlook**
   - **Yahoo**
   - **Autre SMTP**

4. Connectez votre compte email
5. Notez le **Service ID** généré

### 3. Créer un Template Email

1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Utilisez ce template de base :

```html
Subject: {{subject}}

Bonjour {{to_name}},

{{message}}

Cordialement,
{{from_name}}

---
Email envoyé via Harvests Platform
```

4. Configurez les variables :
   - `{{to_name}}` - Nom du destinataire
   - `{{to_email}}` - Email du destinataire
   - `{{subject}}` - Sujet de l'email
   - `{{message}}` - Contenu de l'email (texte)
   - `{{html_message}}` - Contenu HTML (optionnel)
   - `{{from_name}}` - Nom de l'expéditeur
   - `{{reply_to}}` - Email de réponse

5. Notez le **Template ID** généré

### 4. Obtenir la Clé Publique

1. Allez dans **"Account"** → **"General"**
2. Copiez votre **Public Key**

## 🔧 Configuration dans Harvests

### Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Configuration EmailJS (FALLBACK)
EMAILJS_SERVICE_ID=service_xxxxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxxxx
EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Exemple de Configuration Complète

```bash
# Configuration Email principale (Gmail)
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-mot-de-passe-app
EMAIL_FROM=noreply@harvests.sn

# Configuration EmailJS (Fallback)
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID=template_xyz789
EMAILJS_PUBLIC_KEY=pk_1234567890abcdef
```

## 🔄 Fonctionnement du Fallback

### Ordre de Priorité

1. **🥇 Nodemailer (Gmail)** - Tentative principale
2. **🥈 EmailJS** - Fallback automatique si Nodemailer échoue
3. **❌ Erreur** - Si les deux échouent

### Logs de Debug

Le système affiche des logs détaillés :

```bash
✅ Email envoyé avec succès via Nodemailer
❌ Erreur Nodemailer, tentative avec EmailJS: Connection timeout
✅ Email envoyé avec succès via EmailJS (fallback)
```

## 🧪 Test de la Configuration

### Test Automatique

```javascript
// Test avec fallback automatique
const email = new Email(user, url);
await email.sendTestEmail();
```

### Test EmailJS Seulement

```javascript
// Test direct EmailJS
const email = new Email(user, url);
await email.sendWithEmailJS('Test EmailJS', '<h1>Test</h1>');
```

## 📊 Monitoring

### Métriques Importantes

- **Taux de succès Nodemailer** vs **EmailJS**
- **Temps de réponse** de chaque service
- **Erreurs fréquentes** et leurs causes

### Logs à Surveiller

```bash
# Succès Nodemailer
✅ Email envoyé avec succès via Nodemailer

# Fallback EmailJS
❌ Erreur Nodemailer, tentative avec EmailJS: [erreur]
✅ Email envoyé avec succès via EmailJS (fallback)

# Échec total
❌ Erreur EmailJS également: [erreur]
❌ Échec envoi email: Nodemailer ([erreur1]) et EmailJS ([erreur2])
```

## 🚨 Dépannage

### Erreurs Courantes

#### 1. Configuration Manquante
```
Configuration EmailJS manquante. Vérifiez EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID et EMAILJS_PUBLIC_KEY
```
**Solution :** Vérifiez que toutes les variables d'environnement sont définies.

#### 2. Service ID Invalide
```
Invalid service ID
```
**Solution :** Vérifiez le Service ID dans votre dashboard EmailJS.

#### 3. Template ID Invalide
```
Invalid template ID
```
**Solution :** Vérifiez le Template ID et que le template existe.

#### 4. Quota Dépassé
```
Monthly quota exceeded
```
**Solution :** Passez à un plan payant ou attendez le mois suivant.

### Vérifications

1. **Service EmailJS actif** dans le dashboard
2. **Template configuré** avec les bonnes variables
3. **Variables d'environnement** correctement définies
4. **Quota EmailJS** non dépassé (200 emails/mois gratuit)

## 💡 Bonnes Pratiques

### 1. Monitoring Proactif
- Surveillez les logs de fallback
- Alertez si EmailJS est utilisé trop souvent
- Vérifiez régulièrement les quotas

### 2. Optimisation des Templates
- Utilisez des templates simples et efficaces
- Testez les templates avant la production
- Optimisez la taille des emails

### 3. Gestion des Erreurs
- Logs détaillés pour le debugging
- Notifications d'alerte en cas d'échec
- Plan de récupération documenté

## 📈 Évolution Future

### Améliorations Possibles

1. **Métriques avancées** - Dashboard de monitoring
2. **Templates dynamiques** - Personnalisation par type d'email
3. **A/B Testing** - Comparaison des taux d'ouverture
4. **Intégration webhook** - Notifications en temps réel

### Plans EmailJS

- **Gratuit** : 200 emails/mois
- **Starter** : 1,000 emails/mois ($15/mois)
- **Business** : 10,000 emails/mois ($50/mois)

## 🔗 Ressources

- [Documentation EmailJS](https://www.emailjs.com/docs/)
- [API Reference](https://www.emailjs.com/docs/api/)
- [Templates Examples](https://www.emailjs.com/docs/templates/)
- [Pricing Plans](https://www.emailjs.com/pricing/)

---

**Note :** EmailJS est une solution de fallback. Nodemailer reste la méthode principale recommandée pour la production.
