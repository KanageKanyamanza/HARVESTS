# Tests End-to-End (E2E)

Ce dossier contient les tests end-to-end qui vérifient le fonctionnement complet de l'application, de l'ajout de produit à l'achat par un consommateur.

## Test: Ajout de produit et achat par consommateur

Le test `productAndOrder.test.js` vérifie le flux complet suivant :

1. **Création et authentification du producteur**
   - Inscription d'un producteur
   - Connexion et obtention du token

2. **Ajout d'un produit par le producteur**
   - Création d'un produit (Tomates Bio)
   - Vérification de la création
   - Récupération du produit créé

3. **Création et authentification du consommateur**
   - Inscription d'un consommateur
   - Connexion et obtention du token

4. **Estimation des coûts de commande**
   - Estimation des frais de livraison
   - Calcul du total

5. **Création d'une commande par le consommateur**
   - Création d'une commande avec le produit
   - Vérification de la commande créée
   - Liste des commandes du consommateur

6. **Vérification côté producteur**
   - Le producteur peut voir la commande

7. **Vérification de la cohérence des données**
   - Vérification du stock du produit
   - Vérification des liens entre commande, produit et consommateur

## Prérequis

- MongoDB doit être en cours d'exécution
- Les variables d'environnement doivent être configurées (voir `.env`)
- La base de données de test doit être accessible

## Exécution

### Exécuter tous les tests E2E

```bash
npm run test:e2e
```

### Exécuter un test spécifique

```bash
npm run test:e2e -- productAndOrder.test.js
```

### Exécuter avec verbose

```bash
npm run test:e2e -- --verbose
```

## Configuration

Le test utilise la variable d'environnement `DATABASE` ou `MONGODB_URI` pour se connecter à MongoDB. Si aucune n'est définie, il utilise par défaut `mongodb://localhost:27017/harvests-test`.

## Nettoyage

Le test nettoie automatiquement les données créées après l'exécution :
- Utilisateurs de test (producteur et consommateur)
- Produits de test
- Commandes de test

## Notes

- Le test nécessite une connexion MongoDB réelle (pas de mocks)
- Le timeout est fixé à 30 secondes pour permettre les opérations de base de données
- Les utilisateurs créés ont des emails uniques pour éviter les conflits

