# Guide de Déploiement - Harvests Frontend

## URLs de Production

- **Frontend** : https://harvests-khaki.vercel.app/
- **Backend** : https://harvests.onrender.com

## Configuration

### Variables d'Environnement

Le projet utilise deux configurations principales :

1. **Développement** : `http://localhost:8000/api/v1`
2. **Production** : `https://harvests.onrender.com/api/v1`

### Fichiers de Configuration

- `src/config/production.js` : Configuration centralisée pour la production
- `env.example` : Exemple de variables d'environnement
- `src/services/api.js` : Configuration automatique selon l'environnement

### Déploiement sur Vercel

1. **Variables d'environnement à configurer sur Vercel** :
   ```
   VITE_API_URL=https://harvests.onrender.com/api/v1
   VITE_APP_NAME=Harvests
   VITE_DEBUG=false
   ```

2. **Build automatique** :
   - Le projet se build automatiquement avec la configuration de production
   - L'URL de l'API est automatiquement détectée selon l'environnement

### Configuration CORS

Assurez-vous que le backend autorise les requêtes depuis :
- `https://harvests-khaki.vercel.app`
- `http://localhost:5173` (développement)

### Fonctionnalités de Production

- ✅ Timeout API augmenté (15s)
- ✅ Logs d'erreur uniquement
- ✅ HTTPS activé
- ✅ CSP (Content Security Policy) activé
- ✅ Analytics activé

### Débogage

Pour déboguer en production, vous pouvez :
1. Vérifier les logs dans la console du navigateur
2. Utiliser les outils de développement
3. Vérifier les requêtes réseau dans l'onglet Network

### Support

En cas de problème :
1. Vérifiez que le backend est accessible : https://harvests.onrender.com
2. Vérifiez les variables d'environnement sur Vercel
3. Vérifiez la configuration CORS du backend
