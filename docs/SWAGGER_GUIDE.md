# 📚 Guide Swagger - Harvests API

Guide complet pour utiliser Swagger UI et la documentation OpenAPI de Harvests.

## 🌐 Accès à Swagger

### URLs

**Développement**:
- Swagger UI: http://localhost:8000/api/docs
- OpenAPI JSON: http://localhost:8000/api/docs.json

**Production**:
- Swagger UI: https://api.harvests.sn/api/docs
- OpenAPI JSON: https://api.harvests.sn/api/docs.json

---

## 🚀 Utilisation de Swagger UI

### Interface Principale

Swagger UI fournit une interface interactive pour:
- ✅ Explorer tous les endpoints
- ✅ Tester les requêtes en temps réel
- ✅ Voir les schémas de données
- ✅ Comprendre les codes de réponse
- ✅ Authentification JWT intégrée

### Navigation

1. **Tags**: Regroupez les endpoints par catégorie
   - Authentication
   - Users
   - Producers
   - Products
   - Orders
   - Payments
   - etc.

2. **Endpoints**: Cliquez sur un endpoint pour:
   - Voir la description
   - Voir les paramètres
   - Tester la requête
   - Voir les réponses possibles

---

## 🔐 Authentification dans Swagger

### Méthode 1: JWT Bearer Token

1. Cliquez sur le bouton **"Authorize"** (🔒) en haut à droite
2. Dans le champ "bearerAuth", entrez votre token:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Ou simplement le token sans "Bearer":
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Cliquez sur **"Authorize"**
4. Cliquez sur **"Close"**

Tous les endpoints protégés sont maintenant accessibles avec ce token.

### Méthode 2: Cookie (Automatique)

Après un login via l'API, le cookie JWT est automatiquement utilisé par Swagger.

### Obtenir un Token

**Via Swagger**:
1. Allez sur `POST /api/v1/auth/login`
2. Cliquez sur **"Try it out"**
3. Entrez vos identifiants:
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```
4. Cliquez sur **"Execute"**
5. Copiez le token de la réponse
6. Utilisez ce token dans "Authorize"

**Via cURL**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## 🧪 Tester un Endpoint

### Étapes

1. **Sélectionner l'endpoint** dans la liste
2. **Cliquer sur "Try it out"**
3. **Remplir les paramètres**:
   - Path parameters (dans l'URL)
   - Query parameters
   - Request body (pour POST/PATCH)
4. **Cliquer sur "Execute"**
5. **Voir la réponse**:
   - Status code
   - Response body
   - Headers
   - Curl command

### Exemple: Créer un Produit

1. Allez sur `POST /api/v1/products`
2. Cliquez "Try it out"
3. Remplissez le body:
   ```json
   {
     "name": "Mil Rouge Bio",
     "description": "Mil rouge cultivé bio",
     "category": "cereals",
     "subcategory": "millet",
     "price": 8500,
     "inventory": {
       "quantity": 30
     }
   }
   ```
4. Cliquez "Execute"
5. Voir la réponse avec le produit créé

---

## 📄 Spécification OpenAPI

### Format JSON

La spécification OpenAPI 3.0 est disponible en JSON:
```
http://localhost:8000/api/docs.json
```

### Utilisation

#### Import dans Postman

1. Ouvrir Postman
2. Cliquer sur **"Import"**
3. Sélectionner **"Link"**
4. Entrer: `http://localhost:8000/api/docs.json`
5. Cliquer **"Continue"**
6. Collection créée automatiquement avec tous les endpoints

#### Génération de SDK

**JavaScript/TypeScript**:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8000/api/docs.json \
  -g typescript-axios \
  -o ./generated-sdk
```

**Python**:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8000/api/docs.json \
  -g python \
  -o ./generated-sdk
```

**Java**:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8000/api/docs.json \
  -g java \
  -o ./generated-sdk
```

#### Tests Automatisés

Utiliser la spec pour générer des tests:
```javascript
// Exemple avec Jest
const axios = require('axios');
const spec = require('./api-docs.json');

