// Base de connaissances FAQ pour le chatbot
export const faqData = {
  // Catégories de questions
  categories: [
    { id: 'livraison', label: '🚚 Livraison', icon: 'truck' },
    { id: 'paiement', label: '💳 Paiement', icon: 'credit-card' },
    { id: 'commande', label: '📦 Commandes', icon: 'package' },
    { id: 'compte', label: '👤 Mon compte', icon: 'user' },
    { id: 'produits', label: '🥬 Produits', icon: 'shopping-bag' },
  ],

  // Questions/Réponses prédéfinies
  faqs: [
    // Livraison
    {
      id: 'livraison-delai',
      category: 'livraison',
      keywords: ['délai', 'temps', 'jours', 'quand', 'arriver', 'combien de temps'],
      question: 'Quels sont les délais de livraison ?',
      answer: 'Les délais de livraison varient selon votre zone géographique :\n• Dakar : 24-48h\n• Régions : 2-5 jours\n\nVous recevrez un SMS/email dès que votre commande sera expédiée.'
    },
    {
      id: 'livraison-frais',
      category: 'livraison',
      keywords: ['frais', 'coût', 'coute', 'prix', 'tarif', 'gratuit', 'combien coûte', 'combien coute', 'cher'],
      question: 'Combien coûte la livraison ?',
      answer: 'Les frais de livraison dépendent de votre localisation et du poids de la commande. Ils sont calculés automatiquement au moment du checkout. La livraison est gratuite pour les commandes supérieures à 50 000 FCFA.'
    },
    {
      id: 'livraison-suivi',
      category: 'livraison',
      keywords: ['suivre', 'suivi', 'où', 'commande', 'statut', 'tracking'],
      question: 'Comment suivre ma commande ?',
      answer: 'Pour suivre votre commande :\n1. Connectez-vous à votre compte\n2. Allez dans "Mes commandes"\n3. Cliquez sur la commande concernée\n\nVous pouvez aussi me demander directement "Où est ma commande ?" si vous êtes connecté.'
    },

    // Paiement
    {
      id: 'paiement-modes',
      category: 'paiement',
      keywords: ['payer', 'paiement', 'mode', 'moyen', 'carte', 'mobile', 'money', 'wave', 'orange'],
      question: 'Quels sont les modes de paiement acceptés ?',
      answer: 'Nous acceptons plusieurs modes de paiement :\n• Mobile Money (Orange Money, Wave, Free Money)\n• Cartes bancaires (Visa, Mastercard)\n• Paiement à la livraison (espèces)\n\nTous les paiements sont sécurisés.'
    },
    {
      id: 'paiement-securite',
      category: 'paiement',
      keywords: ['sécurisé', 'sécurité', 'confiance', 'fiable', 'arnaque'],
      question: 'Le paiement est-il sécurisé ?',
      answer: 'Oui, tous nos paiements sont 100% sécurisés. Nous utilisons des protocoles de chiffrement SSL et travaillons avec des partenaires de paiement certifiés. Vos données bancaires ne sont jamais stockées sur nos serveurs.'
    },
    {
      id: 'paiement-remboursement',
      category: 'paiement',
      keywords: ['remboursement', 'rembourser', 'annuler', 'retour', 'argent'],
      question: 'Comment obtenir un remboursement ?',
      answer: 'Pour demander un remboursement :\n1. Contactez-nous dans les 48h suivant la réception\n2. Expliquez le problème (produit endommagé, non conforme...)\n3. Nous traiterons votre demande sous 3-5 jours\n\nLe remboursement sera effectué via le même mode de paiement utilisé.'
    },
    {
      id: 'paiement-carte-rejetee',
      category: 'paiement',
      keywords: ['carte rejetée', 'carte rejeter', 'carte refusée', 'carte refuser', 'rejeter ma carte', 'refuser ma carte', 'carte bloquée', 'carte bloquer', 'carte invalide', 'carte expirée'],
      question: 'Ma carte a été rejetée, que faire ?',
      answer: 'Si votre carte a été rejetée, voici les solutions :\n\n1. **Vérifiez votre solde** : Assurez-vous d\'avoir suffisamment de fonds\n2. **Vérifiez les informations** : Numéro de carte, date d\'expiration et CVV corrects\n3. **Contactez votre banque** : La carte peut être bloquée pour sécurité\n4. **Essayez un autre mode** : Utilisez Mobile Money (Orange Money, Wave) ou paiement à la livraison\n\nSi le problème persiste, contactez notre support : contact@harvests.site'
    },
    {
      id: 'paiement-erreur',
      category: 'paiement',
      keywords: ['arrive pas a payer', 'arrive pas payer', 'j\'arrive pas', 'ne peut pas payer', 'impossible de payer', 'erreur paiement', 'paiement échoué', 'paiement echoue', 'problème paiement', 'probleme paiement', 'bug paiement'],
      question: 'Je n\'arrive pas à payer, que faire ?',
      answer: 'Si vous rencontrez un problème de paiement :\n\n1. **Vérifiez votre connexion internet**\n2. **Rafraîchissez la page** et réessayez\n3. **Vérifiez vos informations** de paiement\n4. **Essayez un autre navigateur** ou mode navigation privée\n5. **Utilisez Mobile Money** : Orange Money, Wave ou Free Money\n6. **Paiement à la livraison** : Choisissez cette option si disponible\n\nSi le problème persiste, contactez-nous : contact@harvests.site ou +221 77 197 07 13'
    },
    {
      id: 'paiement-probleme-technique',
      category: 'paiement',
      keywords: ['bug', 'erreur technique', 'ne fonctionne pas', 'marche pas', 'planté', 'bloqué'],
      question: 'Problème technique lors du paiement',
      answer: 'En cas de problème technique :\n\n1. **Rafraîchissez la page** (F5 ou Ctrl+R)\n2. **Videz le cache** de votre navigateur\n3. **Essayez un autre navigateur** (Chrome, Firefox, Safari)\n4. **Désactivez temporairement** les extensions de navigateur\n5. **Contactez le support** avec une capture d\'écran de l\'erreur\n\nEmail : contact@harvests.site\nTéléphone : +221 77 197 07 13'
    },

    // Commandes
    {
      id: 'commande-annuler',
      category: 'commande',
      keywords: ['annuler', 'annulation', 'supprimer', 'commande'],
      question: 'Comment annuler ma commande ?',
      answer: 'Vous pouvez annuler votre commande tant qu\'elle n\'est pas encore en préparation :\n1. Allez dans "Mes commandes"\n2. Sélectionnez la commande\n3. Cliquez sur "Annuler"\n\nSi la commande est déjà en préparation, contactez-nous rapidement.'
    },
    {
      id: 'commande-modifier',
      category: 'commande',
      keywords: ['modifier', 'changer', 'commande', 'adresse', 'quantité'],
      question: 'Puis-je modifier ma commande ?',
      answer: 'La modification est possible uniquement si la commande n\'est pas encore confirmée par le vendeur. Contactez-nous le plus rapidement possible pour toute modification.'
    },
    {
      id: 'commande-minimum',
      category: 'commande',
      keywords: ['minimum', 'commande', 'montant', 'minimum'],
      question: 'Y a-t-il un montant minimum de commande ?',
      answer: 'Non, il n\'y a pas de montant minimum de commande. Cependant, les frais de livraison peuvent rendre les petites commandes moins avantageuses. La livraison est gratuite à partir de 50 000 FCFA.'
    },

    // Compte
    {
      id: 'compte-creer',
      category: 'compte',
      keywords: ['créer', 'compte', 'inscription', 'inscrire', 'enregistrer'],
      question: 'Comment créer un compte ?',
      answer: 'Pour créer un compte :\n1. Cliquez sur "S\'inscrire" en haut de la page\n2. Choisissez votre type de compte (Consommateur, Producteur, etc.)\n3. Remplissez vos informations\n4. Validez votre email\n\nC\'est gratuit et rapide !'
    },
    {
      id: 'compte-vendeur',
      category: 'compte',
      keywords: ['vendre', 'vendeur', 'producteur', 'agriculteur', 'devenir'],
      question: 'Comment devenir vendeur ?',
      answer: 'Pour vendre sur Harvests :\n1. Créez un compte "Producteur" ou "Transformateur"\n2. Complétez votre profil et documents\n3. Attendez la validation de votre compte\n4. Ajoutez vos produits\n\nNous vous accompagnons dans la mise en ligne de vos produits !'
    },
    {
      id: 'compte-mot-de-passe',
      category: 'compte',
      keywords: ['mot de passe', 'oublié', 'réinitialiser', 'password', 'connexion'],
      question: 'J\'ai oublié mon mot de passe',
      answer: 'Pour réinitialiser votre mot de passe :\n1. Cliquez sur "Connexion"\n2. Cliquez sur "Mot de passe oublié ?"\n3. Entrez votre email\n4. Suivez le lien reçu par email\n\nLe lien est valable 10 minutes.'
    },
    {
      id: 'compte-connexion-probleme',
      category: 'compte',
      keywords: ['arrive pas connecter', 'arrive pas connexion', 'ne peut pas se connecter', 'impossible connexion', 'erreur connexion', 'bug connexion', 'problème connexion', 'probleme connexion'],
      question: 'Je n\'arrive pas à me connecter',
      answer: 'Si vous avez des difficultés de connexion :\n\n1. **Vérifiez vos identifiants** : Email et mot de passe corrects\n2. **Réinitialisez votre mot de passe** si oublié\n3. **Vérifiez votre email** : Vous devez valider votre compte\n4. **Videz le cache** de votre navigateur\n5. **Essayez un autre navigateur**\n\nSi le problème persiste, contactez-nous : contact@harvests.site'
    },

    // Produits
    {
      id: 'produits-qualite',
      category: 'produits',
      keywords: ['qualité', 'frais', 'bio', 'naturel', 'origine'],
      question: 'Comment garantissez-vous la qualité des produits ?',
      answer: 'Nous travaillons directement avec des producteurs locaux vérifiés. Chaque vendeur est validé avant de pouvoir vendre. Les produits sont contrôlés et les avis clients nous permettent de maintenir un haut niveau de qualité.'
    },
    {
      id: 'produits-disponibilite',
      category: 'produits',
      keywords: ['disponible', 'stock', 'rupture', 'quand'],
      question: 'Un produit est en rupture de stock, que faire ?',
      answer: 'Si un produit est en rupture :\n• Consultez les produits similaires d\'autres vendeurs\n• Contactez directement le vendeur pour connaître la date de réapprovisionnement\n• Ajoutez le produit en favoris pour être notifié'
    },

    // Livraison et livreurs
    {
      id: 'livraison-livreur',
      category: 'livraison',
      keywords: ['livreur', 'livreurs', 'transporteur', 'transporteurs', 'livrer', 'coursier'],
      question: 'Avez-vous des livreurs ?',
      answer: 'Oui ! Harvests dispose d\'un réseau de livreurs et transporteurs partenaires. Ils assurent la livraison de vos commandes dans tout le Sénégal. Vous pouvez suivre votre livraison en temps réel depuis votre espace client.'
    },
    {
      id: 'livraison-devenir-livreur',
      category: 'livraison',
      keywords: ['devenir livreur', 'travailler', 'emploi', 'job', 'coursier'],
      question: 'Comment devenir livreur ?',
      answer: 'Pour devenir livreur partenaire Harvests :\n1. Créez un compte "Transporteur"\n2. Renseignez vos informations et véhicule\n3. Définissez vos zones de livraison\n4. Attendez la validation\n\nVous pourrez ensuite accepter des livraisons et être rémunéré !'
    },

    // Tarifs et commissions
    {
      id: 'tarifs-commission',
      category: 'paiement',
      keywords: ['tarif', 'tarifs', 'commission', 'commissions', 'frais', 'pourcentage', 'prix'],
      question: 'Quels sont les tarifs et commissions ?',
      answer: 'Harvests prélève une commission sur chaque vente pour assurer le bon fonctionnement de la plateforme :\n• Producteurs/Transformateurs : commission sur les ventes\n• Livreurs : commission sur les livraisons\n• Acheteurs : pas de frais supplémentaires (hors livraison)\n\nContactez-nous pour plus de détails.'
    },
    {
      id: 'tarifs-gratuit',
      category: 'compte',
      keywords: ['gratuit', 'payant', 'abonnement', 'inscription gratuite', 'coût inscription'],
      question: 'L\'inscription est-elle gratuite ?',
      answer: 'Oui, l\'inscription sur Harvests est 100% gratuite pour tous les types de comptes (consommateur, producteur, transformateur, livreur). Vous ne payez rien pour créer votre compte et accéder à la plateforme.'
    },

    // Types de comptes
    {
      id: 'compte-types',
      category: 'compte',
      keywords: ['type', 'types', 'compte', 'profil', 'différence', 'consommateur', 'producteur', 'transformateur', 'restaurateur'],
      question: 'Quels sont les types de comptes ?',
      answer: 'Harvests propose plusieurs types de comptes :\n• Consommateur : pour acheter des produits\n• Producteur : pour vendre vos récoltes\n• Transformateur : pour vendre des produits transformés\n• Restaurateur : pour proposer des plats cuisinés\n• Transporteur : pour effectuer des livraisons\n• Exportateur : pour l\'export international'
    },

    // Sécurité
    {
      id: 'securite-donnees',
      category: 'compte',
      keywords: ['sécurité', 'données', 'confidentialité', 'privé', 'protection', 'rgpd'],
      question: 'Mes données sont-elles protégées ?',
      answer: 'Oui, la sécurité de vos données est notre priorité. Nous utilisons le chiffrement SSL, ne partageons jamais vos informations personnelles et respectons les normes de protection des données. Consultez notre politique de confidentialité pour plus de détails.'
    },

    // Application mobile
    {
      id: 'app-mobile',
      category: 'produits',
      keywords: ['application', 'mobile', 'app', 'téléphone', 'android', 'ios', 'iphone'],
      question: 'Avez-vous une application mobile ?',
      answer: 'Notre site web est entièrement responsive et fonctionne parfaitement sur mobile. Une application dédiée est en cours de développement et sera bientôt disponible sur Android et iOS !'
    },

    // Réclamations
    {
      id: 'reclamation',
      category: 'commande',
      keywords: ['réclamation', 'plainte', 'problème', 'litige', 'insatisfait', 'mauvais'],
      question: 'Comment faire une réclamation ?',
      answer: 'En cas de problème avec une commande :\n1. Allez dans "Mes commandes"\n2. Sélectionnez la commande concernée\n3. Cliquez sur "Signaler un problème"\n4. Décrivez votre réclamation\n\nNotre équipe vous répondra sous 24-48h.'
    },

    // Horaires
    {
      id: 'horaires',
      category: 'livraison',
      keywords: ['horaire', 'horaires', 'heure', 'ouvert', 'fermé', 'disponible'],
      question: 'Quels sont vos horaires ?',
      answer: 'La plateforme Harvests est accessible 24h/24, 7j/7. Les livraisons sont généralement effectuées entre 8h et 20h. Le service client est disponible du lundi au samedi de 8h à 18h.'
    },

    // Zones de livraison
    {
      id: 'zones-livraison',
      category: 'livraison',
      keywords: ['zone', 'zones', 'région', 'ville', 'livrez', 'couvrez', 'dakar', 'sénégal'],
      question: 'Dans quelles zones livrez-vous ?',
      answer: 'Nous livrons dans tout le Sénégal :\n• Dakar et banlieue : livraison rapide (24-48h)\n• Autres régions : 2-5 jours selon la distance\n\nLes zones de livraison dépendent aussi des vendeurs et transporteurs disponibles dans votre région.'
    },
  ],

  // Messages par défaut
  defaultMessages: {
    welcome: 'Bonjour ! 👋 Je suis l\'assistant Harvests. Comment puis-je vous aider ?\n\nVous pouvez me poser des questions sur :\n• La livraison\n• Les paiements\n• Vos commandes\n• Votre compte\n\nOu tapez votre question directement !',
    notUnderstood: 'Je n\'ai pas bien compris votre question. Pouvez-vous la reformuler ou choisir une catégorie ci-dessous ?',
    orderTrackingNotLoggedIn: 'Pour suivre votre commande, vous devez d\'abord vous connecter à votre compte.',
    orderNotFound: 'Je n\'ai pas trouvé de commande récente. Vérifiez le numéro de commande ou consultez la section "Mes commandes".',
    searchingProducts: 'Je recherche des produits pour vous...',
    noProductsFound: 'Aucun produit trouvé pour cette recherche.\n\nEssayez avec d\'autres mots-clés.',
    contactSupport: 'Pour une assistance personnalisée, vous pouvez nous contacter :\n• Email : contact@harvests.site\n• Téléphone : +221 77 197 07 13'
  },

  // Intentions spéciales (déclenchent des actions)
  intents: [
    {
      id: 'bot_capabilities',
      keywords: ['que peux tu faire', 'comment peux tu m\'aider', 'tu fais quoi', 'que sais tu faire', 'tes capacités', 'tu peux faire quoi', 'aide moi', 'comment m\'aider', 'peux tu m\'aider', 'tu peux m\'aider'],
      action: 'BOT_CAPABILITIES'
    },
    {
      id: 'greeting',
      keywords: ['bonjour', 'bonsoir', 'salut', 'hello', 'hi', 'coucou', 'hey'],
      action: 'GREETING'
    },
    {
      id: 'track_order',
      keywords: ['où est ma commande', 'suivi commande', 'ma commande', 'statut commande', 'tracking'],
      action: 'TRACK_ORDER'
    },
    {
      id: 'my_orders',
      keywords: ['mes commandes', 'historique commandes', 'commandes passées'],
      action: 'MY_ORDERS'
    },
    {
      id: 'my_cart',
      keywords: ['mon panier', 'panier', 'dans mon panier', 'contenu panier'],
      action: 'MY_CART'
    },
    {
      id: 'clear_cart',
      keywords: ['vider panier', 'vider mon panier', 'supprimer panier'],
      action: 'CLEAR_CART'
    },
    {
      id: 'my_favorites',
      keywords: ['mes favoris', 'favoris', 'produits favoris', 'liste favoris'],
      action: 'MY_FAVORITES'
    },
    {
      id: 'notifications',
      keywords: ['notifications', 'mes notifications', 'alertes', 'messages'],
      action: 'NOTIFICATIONS'
    },
    {
      id: 'promotions',
      keywords: ['promotion', 'promotions', 'promo', 'promos', 'réduction', 'soldes', 'offre'],
      action: 'PROMOTIONS'
    },
    {
      id: 'new_products',
      keywords: ['nouveauté', 'nouveautés', 'nouveau', 'nouveaux', 'quoi de neuf', 'dernier', 'récent'],
      action: 'NEW_PRODUCTS'
    },
    {
      id: 'suggestions',
      keywords: ['suggestion', 'suggestions', 'recommandation', 'recommander', 'conseiller', 'pour moi'],
      action: 'SUGGESTIONS'
    },
    {
      id: 'search_product',
      keywords: ['cherche', 'recherche', 'trouver', 'acheter', 'je veux', 'avez-vous', 'avez vous', 'y a-t-il', 'existe', 'vendez', 'vends', 'proposez', 'disponible'],
      action: 'SEARCH_PRODUCT'
    },
    {
      id: 'contact_support',
      keywords: ['parler', 'humain', 'agent', 'support', 'aide', 'contacter'],
      action: 'CONTACT_SUPPORT'
    }
  ]
};

