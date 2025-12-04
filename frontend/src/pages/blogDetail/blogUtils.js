// Utilitaires pour BlogDetailPage

import { 
  FileText,
  BookOpen,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

// Obtenir l'icône du type
export const getTypeIcon = (type) => {
  const typeIcons = {
    'article': FileText,
    'etude-cas': BookOpen,
    'tutoriel': TrendingUp,
    'actualite': Clock,
    'temoignage': Users
  };
  return typeIcons[type] || FileText;
};

// Obtenir le label du type
export const getTypeLabel = (type, t) => {
  const typeLabels = {
    'article': t('blog.types.article', 'Article'),
    'etude-cas': t('blog.types.etude-cas', 'Étude de cas'),
    'tutoriel': t('blog.types.tutoriel', 'Tutoriel'),
    'actualite': t('blog.types.actualite', 'Actualité'),
    'temoignage': t('blog.types.temoignage', 'Témoignage')
  };
  return typeLabels[type] || t('blog.types.article', 'Article');
};

// Obtenir le label de la catégorie
export const getCategoryLabel = (category, t) => {
  const categoryLabels = {
    'strategie': t('blog.categories.strategie', 'Stratégie'),
    'technologie': t('blog.categories.technologie', 'Technologie'),
    'finance': t('blog.categories.finance', 'Finance'),
    'ressources-humaines': t('blog.categories.ressources-humaines', 'Ressources Humaines'),
    'marketing': t('blog.categories.marketing', 'Marketing'),
    'operations': t('blog.categories.operations', 'Opérations'),
    'gouvernance': t('blog.categories.gouvernance', 'Gouvernance')
  };
  return categoryLabels[category] || category;
};

// Traduire un tag
export const translateTag = (tag, t) => {
  try {
    const translation = t(`blog.tags.${tag}`, tag);
    return translation;
  } catch (err) {
    console.log('Error translating tag:', err);
    return tag;
  }
};

// Normaliser les tags
export const normalizeTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.filter(tag => tag && tag.trim());
};

// Formater une date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Obtenir le contenu localisé
export const getLocalizedContent = (content, fallback = '', i18n) => {
  if (!content) return fallback;
  
  // Si c'est déjà une chaîne (ancien format), la retourner
  if (typeof content === 'string') return content;
  
  // Si c'est un objet bilingue, retourner selon la langue
  if (typeof content === 'object' && content !== null) {
    const currentLanguage = i18n?.language || 'fr';
    return content[currentLanguage] || content.fr || content.en || fallback;
  }
  
  return fallback;
};