describe('API Tests', () => {
  it('should get health check', async () => {
    const response = await axios.get('http://localhost:8000/api/v1/health');
    expect(response.status).toBe(200);
  });
});
```

---

## 📊 Schémas de Données

### Visualisation

Dans Swagger UI, chaque endpoint montre:
- **Request Schema**: Structure des données à envoyer
- **Response Schema**: Structure des données reçues
- **Examples**: Exemples concrets

### Schémas Principaux

#### User
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "userType": "producer|consumer|transformer|...",
  "address": {
    "street": "string",
    "city": "string",
    "region": "string",
    "country": "string"
  }
}
```

#### Product
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "category": "cereals|vegetables|fruits|...",
  "price": 0,
  "variants": [...],
  "images": [...],
  "inventory": {
    "quantity": 0
  }
}
```

#### Order
```json
{
  "_id": "string",
  "orderNumber": "string",
  "buyer": "string",
  "seller": "string",
  "items": [...],
  "total": 0,
  "status": "pending|confirmed|delivered|...",
  "payment": {
    "method": "wave|stripe|paypal",
    "status": "pending|completed|failed"
  }
}
```

---

## 🔍 Recherche et Filtrage

### Dans Swagger UI

Utilisez la barre de recherche en haut pour:
- Rechercher des endpoints par nom
- Filtrer par tag
- Filtrer par méthode HTTP

### Exemples de Recherche

- `product` → Tous les endpoints produits
- `auth` → Endpoints d'authentification
- `POST` → Toutes les requêtes POST
- `producer` → Endpoints producteurs

---

## 🎨 Personnalisation

### Thème Swagger

Le thème Swagger est personnalisé avec les couleurs Harvests:
- Vert agricole (#16a34a)
- Interface moderne
- Responsive design

### Configuration

La configuration Swagger est dans `backend/config/swagger.js`:
```javascript
const swaggerUiOptions = {
  customCss: `...`, // CSS personnalisé
  customSiteTitle: 'Harvests API - Documentation',
  swaggerOptions: {
    persistAuthorization: true, // Garder l'auth entre sessions
    displayRequestDuration: true, // Afficher la durée
    filter: true, // Activer la recherche
    docExpansion: 'list' // Expansion par défaut
  }
};
```

---

## 📝 Documentation des Endpoints

### Format Swagger

Chaque endpoint est documenté avec des annotations JSDoc:

```javascript
/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Créer un nouveau produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
```

### Ajouter un Nouvel Endpoint

1. **Créer la route** dans `backend/routes/`
2. **Ajouter les annotations Swagger** avec `@swagger`
3. **Définir les schémas** dans `backend/config/swagger.js`
4. **Redémarrer le serveur**
5. **Vérifier dans Swagger UI**

---

## 🐛 Dépannage

### Swagger ne s'affiche pas

1. Vérifier que le serveur est démarré
2. Vérifier l'URL: `http://localhost:8000/api/docs`
3. Vérifier les logs du serveur
4. Vérifier la configuration dans `backend/config/swagger.js`

### Authentification ne fonctionne pas

1. Vérifier le format du token: `Bearer TOKEN` ou juste `TOKEN`
2. Vérifier que le token n'est pas expiré
3. Vérifier que le token est valide
4. Essayer de se reconnecter

### Erreurs CORS

Si vous testez depuis un autre domaine:
1. Vérifier la configuration CORS dans `backend/app.js`
2. Ajouter votre domaine dans `CORS_ORIGIN`
3. Redémarrer le serveur

---

## 📚 Ressources

### Documentation Officielle

- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)

### Outils Utiles

- **Postman**: Import de la spec OpenAPI
- **Insomnia**: Support OpenAPI
- **Redoc**: Documentation alternative
- **Swagger Editor**: Éditeur en ligne

---

## ✅ Checklist d'Utilisation

- [ ] Accès à Swagger UI fonctionnel
- [ ] Authentification JWT configurée
- [ ] Test d'un endpoint GET réussi
- [ ] Test d'un endpoint POST réussi
- [ ] Import dans Postman réussi
- [ ] Compréhension des schémas
- [ ] Utilisation de la recherche

---

*Pour plus d'informations, consultez [Documentation API](./API_DOCUMENTATION.md)*

