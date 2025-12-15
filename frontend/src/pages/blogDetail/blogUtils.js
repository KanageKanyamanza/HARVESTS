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

// Convertir le Markdown en HTML
export const markdownToHtml = (markdown) => {
  if (!markdown || typeof markdown !== 'string') return '';
  
  // Si le contenu contient déjà des balises HTML structurées, le retourner tel quel
  // (détection simple : présence de balises HTML de bloc)
  if (markdown.match(/<(h[1-6]|p|div|ul|ol|li|article|section)[\s>]/i)) {
    return markdown;
  }
  
  let html = markdown;
  
  // Fonction pour échapper le HTML (sauf les balises déjà créées)
  const escapeHtml = (text) => {
    // Ne pas échapper si le texte contient déjà des balises HTML valides
    if (text.match(/<[^>]+>/)) {
      return text;
    }
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Diviser en lignes pour traiter ligne par ligne
  const lines = html.split('\n');
  const processedLines = [];
  let currentList = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Titres
    if (trimmedLine.match(/^###\s+/)) {
      if (inList) {
        processedLines.push(`<ul class="list-disc list-inside my-4">${currentList.map(item => `<li>${item}</li>`).join('')}</ul>`);
        currentList = [];
        inList = false;
      }
      processedLines.push(`<h3>${trimmedLine.replace(/^###\s+/, '')}</h3>`);
      continue;
    }
    if (trimmedLine.match(/^##\s+/)) {
      if (inList) {
        processedLines.push(`<ul class="list-disc list-inside my-4">${currentList.map(item => `<li>${item}</li>`).join('')}</ul>`);
        currentList = [];
        inList = false;
      }
      processedLines.push(`<h2>${trimmedLine.replace(/^##\s+/, '')}</h2>`);
      continue;
    }
    if (trimmedLine.match(/^#\s+/)) {
      if (inList) {
        processedLines.push(`<ul class="list-disc list-inside my-4">${currentList.map(item => `<li>${item}</li>`).join('')}</ul>`);
        currentList = [];
        inList = false;
      }
      processedLines.push(`<h1>${trimmedLine.replace(/^#\s+/, '')}</h1>`);
      continue;
    }
    
    // Listes à puces
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList) {
        inList = true;
        currentList = [];
      }
      currentList.push(bulletMatch[1]);
      continue;
    }
    
    // Si on sort de la liste
    if (inList && !bulletMatch && trimmedLine) {
      processedLines.push(`<ul class="list-disc list-inside my-4">${currentList.map(item => `<li>${item}</li>`).join('')}</ul>`);
      currentList = [];
      inList = false;
    }
    
    // Ligne vide = nouveau paragraphe
    if (!trimmedLine) {
      if (inList) {
        processedLines.push(`<ul class="list-disc list-inside my-4">${currentList.map(item => `<li>${item}</li>`).join('')}</ul>`);
        currentList = [];
        inList = false;
      }
      continue;
    }
    
    // Ligne normale (paragraphe)
    if (!inList && trimmedLine) {
      processedLines.push(trimmedLine);
    }
  }
  
  // Fermer la dernière liste si nécessaire
  if (inList && currentList.length > 0) {
    processedLines.push(`<ul class="list-disc list-inside my-4">${currentList.map(item => `<li>${item}</li>`).join('')}</ul>`);
  }
  
  // Rejoindre et traiter le formatage inline
  html = processedLines.join('\n\n');
  
  // Convertir les liens Markdown [texte](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 underline">$1</a>');
  
  // Convertir le gras **texte**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convertir l'italique *texte* (mais pas **texte**)
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Convertir les paragraphes
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';
    
    // Si c'est déjà un élément HTML de bloc, le laisser tel quel
    if (para.match(/^<(h[1-6]|ul|ol|li|p|div)/)) {
      return para;
    }
    
    // Sinon, créer un paragraphe
    return `<p class="mb-4">${para}</p>`;
  }).join('\n');
  
  // Préserver les sauts de ligne dans les paragraphes
  html = html.replace(/(<p[^>]*>)([^<]+)(<\/p>)/g, (match, open, content, close) => {
    // Remplacer les sauts de ligne par <br> dans le contenu
    const withBreaks = content.replace(/\n/g, '<br>');
    return open + withBreaks + close;
  });
  
  // Nettoyer les balises vides
  html = html.replace(/<p class="mb-4">\s*<\/p>/g, '');
  
  return html;
};

