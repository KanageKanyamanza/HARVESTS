import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

/**
 * Hook pour gérer les meta tags SEO selon la route actuelle
 */
export const useSEO = (customSEO = {}) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const baseUrl = (import.meta.env.VITE_FRONTEND_URL || 
    (typeof window !== 'undefined' ? window.location.origin : '') || 
    'https://www.harvests.site').replace(/\/$/, '');
  
  // Configuration SEO par route
  const routeSEO = useMemo(() => {
    const path = location.pathname;
    
    // Configuration par défaut
    const defaultSEO = {
      title: t('seo.default.title', 'Harvests | Marketplace agroalimentaire et logistique'),
      description: t('seo.default.description', 'Commandez des produits frais, travaillez avec des producteurs locaux et profitez d\'une logistique fiable avec Harvests.'),
      keywords: t('seo.default.keywords', 'Harvests, marketplace, produits frais, agriculture, logistique, Sénégal'),
      image: `${baseUrl}/logo.png`,
      canonical: `${baseUrl}${path}`
    };
    
    // Configuration spécifique par route
    const routeConfigs = {
      '/': {
        title: t('seo.home.title', 'Harvests | Marketplace agroalimentaire et logistique'),
        description: t('seo.home.description', 'Plateforme complète pour producteurs, restaurateurs et transporteurs. Circuits courts et livraisons rapides.'),
        keywords: t('seo.home.keywords', 'Harvests, marketplace, produits frais, circuits courts, logistique')
      },
      '/products': {
        title: t('seo.products.title', 'Produits | Harvests'),
        description: t('seo.products.description', 'Découvrez notre catalogue de produits frais et locaux. Fruits, légumes, viandes et bien plus encore.'),
        keywords: t('seo.products.keywords', 'produits frais, fruits, légumes, viandes, produits locaux')
      },
      '/blog': {
        title: t('seo.blog.title', 'Blog | Harvests'),
        description: t('seo.blog.description', 'Découvrez nos articles, actualités et ressources sur l\'agriculture, la logistique et les circuits courts.'),
        keywords: t('seo.blog.keywords', 'blog, articles, actualités, agriculture, logistique, circuits courts')
      },
      '/about': {
        title: t('seo.about.title', 'À propos | Harvests'),
        description: t('seo.about.description', 'Découvrez l\'histoire de Harvests, notre mission et notre vision pour transformer la chaîne alimentaire au Sénégal.'),
        keywords: t('seo.about.keywords', 'à propos, mission, vision, histoire, Harvests')
      },
      '/a-propos': {
        title: t('seo.about.title', 'À propos | Harvests'),
        description: t('seo.about.description', 'Découvrez l\'histoire de Harvests, notre mission et notre vision pour transformer la chaîne alimentaire au Sénégal.'),
        keywords: t('seo.about.keywords', 'à propos, mission, vision, histoire, Harvests')
      },
      '/contact': {
        title: t('seo.contact.title', 'Contact | Harvests'),
        description: t('seo.contact.description', 'Contactez-nous pour toute question ou demande d\'information. Notre équipe est à votre disposition.'),
        keywords: t('seo.contact.keywords', 'contact, support, assistance, Harvests')
      },
      '/help': {
        title: t('seo.faq.title', 'FAQ | Harvests'),
        description: t('seo.faq.description', 'Trouvez les réponses aux questions fréquemment posées sur Harvests, nos services et notre plateforme.'),
        keywords: t('seo.faq.keywords', 'FAQ, questions fréquentes, aide, support')
      },
      '/terms': {
        title: t('seo.terms.title', 'Conditions d\'utilisation | Harvests'),
        description: t('seo.terms.description', 'Consultez nos conditions générales d\'utilisation de la plateforme Harvests.'),
        keywords: t('seo.terms.keywords', 'conditions d\'utilisation, CGU, termes, Harvests')
      },
      '/privacy': {
        title: t('seo.privacy.title', 'Politique de confidentialité | Harvests'),
        description: t('seo.privacy.description', 'Découvrez comment Harvests protège vos données personnelles et respecte votre vie privée.'),
        keywords: t('seo.privacy.keywords', 'confidentialité, protection des données, RGPD, vie privée')
      },
      '/pricing': {
        title: t('seo.pricing.title', 'Tarifs | Harvests'),
        description: t('seo.pricing.description', 'Découvrez nos tarifs et plans pour producteurs, restaurateurs et transporteurs.'),
        keywords: t('seo.pricing.keywords', 'tarifs, prix, plans, abonnements, Harvests')
      },
      '/loyalty': {
        title: t('seo.loyalty.title', 'Programme de fidélité | Harvests'),
        description: t('seo.loyalty.description', 'Rejoignez notre programme de fidélité et bénéficiez d\'avantages exclusifs.'),
        keywords: t('seo.loyalty.keywords', 'fidélité, programme, avantages, points, Harvests')
      },
      '/producers': {
        title: t('seo.producers.title', 'Producteurs | Harvests'),
        description: t('seo.producers.description', 'Découvrez nos producteurs locaux et leurs produits frais de qualité.'),
        keywords: t('seo.producers.keywords', 'producteurs, agriculteurs, produits locaux, circuits courts')
      },
      '/transformers': {
        title: t('seo.transformers.title', 'Transformateurs | Harvests'),
        description: t('seo.transformers.description', 'Découvrez nos transformateurs et leurs produits transformés de qualité.'),
        keywords: t('seo.transformers.keywords', 'transformateurs, transformation, produits transformés')
      },
      '/logistics': {
        title: t('seo.logistics.title', 'Logistique | Harvests'),
        description: t('seo.logistics.description', 'Trouvez des transporteurs et exportateurs fiables pour vos livraisons.'),
        keywords: t('seo.logistics.keywords', 'logistique, transporteurs, exportateurs, livraisons')
      },
      '/categories': {
        title: t('seo.categories.title', 'Catégories | Harvests'),
        description: t('seo.categories.description', 'Parcourez nos catégories de produits : fruits, légumes, viandes, produits transformés et plus encore.'),
        keywords: t('seo.categories.keywords', 'catégories, produits, fruits, légumes, viandes')
      }
    };
    
    // Trouver la configuration pour la route actuelle
    const routeConfig = routeConfigs[path] || defaultSEO;
    
    // Fusionner avec la configuration personnalisée
    return {
      ...defaultSEO,
      ...routeConfig,
      ...customSEO,
      canonical: customSEO.canonical || `${baseUrl}${path}`
    };
  }, [location.pathname, t, baseUrl, customSEO]);
  
  return routeSEO;
};

