# 🌍 Guide API Bilingue Harvests

## Vue d'ensemble

Harvests supporte maintenant **2 langues** : **Français (FR)** et **Anglais (EN)** pour une expansion internationale en Afrique.

## 🔧 Utilisation

### 1. Détection automatique de la langue

L'API détecte automatiquement la langue préférée via :

1. **Paramètre URL** : `?lang=en` ou `?lang=fr`
2. **Cookie** : `harvests_lang=en`
3. **Header Accept-Language** : `Accept-Language: en-US,en;q=0.9`
4. **Par défaut** : Français (FR)

### 2. Exemples de requêtes

#### Inscription en anglais
```bash
POST /api/v1/auth/signup?lang=en
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "password": "password123",
  "userType": "producer",
  "preferredLanguage": "en",
  "country": "GH"
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Registration successful! Please check your email.",
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "userType": "producer",
      "preferredLanguage": "en"
    }
  },
  "language": "en"
}
```

#### Inscription en français
```bash
POST /api/v1/auth/signup?lang=fr
Content-Type: application/json

{
  "firstName": "Marie",
  "lastName": "Dupont",
  "email": "marie@example.com",
  "password": "motdepasse123",
  "userType": "producer",
  "preferredLanguage": "fr",
  "country": "SN"
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Inscription réussie ! Veuillez vérifier votre email.",
  "data": {
    "user": {
      "id": "...",
      "firstName": "Marie",
      "lastName": "Dupont",
      "email": "marie@example.com",
      "userType": "producer",
      "preferredLanguage": "fr"
    }
  },
  "language": "fr"
}
```

### 3. Produits multilingues

#### Création d'un produit bilingue
```bash
POST /api/v1/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": {
    "fr": "Tomates Bio de Thiès",
    "en": "Organic Tomatoes from Thiès"
  },
  "description": {
    "fr": "Tomates biologiques cultivées dans la région de Thiès, Sénégal. Produit frais et naturel.",
    "en": "Organic tomatoes grown in the Thiès region, Senegal. Fresh and natural product."
  },
  "shortDescription": {
    "fr": "Tomates bio fraîches du Sénégal",
    "en": "Fresh organic tomatoes from Senegal"
  },
  "category": "vegetables",
  "price": 2500,
  "currency": "XOF"
}
```

#### Récupération d'un produit en anglais
```bash
GET /api/v1/products/product-id?lang=en
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "product": {
      "name": "Organic Tomatoes from Thiès",
      "description": "Organic tomatoes grown in the Thiès region, Senegal. Fresh and natural product.",
      "shortDescription": "Fresh organic tomatoes from Senegal",
      "price": 2500,
      "currency": "XOF"
    }
  },
  "language": "en"
}
```

## 🌍 Support Mondial

- **Pays par défaut :** 🇸🇳 Sénégal
- **Saisie libre :** Les utilisateurs peuvent saisir n'importe quel pays
- **Détection automatique :** Configuration régionale basée sur le nom du pays
- **Langues supportées :** Français, Anglais, Portugais, Arabe
- **Devises :** Détection automatique selon le pays (XOF, XAF, USD, GHS, NGN, KES, etc.)

### Exemples de pays supportés
- **Afrique francophone :** Sénégal, Cameroun, Côte d'Ivoire, Mali, Burkina Faso, etc.
- **Afrique anglophone :** Ghana, Nigeria, Kenya, Ouganda, Tanzanie, etc.
- **Afrique lusophone :** Angola, Mozambique, Guinée-Bissau, etc.
- **Afrique arabophone :** Maroc, Algérie, Tunisie, Égypte, etc.
- **Autres continents :** France, États-Unis, Canada, Brésil, etc.

## 📧 Emails automatiques bilingues

Les emails sont automatiquement envoyés dans la langue préférée de l'utilisateur :

- **Email de bienvenue**
- **Vérification d'email**
- **Réinitialisation de mot de passe**
- **Confirmation de commande**
- **Notifications de livraison**

### Exemple d'email français
```
Sujet: Bienvenue sur Harvests !
Bonjour Marie,
Bienvenue dans la famille Harvests...
```

### Exemple d'email anglais
```
Subject: Welcome to Harvests!
Hello John,
Welcome to the Harvests family...
```

## 🔤 Types d'utilisateurs traduits

| Type | Français | Anglais |
|------|----------|---------|
| producer | Producteur | Producer |
| transformer | Transformateur | Processor |
| consumer | Consommateur | Consumer |
| restaurateur | Restaurateur | Restaurant Owner |
| exporter | Exportateur | Exporter |
| transporter | Transporteur | Transporter |

## 🏷️ Catégories de produits traduites

| Catégorie | Français | Anglais |
|-----------|----------|---------|
| cereals | Céréales | Cereals |
| vegetables | Légumes | Vegetables |
| fruits | Fruits | Fruits |
| tubers | Tubercules | Tubers |
| legumes | Légumineuses | Legumes |
| spices | Épices | Spices |
| processed | Produits transformés | Processed Products |

## 🛠️ Configuration développeur

### Variables d'environnement
```bash
# Langue par défaut
DEFAULT_LANGUAGE=fr

# Langues supportées
SUPPORTED_LANGUAGES=fr,en

# Détection automatique
AUTO_DETECT_LANGUAGE=true
```

### Headers recommandés
```bash
# Pour forcer une langue
Accept-Language: en-US,en;q=0.9,fr;q=0.8

# Cookie de langue (défini automatiquement)
Cookie: harvests_lang=en
```

## 🚀 Avantages

1. **Expansion internationale** facilitée
2. **Expérience utilisateur** adaptée par région
3. **Conformité locale** (devises, formats)
4. **SEO multilingue** pour le futur frontend
5. **Emails personnalisés** par langue
6. **API unifiée** avec détection automatique

---

**🌍 Harvests : L'Amazon agricole africain, maintenant multilingue !**
