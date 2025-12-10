# 🔧 Dépannage MongoDB - Erreur ECONNREFUSED

## ❌ Erreur

```
connect ECONNREFUSED 127.0.0.1:27017
connect ECONNREFUSED ::1:27017
```

Cette erreur signifie que MongoDB n'est pas accessible sur `localhost:27017`.

---

## ✅ Solutions

### Solution 1: Utiliser MongoDB Atlas (Recommandé - Plus Simple)

MongoDB Atlas est un service cloud gratuit, plus simple que d'installer MongoDB localement.

#### Étapes

1. **Créer un compte gratuit** sur https://www.mongodb.com/cloud/atlas
2. **Créer un cluster gratuit** (M0 - Free tier)
3. **Créer un utilisateur** avec mot de passe
4. **Whitelist votre IP** (ou `0.0.0.0/0` pour développement)
5. **Obtenir la connection string**:
   ```
   mongodb+srv://username:<PASSWORD>@cluster0.xxxxx.mongodb.net/harvests?retryWrites=true&w=majority
   ```

#### Configuration dans `.env`

```bash
# Dans backend/.env
DATABASE=mongodb+srv://username:<PASSWORD>@cluster0.xxxxx.mongodb.net/harvests?retryWrites=true&w=majority
DATABASE_PASSWORD=votre_mot_de_passe
```

#### Redémarrer le serveur

```bash
cd backend
npm run dev
```

---

### Solution 2: Installer MongoDB Localement

#### Windows

1. **Télécharger MongoDB Community Server**
   - Aller sur https://www.mongodb.com/try/download/community
   - Sélectionner Windows
   - Télécharger et installer

2. **Démarrer MongoDB Service**
   ```bash
   # Option 1: Via Services Windows
   # Win + R → services.msc → Chercher "MongoDB" → Démarrer
   
   # Option 2: Via ligne de commande
   net start MongoDB
   ```

3. **Vérifier que MongoDB est démarré**
   ```bash
   mongod --version
   ```

4. **Configuration dans `.env`**
   ```bash
   # Dans backend/.env
   DATABASE_LOCAL=mongodb://localhost:27017/harvests
   ```

#### macOS

```bash
# Installer via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Démarrer MongoDB
brew services start mongodb-community

# Vérifier
mongod --version
```

#### Linux (Ubuntu/Debian)

```bash
# Installer MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Démarrer MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Vérifier
sudo systemctl status mongodb
```

---

### Solution 3: Utiliser Docker (Alternative)

Si vous avez Docker installé:

```bash
# Démarrer MongoDB dans un conteneur
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=harvests \
  mongo:latest

# Vérifier
docker ps
```

Configuration dans `.env`:
```bash
DATABASE_LOCAL=mongodb://localhost:27017/harvests
```

---

## 🔍 Vérification

### Tester la connexion MongoDB

```bash
# Si MongoDB est local
mongosh mongodb://localhost:27017/harvests

# Ou avec l'ancien client
mongo mongodb://localhost:27017/harvests
```

### Vérifier les variables d'environnement

```bash
# Dans backend/
cat .env | grep DATABASE
```

Assurez-vous que l'une de ces variables est définie:
- `DATABASE` (pour MongoDB Atlas)
- `DATABASE_URL` (pour MongoDB Atlas direct)
- `DATABASE_LOCAL` (pour MongoDB local)

---

## 🚨 Erreurs Communes

### Erreur: "MongoDB service not found"

**Solution**: MongoDB n'est pas installé ou le service n'est pas démarré.

```bash
# Windows: Vérifier dans Services
services.msc

# macOS: Vérifier avec Homebrew
brew services list

# Linux: Vérifier avec systemctl
sudo systemctl status mongodb
```

### Erreur: "Authentication failed"

**Solution**: Vérifier le mot de passe dans `DATABASE_PASSWORD`.

```bash
# Dans backend/.env
DATABASE_PASSWORD=votre_vrai_mot_de_passe
```

### Erreur: "IP not whitelisted" (MongoDB Atlas)

**Solution**: Ajouter votre IP dans MongoDB Atlas.

1. Aller sur MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Ajouter `0.0.0.0/0` (pour développement) ou votre IP spécifique

---

## 📝 Configuration Recommandée

### Pour Développement

**Option 1: MongoDB Atlas (Recommandé)**
```bash
DATABASE=mongodb+srv://username:<PASSWORD>@cluster0.xxxxx.mongodb.net/harvests?retryWrites=true&w=majority
DATABASE_PASSWORD=votre_mot_de_passe
```

**Option 2: MongoDB Local**
```bash
DATABASE_LOCAL=mongodb://localhost:27017/harvests
```

### Pour Production

Toujours utiliser MongoDB Atlas avec:
- Cluster M10 minimum
- Backup automatique activé
- Monitoring activé
- IP whitelist restrictive

---

## ✅ Checklist

- [ ] MongoDB installé OU compte MongoDB Atlas créé
- [ ] MongoDB démarré (si local) OU cluster Atlas créé
- [ ] Variables d'environnement configurées dans `backend/.env`
- [ ] IP whitelistée (si Atlas)
- [ ] Mot de passe correct
- [ ] Serveur redémarré après configuration

---

## 🆘 Besoin d'Aide?

Si le problème persiste:

1. Vérifier les logs du serveur
2. Vérifier la configuration dans `backend/.env`
3. Tester la connexion manuellement avec `mongosh` ou `mongo`
4. Consulter [Guide d'Installation](./INSTALLATION.md)

---

*Pour plus d'informations, consultez [Documentation MongoDB](https://docs.mongodb.com/)*

