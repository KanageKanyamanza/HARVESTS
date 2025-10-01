# 🔄 Guide Nodemon - HARVESTS Backend

## 📖 Introduction

Nodemon est configuré pour redémarrer automatiquement le serveur lors de modifications de fichiers pendant le développement.

---

## 🚀 Commandes disponibles

### Mode développement standard
```bash
npm run dev
```
✅ Redémarrage automatique lors des modifications
✅ Logs colorés
✅ Délai de 1 seconde avant redémarrage

### Mode verbose (détaillé)
```bash
npm run dev:verbose
```
✅ Affiche tous les fichiers surveillés
✅ Plus de logs de débogage

### Mode debug/inspect
```bash
npm run dev:inspect
```
✅ Démarre avec le debugger Node.js activé
✅ Permet de connecter Chrome DevTools (chrome://inspect)

---

## ⚙️ Configuration

### Fichiers surveillés
Nodemon surveille automatiquement :
- `server.js` et `app.js`
- Dossiers : `controllers/`, `models/`, `routes/`, `middleware/`, `utils/`, `config/`, `services/`
- Extensions : `.js`, `.json`

### Fichiers ignorés
Les fichiers suivants ne déclenchent **PAS** de redémarrage :
- `node_modules/`
- `logs/`
- Tests : `*.test.js`, `*.spec.js`
- Uploads : `public/`, `uploads/`, `temp/`
- `.git/`
- Fichiers de documentation : `*.md`

### Délai de redémarrage
⏱️ **1 seconde** de délai après la dernière modification avant le redémarrage
(Évite les redémarrages multiples lors de sauvegardes rapides)

---

## 🎯 Commandes manuelles pendant l'exécution

Pendant que nodemon est actif, vous pouvez utiliser :

| Commande | Action |
|----------|--------|
| `rs` + Enter | Redémarrer manuellement le serveur |
| `Ctrl + C` | Arrêter nodemon |

---

## 📝 Personnalisation

### Modifier la configuration
Éditez le fichier `nodemon.json` pour :
- Ajouter/retirer des dossiers surveillés
- Changer les extensions surveillées
- Modifier le délai de redémarrage
- Ajouter des variables d'environnement

### Exemple de configuration personnalisée
```json
{
  "watch": ["controllers", "models"],
  "ext": "js",
  "delay": "2000"
}
```

---

## 🐛 Dépannage

### Le serveur ne redémarre pas
1. Vérifiez que le fichier modifié est dans un dossier surveillé
2. Vérifiez l'extension du fichier (`.js` ou `.json`)
3. Tapez `rs` + Enter pour forcer un redémarrage

### Trop de redémarrages
- Augmentez le délai dans `nodemon.json` : `"delay": "2000"`
- Ajoutez des fichiers/dossiers à ignorer dans `.nodemonignore`

### Nodemon n'est pas installé
```bash
npm install --save-dev nodemon
```

---

## 📊 Logs et événements

### Messages de nodemon
- 🔄 **Redémarrage du serveur...** → Modification détectée
- ✅ **Server started** → Serveur opérationnel
- ⚠️ **Error** → Erreur lors du démarrage

### Variables d'environnement
Nodemon définit automatiquement :
```javascript
process.env.NODE_ENV = 'development'
```

---

## 💡 Bonnes pratiques

1. ✅ **Utilisez `npm run dev` pour le développement local**
2. ✅ **Utilisez `npm start` pour la production**
3. ✅ **Ne committez pas les logs dans git**
4. ✅ **Gardez le `.nodemonignore` à jour**
5. ✅ **Testez le mode production avant le déploiement**

---

## 📚 Ressources

- [Documentation Nodemon](https://nodemon.io/)
- [Options de configuration](https://github.com/remy/nodemon#config-files)
- [Guide de débogage Node.js](https://nodejs.org/en/docs/guides/debugging-getting-started/)

---

**Équipe Harvests** 🌾

