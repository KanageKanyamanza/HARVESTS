/**
 * Gestion du contexte de conversation et apprentissage des préférences
 * Phase 1 : Contexte de Conversation et Apprentissage des Préférences
 */

// Stockage du contexte de conversation dans sessionStorage
const CONTEXT_KEY = 'chatbot_conversation_context';
const PREFERENCES_KEY = 'chatbot_user_preferences';
const MAX_CONTEXT_HISTORY = 10; // Nombre maximum de messages à garder en contexte

/**
 * Structure du contexte de conversation
 */
export const ConversationContext = {
  // Messages précédents (derniers N messages)
  messages: [],
  
  // Sujets abordés dans la conversation
  topics: [],
  
  // Intentions détectées précédemment
  previousIntents: [],
  
  // Recherches effectuées
  searches: [],
  
  // Produits/vendeurs mentionnés
  mentionedProducts: [],
  mentionedSellers: [],
  
  // Timestamp de la dernière interaction
  lastInteraction: null,
  
  // Session ID
  sessionId: null
};

/**
 * Structure des préférences utilisateur
 */
export const UserPreferences = {
  // Catégories préférées (basées sur les recherches)
  preferredCategories: [],
  
  // Types de questions fréquentes
  questionTypes: [],
  
  // Produits consultés fréquemment
  frequentlyViewed: [],
  
  // Préférences de recherche (mots-clés fréquents)
  searchPatterns: [],
  
  // Heures d'activité préférées
  activeHours: [],
  
  // Langue préférée
  preferredLanguage: 'fr'
};

/**
 * Initialiser ou récupérer le contexte de conversation
 */
export const getConversationContext = () => {
  try {
    const stored = sessionStorage.getItem(CONTEXT_KEY);
    if (stored) {
      const context = JSON.parse(stored);
      // Vérifier si la session est toujours valide (moins de 30 minutes)
      if (context.lastInteraction) {
        const lastInteraction = new Date(context.lastInteraction);
        const now = new Date();
        const diffMinutes = (now - lastInteraction) / (1000 * 60);
        
        if (diffMinutes > 30) {
          // Session expirée, réinitialiser
          return initializeContext();
        }
      }
      return context;
    }
    return initializeContext();
  } catch (error) {
    console.error('Erreur récupération contexte:', error);
    return initializeContext();
  }
};

/**
 * Initialiser un nouveau contexte
 */
export const initializeContext = () => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const context = {
    ...ConversationContext,
    sessionId,
    lastInteraction: new Date().toISOString()
  };
  saveConversationContext(context);
  return context;
};

/**
 * Sauvegarder le contexte de conversation
 */
export const saveConversationContext = (context) => {
  try {
    context.lastInteraction = new Date().toISOString();
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  } catch (error) {
    console.error('Erreur sauvegarde contexte:', error);
  }
};

/**
 * Ajouter un message au contexte
 */
export const addMessageToContext = (message, isBot = false, metadata = {}) => {
  const context = getConversationContext();
  
  // Ajouter le message
  context.messages.push({
    text: message,
    isBot,
    timestamp: new Date().toISOString(),
    ...metadata
  });
  
  // Garder seulement les N derniers messages
  if (context.messages.length > MAX_CONTEXT_HISTORY) {
    context.messages = context.messages.slice(-MAX_CONTEXT_HISTORY);
  }
  
  saveConversationContext(context);
  return context;
};

/**
 * Ajouter une recherche au contexte
 */
export const addSearchToContext = (searchTerm, results = []) => {
  const context = getConversationContext();
  
  context.searches.push({
    term: searchTerm,
    resultsCount: results.length,
    timestamp: new Date().toISOString()
  });
  
  // Garder seulement les 10 dernières recherches
  if (context.searches.length > 10) {
    context.searches = context.searches.slice(-10);
  }
  
  saveConversationContext(context);
  
  // Mettre à jour les préférences
  updatePreferencesFromSearch(searchTerm, results);
};

/**
 * Ajouter un sujet au contexte
 */
export const addTopicToContext = (topic) => {
  const context = getConversationContext();
  
  if (!context.topics.includes(topic)) {
    context.topics.push(topic);
  }
  
  // Garder seulement les 5 derniers sujets
  if (context.topics.length > 5) {
    context.topics = context.topics.slice(-5);
  }
  
  saveConversationContext(context);
};

/**
 * Ajouter une intention au contexte
 */
export const addIntentToContext = (intent, confidence = 1) => {
  const context = getConversationContext();
  
  context.previousIntents.push({
    intent,
    confidence,
    timestamp: new Date().toISOString()
  });
  
  // Garder seulement les 5 dernières intentions
  if (context.previousIntents.length > 5) {
    context.previousIntents = context.previousIntents.slice(-5);
  }
  
  saveConversationContext(context);
};

/**
 * Récupérer les préférences utilisateur
 */
export const getUserPreferences = () => {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { ...UserPreferences };
  } catch (error) {
    console.error('Erreur récupération préférences:', error);
    return { ...UserPreferences };
  }
};

/**
 * Sauvegarder les préférences utilisateur
 */
