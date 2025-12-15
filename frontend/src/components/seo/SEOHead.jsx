import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Composant SEO réutilisable pour toutes les pages publiques
 * Gère automatiquement les meta tags, Open Graph, Twitter Cards, etc.
 */
const SEOHead = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  noindex = false,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
  articleAuthor,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const baseUrl = (import.meta.env.VITE_FRONTEND_URL || 
    (typeof window !== 'undefined' ? window.location.origin : '') || 
    'https://www.harvests.site').replace(/\/$/, '');
  
  // URL canonique par défaut
  const canonicalUrl = canonical || `${baseUrl}${location.pathname}`;
  
  // Titre par défaut
  const defaultTitle = 'Harvests | Marketplace agroalimentaire et logistique';
  const pageTitle = title ? `${title} | Harvests` : defaultTitle;
  
  // Description par défaut
  const defaultDescription = 'Commandez des produits frais, travaillez avec des producteurs locaux et profitez d\'une logistique fiable avec Harvests. Plateforme complète pour producteurs, restaurateurs et transporteurs.';
  const pageDescription = description || defaultDescription;
  
  // Image par défaut
  const defaultImage = `${baseUrl}/logo.png`;
  const pageImage = image || ogImage || defaultImage;
  
  // Open Graph
  const ogTitleValue = ogTitle || title || 'Harvests | Marketplace agroalimentaire et logistique';
  const ogDescriptionValue = ogDescription || description || defaultDescription;
  const ogImageValue = ogImage || image || defaultImage;
  
  // Twitter
  const twitterTitleValue = twitterTitle || title || ogTitleValue;
  const twitterDescriptionValue = twitterDescription || description || ogDescriptionValue;
  const twitterImageValue = twitterImage || image || ogImageValue;
  
  // Mots-clés par défaut
  const defaultKeywords = 'Harvests, marketplace, produits frais, agriculture, logistique, Sénégal, producteurs, restaurateurs, transporteurs, circuits courts, alimentation locale';
  const pageKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      {/* Langue */}
      <html lang={i18n.language || 'fr'} />
      
      {/* Meta tags de base */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={ogTitleValue} />
      <meta property="og:description" content={ogDescriptionValue} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageValue} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={i18n.language === 'en' ? 'en_US' : 'fr_FR'} />
      <meta property="og:site_name" content="Harvests" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitleValue} />
      <meta name="twitter:description" content={twitterDescriptionValue} />
      <meta name="twitter:image" content={twitterImageValue} />
      
      {/* Article (si type = article) */}
      {type === 'article' && (
        <>
          {articleAuthor && <meta property="article:author" content={articleAuthor} />}
          {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
          {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
          {articleSection && <meta property="article:section" content={articleSection} />}
          {articleTags && articleTags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#16a34a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Harvests" />
    </Helmet>
  );
};

export default SEOHead;

