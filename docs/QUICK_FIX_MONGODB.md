# ⚡ Solution Rapide - Erreur MongoDB ECONNREFUSED

## 🎯 Solution la Plus Rapide (2 minutes)

### Utiliser MongoDB Atlas (Gratuit, Cloud)

1. **Créer un compte** (gratuit): https://www.mongodb.com/cloud/atlas/register

2. **Créer un cluster gratuit**:
   - Cliquer "Build a Database"
   - Choisir "FREE" (M0)
   - Choisir une région proche (Europe)
   - Créer le cluster (2-3 minutes)

3. **Créer un utilisateur**:
   - Database Access → Add New Database User
   - Username: `harvests_user`
   - Password: Générer un mot de passe fort
   - **SAVEZ LE MOT DE PASSE !**

4. **Whitelist votre IP**:
   - Network Access → Add IP Address
   - Cliquer "Allow Access from Anywhere" (pour développement)
   - Ou ajouter votre IP spécifique

5. **Obtenir la connection string**:
   - Clusters → Connect → Connect your application
   - Copier la connection string:
     ```
     mongodb+srv://harvests_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Configurer dans `backend/.env`**:
   ```bash
   # Créer le fichier si nécessaire
   cd backend
   copy env.example .env
   
   # Éditer .env et ajouter:
   DATABASE=mongodb+srv://harvests_user:<PASSWORD>@cluster0.xxxxx.mongodb.net/harvests?retryWrites=true&w=majority
   DATABASE_PASSWORD=votre_mot_de_passe_ici
   ```

7. **Redémarrer le serveur**:
   ```bash
   npm run dev
   ```

✅ **C'est tout !** MongoDB Atlas est maintenant configuré.

---

## 🔄 Alternative: MongoDB Local (Si vous préférez)

### Windows

1. **Télécharger**: https://www.mongodb.com/try/download/community
2. **Installer** avec les options par défaut
3. **Démarrer le service**:
   ```bash
   # Via Services Windows
   Win + R → services.msc → Chercher "MongoDB" → Démarrer
   
   # Ou via ligne de commande (en tant qu'admin)
   net start MongoDB
   ```

4. **Configurer dans `backend/.env`**:
   ```bash
   DATABASE_LOCAL=mongodb://localhost:27017/harvests
   ```

5. **Redémarrer le serveur**

---

## ✅ Vérification

Après configuration, vous devriez voir:

```
✅ Connexion à la base de données réussie!
```

Au lieu de l'erreur `ECONNREFUSED`.

---

## 🆘 Problème Persiste?

1. Vérifier que le fichier `.env` existe dans `backend/`
2. Vérifier que les variables sont correctes (sans espaces)
3. Vérifier le mot de passe MongoDB Atlas
4. Vérifier que l'IP est whitelistée (MongoDB Atlas)

---

*Pour plus de détails, voir [Troubleshooting MongoDB](./TROUBLESHOOTING_MONGODB.md)*