// Fonction pour détecter les problèmes spécifiques dans le message
const detectSpecificIssues = (message) => {
  const msg = message.toLowerCase();
  
  // Détection de problèmes de carte
  if (msg.match(/\b(carte|card)\s+(rejet|rejeter|refus|refuser|bloqu|invalid|expir)/i) ||
      msg.match(/\b(rejet|rejeter|refus|refuser)\s+(carte|card|ma carte)/i)) {
    return 'paiement-carte-rejetee';
  }
  
  // Détection de problèmes de paiement généraux
  if (msg.match(/\b(arrive pas|ne peut pas|impossible|ne marche pas|ne fonctionne pas|bug|erreur|problème|probleme)\s+(a |de |le )?payer/i) ||
      msg.match(/\b(payer|paiement)\s+(ne|pas|échou|echoue|erreur|bug)/i)) {
    return 'paiement-erreur';
  }
  
  // Détection de problèmes techniques
  if (msg.match(/\b(bug|erreur technique|planté|bloqué|bloque|ne fonctionne pas|marche pas)/i)) {
    return 'paiement-probleme-technique';
  }
  
  return null;
};

// Fonction pour trouver la meilleure réponse
export const findBestAnswer = (userMessage) => {
  const message = userMessage.toLowerCase().trim();
  
  // Détecter d'abord les problèmes spécifiques (priorité haute)
  const specificIssue = detectSpecificIssues(message);
  if (specificIssue) {
    const faq = faqData.faqs.find(f => f.id === specificIssue);
    if (faq) {
      return { type: 'faq', faq: faq };
    }
  }
  
  // Utiliser la détection d'intentions améliorée avec scoring
  try {
    const { detectIntentWithScore } = require('../utils/chatbotImprovements');
    const intentMatch = detectIntentWithScore(message, faqData.intents);
    if (intentMatch && intentMatch.score >= 1) {
      return { 
        type: 'intent', 
        intent: intentMatch.intent.action, 
        data: intentMatch.intent,
        confidence: intentMatch.score
      };
    }
  } catch (error) {
    // Fallback sur la méthode basique si l'import échoue
    console.warn('Erreur import detectIntentWithScore, utilisation méthode basique:', error);
  }
  
  // Vérifier les intentions spéciales (fallback méthode basique si import échoue)
  for (const intent of faqData.intents) {
    for (const keyword of intent.keywords) {
      if (message.includes(keyword.toLowerCase())) {
        return { type: 'intent', intent: intent.action, data: intent, confidence: 1 };
      }
    }
  }
  
  // Chercher dans les FAQs avec scoring amélioré
  let bestMatch = null;
  let highestScore = 0;
  
  for (const faq of faqData.faqs) {
    let score = 0;
    let exactPhraseMatch = false;
    
    for (const keyword of faq.keywords) {
      const kw = keyword.toLowerCase();
      
      // Vérifier les correspondances exactes de phrases (priorité maximale)
      if (kw.includes(' ')) {
        // Phrase complète - correspondance exacte
        if (message.includes(kw)) {
          score += 5; // Score très élevé pour les phrases complètes
          exactPhraseMatch = true;
        }
      } else {
        // Mot simple
        // Vérifier si c'est un mot complet (pas juste une partie d'un autre mot)
        const wordBoundary = new RegExp(`\\b${kw}\\b`, 'i');
        if (wordBoundary.test(message)) {
          score += 2; // Score moyen pour les mots complets
        } else if (message.includes(kw)) {
          score += 1; // Score faible pour les correspondances partielles
        }
      }
    }
    
    // Bonus si plusieurs mots-clés correspondent (question plus spécifique)
    const matchingKeywords = faq.keywords.filter(kw => 
      message.includes(kw.toLowerCase())
    ).length;
    if (matchingKeywords > 1) {
      score += matchingKeywords * 0.5;
    }
    
    // Prioriser les FAQs spécifiques sur les générales
    if (faq.id.includes('erreur') || faq.id.includes('probleme') || faq.id.includes('rejetee')) {
      score += 2;
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }
  
  if (bestMatch && highestScore >= 1) {
    return { type: 'faq', faq: bestMatch };
  }
  
  return { type: 'unknown' };
};

export default faqData;


