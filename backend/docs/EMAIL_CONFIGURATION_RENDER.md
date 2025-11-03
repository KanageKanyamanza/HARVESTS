# 📧 Configuration Email sur Render avec Mailinator

## 🎯 Comprendre le Problème

**Mailinator** est un service de **réception** d'emails (pour tester), mais vous avez toujours besoin d'un service **SMTP** pour **ENVOYER** les emails depuis votre application.

## 🔧 Solutions Recommandées

### Option 1: Gmail (Recommandé - Gratuit - 500 emails/jour)

#### Configuration sur Render:

1. **Activez l'authentification 2FA sur votre compte Gmail**
   - Allez sur [myaccount.google.com](https://myaccount.google.com)
   - Sécurité → Validation en deux étapes → Activez

2. **Créez un Mot de Passe d'Application**
   - Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Sélectionnez "Mail" et "Autre (nom personnalisé)"
   - Entrez "Harvests Render" et générez le mot de passe
   - **Copiez le mot de passe généré** (16 caractères)

3. **Configurez les Variables d'Environnement sur Render:**
   - Allez dans votre service Render → Environment
   - Ajoutez ces variables:
     ```
     GMAIL_USER=votre-email@gmail.com
     GMAIL_APP_PASSWORD=votre-mot-de-passe-app-16-caracteres
     EMAIL_FROM=noreply@harvests.sn
     ```

4. **Testez avec Mailinator:**
   - Envoyez un email vers `test@mailinator.com`
   - Consultez sur [mailinator.com](https://www.mailinator.com) avec l'adresse `test`

### Option 2: SMTP Générique (SendGrid, Mailgun, etc.)

#### Avec SendGrid (Gratuit - 100 emails/jour):

1. **Créez un compte SendGrid**
   - Allez sur [sendgrid.com](https://sendgrid.com)
   - Créez un compte gratuit
   - Vérifiez votre email

2. **Créez une API Key**
   - Settings → API Keys → Create API Key
   - Donnez les permissions "Mail Send"
   - **Copiez la clé API**

3. **Configurez sur Render:**
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USERNAME=apikey
   EMAIL_PASSWORD=votre-api-key-sendgrid
   EMAIL_SECURE=false
   EMAIL_FROM=noreply@harvests.sn
   ```

#### Avec Mailgun (Gratuit - 5000 emails/mois):

1. **Créez un compte Mailgun**
   - Allez sur [mailgun.com](https://www.mailgun.com)
   - Créez un compte gratuit
   - Vérifiez votre domaine (ou utilisez le domaine sandbox)

2. **Récupérez les identifiants SMTP**
   - Dashboard → Sending → SMTP credentials
   - Notez le nom d'utilisateur et le mot de passe

3. **Configurez sur Render:**
   ```
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USERNAME=votre-username-mailgun
   EMAIL_PASSWORD=votre-password-mailgun
   EMAIL_SECURE=false
   EMAIL_FROM=noreply@harvests.sn
   ```

### Option 3: EmailJS (Fallback - 200 emails/mois gratuit)

EmailJS est configuré comme **fallback automatique** si Nodemailer échoue.

1. **Créez un compte EmailJS**
   - Allez sur [emailjs.com](https://www.emailjs.com)
   - Créez un compte gratuit

2. **Configurez un Service Email**
   - Email Services → Add New Service
   - Connectez Gmail ou un autre service
   - Notez le **Service ID**

3. **Créez un Template**
   - Email Templates → Create New Template
   - Utilisez les variables: `{{to_email}}`, `{{subject}}`, `{{html_message}}`
   - Notez le **Template ID**

4. **Récupérez la Public Key**
   - Account → General → Public Key

5. **Configurez sur Render:**
   ```
   EMAILJS_SERVICE_ID=service_xxxxxxxxx
   EMAILJS_TEMPLATE_ID=template_xxxxxxxxx
   EMAILJS_PUBLIC_KEY=votre-public-key
   ```

## ✅ Vérification de la Configuration

### Sur Render - Vérifiez les Logs:

1. **Allez dans votre service Render → Logs**
2. **Recherchez ces messages au démarrage:**
   - `📧 Configuration email: Gmail (Nodemailer)` ✅
   - OU `📧 Configuration email: SMTP (smtp.xxx.com:587)` ✅
   - `❌ Configuration email SMTP incomplète` ❌

3. **Testez l'envoi d'email:**
   - Utilisez l'endpoint `/api/v1/auth/test-email` si disponible
   - Ou créez un compte utilisateur et vérifiez les logs

### Messages d'Erreur Courants:

#### `EAUTH` - Erreur d'Authentification:
```
❌ Erreur Nodemailer détaillée:
   Code: EAUTH
   🔐 ERREUR D'AUTHENTIFICATION:
   - Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD (pour Gmail)
   - Pour Gmail: Activez l'authentification 2FA et créez un mot de passe d'application
```
**Solution:** Vérifiez que vous utilisez un **mot de passe d'application** et non votre mot de passe Gmail normal.

#### `ECONNECTION` - Erreur de Connexion:
```
❌ Erreur Nodemailer détaillée:
   Code: ECONNECTION
   🔌 ERREUR DE CONNEXION:
   - Vérifiez EMAIL_HOST et EMAIL_PORT
   - Vérifiez que le serveur SMTP est accessible depuis Render
```
**Solution:** Vérifiez que `EMAIL_HOST` et `EMAIL_PORT` sont corrects et que le serveur SMTP accepte les connexions.

## 🧪 Tester avec Mailinator

1. **Dans votre application, envoyez un email vers:**
   - `test@mailinator.com`
   - Ou `votre-nom@mailinator.com` (n'importe quel nom avant @mailinator.com)

2. **Consultez l'email sur Mailinator:**
   - Allez sur [mailinator.com](https://www.mailinator.com)
   - Entrez l'adresse (ex: `test` ou `votre-nom`)
   - Cliquez sur "GO"
   - Vous verrez tous les emails reçus

**Note:** Les emails sur Mailinator expirent après quelques heures. C'est parfait pour les tests!

## 📋 Checklist de Configuration

- [ ] Variables d'environnement configurées sur Render
- [ ] Gmail: 2FA activé + Mot de passe d'application créé
- [ ] OU SMTP: Host, Port, Username, Password corrects
- [ ] `EMAIL_FROM` configuré
- [ ] Logs Render montrent "Configuration email: ..."
- [ ] Test d'envoi réussi (vérifier les logs)
- [ ] Email reçu sur Mailinator (si test)

## 🚨 Important

- **Mailinator** est pour **recevoir** des emails (tests)
- Vous avez **toujours besoin** d'un service SMTP pour **envoyer** des emails
- Gmail est la solution la plus simple et gratuite (500 emails/jour)
- Les logs détaillés sont maintenant activés pour diagnostiquer les problèmes

## 📞 Support

Si les emails ne fonctionnent toujours pas:
1. Vérifiez les logs Render pour les messages d'erreur détaillés
2. Vérifiez que toutes les variables d'environnement sont définies
3. Testez la connexion SMTP avec un outil externe (comme [Mailtrap](https://mailtrap.io))
4. Vérifiez que votre service SMTP n'a pas bloqué les connexions depuis Render