export const saveUserPreferences = (preferences) => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Erreur sauvegarde préférences:', error);
  }
};

/**
 * Mettre à jour les préférences à partir d'une recherche
 */
export const updatePreferencesFromSearch = (searchTerm, results = []) => {
  const preferences = getUserPreferences();
  
  // Extraire les catégories des résultats
  const categories = results
    .map(r => r.category)
    .filter(c => c)
    .reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  
  // Mettre à jour les catégories préférées
  Object.entries(categories).forEach(([category, count]) => {
    const existing = preferences.preferredCategories.find(c => c.name === category);
    if (existing) {
      existing.count += count;
      existing.lastUsed = new Date().toISOString();
    } else {
      preferences.preferredCategories.push({
        name: category,
        count,
        lastUsed: new Date().toISOString()
      });
    }
  });
  
  // Trier par fréquence
  preferences.preferredCategories.sort((a, b) => b.count - a.count);
  // Garder seulement les 10 premières
  preferences.preferredCategories = preferences.preferredCategories.slice(0, 10);
  
  // Ajouter le pattern de recherche
  const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  words.forEach(word => {
    const existing = preferences.searchPatterns.find(p => p.term === word);
    if (existing) {
      existing.count += 1;
      existing.lastUsed = new Date().toISOString();
    } else {
      preferences.searchPatterns.push({
        term: word,
        count: 1,
        lastUsed: new Date().toISOString()
      });
    }
  });
  
  // Trier et garder les 20 premiers
  preferences.searchPatterns.sort((a, b) => b.count - a.count);
  preferences.searchPatterns = preferences.searchPatterns.slice(0, 20);
  
  // Enregistrer l'heure d'activité
  const hour = new Date().getHours();
  const existingHour = preferences.activeHours.find(h => h.hour === hour);
  if (existingHour) {
    existingHour.count += 1;
  } else {
    preferences.activeHours.push({ hour, count: 1 });
  }
  preferences.activeHours.sort((a, b) => b.count - a.count);
  preferences.activeHours = preferences.activeHours.slice(0, 5);
  
  saveUserPreferences(preferences);
};

/**
 * Mettre à jour les préférences à partir d'une question
 */
export const updatePreferencesFromQuestion = (questionType) => {
  const preferences = getUserPreferences();
  
  const existing = preferences.questionTypes.find(q => q.type === questionType);
  if (existing) {
    existing.count += 1;
    existing.lastUsed = new Date().toISOString();
  } else {
    preferences.questionTypes.push({
      type: questionType,
      count: 1,
      lastUsed: new Date().toISOString()
    });
  }
  
  // Trier par fréquence
  preferences.questionTypes.sort((a, b) => b.count - a.count);
  preferences.questionTypes = preferences.questionTypes.slice(0, 10);
  
  saveUserPreferences(preferences);
};

/**
 * Obtenir des suggestions basées sur le contexte et les préférences
 */
export const getContextualSuggestions = () => {
  const context = getConversationContext();
  const preferences = getUserPreferences();
  const suggestions = [];
  
  // Suggestions basées sur les recherches récentes
  if (context.searches.length > 0) {
    const recentSearches = context.searches.slice(-3).reverse();
    recentSearches.forEach(search => {
      suggestions.push({
        type: 'recent_search',
        text: `Rechercher à nouveau "${search.term}"`,
        action: search.term,
        priority: 1
      });
    });
  }
  
  // Suggestions basées sur les catégories préférées
  if (preferences.preferredCategories.length > 0) {
    const topCategories = preferences.preferredCategories.slice(0, 3);
    topCategories.forEach(cat => {
      suggestions.push({
        type: 'preferred_category',
        text: `Voir les ${cat.name}`,
        action: `CATEGORY_${cat.name}`,
        priority: 2
      });
    });
  }
  
  // Suggestions basées sur les sujets de conversation
  if (context.topics.length > 0) {
    context.topics.forEach(topic => {
      suggestions.push({
        type: 'conversation_topic',
        text: `En savoir plus sur ${topic}`,
        action: `TOPIC_${topic}`,
        priority: 3
      });
    });
  }
  
  // Trier par priorité
  suggestions.sort((a, b) => a.priority - b.priority);
  
  return suggestions.slice(0, 5); // Retourner les 5 meilleures suggestions
};

/**
 * Obtenir le résumé du contexte pour améliorer les réponses
 */
export const getContextSummary = () => {
  const context = getConversationContext();
  const preferences = getUserPreferences();
  
  return {
    recentSearches: context.searches.slice(-3).map(s => s.term),
    currentTopics: context.topics,
    previousIntents: context.previousIntents.map(i => i.intent),
    preferredCategories: preferences.preferredCategories.slice(0, 3).map(c => c.name),
    messageCount: context.messages.length,
    sessionDuration: context.lastInteraction 
      ? Math.floor((new Date() - new Date(context.lastInteraction)) / 1000 / 60)
      : 0
  };
};

/**
 * Réinitialiser le contexte (nouvelle session)
 */
export const resetConversationContext = () => {
  sessionStorage.removeItem(CONTEXT_KEY);
  return initializeContext();
};

