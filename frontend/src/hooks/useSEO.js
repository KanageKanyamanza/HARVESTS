import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const useSEO = (customSEO = {}) => {
  const location = useLocation();
  const { t } = useTranslation();

  const baseUrl = (
    import.meta.env.VITE_FRONTEND_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    'https://www.harvests.site'
  ).replace(/\/$/, '');

  const routeSEO = useMemo(() => {
    const path = location.pathname;

    const defaultSEO = {
      title: t('seo.default.title', 'Harvests | Marketplace agroalimentaire et logistique'),
      description: t('seo.default.description', "Commandez des produits frais, travaillez avec des producteurs locaux et profitez d'une logistique fiable avec Harvests."),
      keywords: t('seo.default.keywords', 'Harvests, marketplace, produits frais, agriculture, logistique, Sénégal'),
      image: `${baseUrl}/logo.png`,
      canonical: `${baseUrl}${path}`,
    };

    // Routes statiques
    const routeConfigs = {
      '/': {
        title: t('seo.home.title', 'Harvests | Marketplace agroalimentaire et logistique'),
        description: t('seo.home.description', 'Plateforme complète pour producteurs, restaurateurs et transporteurs. Circuits courts et livraisons rapides au Sénégal.'),
        keywords: t('seo.home.keywords', 'Harvests, marketplace, produits frais, circuits courts, logistique, Sénégal'),
      },
      '/products': {
        title: t('seo.products.title', 'Produits frais | Harvests'),
        description: t('seo.products.description', 'Découvrez notre catalogue de produits frais et locaux. Fruits, légumes, viandes, produits transformés et bien plus encore.'),
        keywords: t('seo.products.keywords', 'produits frais, fruits, légumes, viandes, produits locaux, acheter en ligne'),
      },
      '/categories': {
        title: t('seo.categories.title', 'Catégories | Harvests'),
        description: t('seo.categories.description', 'Parcourez nos catégories : fruits, légumes, viandes, céréales, produits transformés et bien plus encore.'),
        keywords: t('seo.categories.keywords', 'catégories, produits, fruits, légumes, viandes, céréales'),
      },
      '/producers': {
        title: t('seo.producers.title', 'Producteurs locaux | Harvests'),
        description: t('seo.producers.description', 'Découvrez nos producteurs locaux et leurs produits frais de qualité directement depuis leur exploitation.'),
        keywords: t('seo.producers.keywords', 'producteurs, agriculteurs, produits locaux, circuits courts, ferme'),
      },
      '/transformers': {
        title: t('seo.transformers.title', 'Transformateurs | Harvests'),
        description: t('seo.transformers.description', 'Découvrez nos transformateurs et leurs produits transformés de qualité : conserves, jus, huiles et plus.'),
        keywords: t('seo.transformers.keywords', 'transformateurs, transformation, produits transformés, conserves'),
      },
      '/vendeurs': {
        title: t('seo.vendeurs.title', 'Vendeurs | Harvests'),
        description: t('seo.vendeurs.description', 'Découvrez les vendeurs de la plateforme Harvests et leurs produits disponibles à la vente.'),
        keywords: t('seo.vendeurs.keywords', 'vendeurs, marchands, boutiques, Harvests'),
      },
      '/restaurateurs': {
        title: t('seo.restaurateurs.title', 'Restaurateurs | Harvests'),
        description: t('seo.restaurateurs.description', "Partenaires restaurateurs de Harvests — découvrez les professionnels de la restauration qui s'approvisionnent en circuits courts."),
        keywords: t('seo.restaurateurs.keywords', 'restaurateurs, restaurants, cuisine, approvisionnement'),
      },
      '/transporteurs-exportateurs': {
        title: t('seo.logistics.title', 'Logistique & Exportation | Harvests'),
        description: t('seo.logistics.description', 'Trouvez des transporteurs et exportateurs fiables pour vos livraisons locales et internationales.'),
        keywords: t('seo.logistics.keywords', 'logistique, transporteurs, exportateurs, livraisons, export'),
      },
      '/blog': {
        title: t('seo.blog.title', 'Blog | Harvests'),
        description: t('seo.blog.description', "Actualités, conseils agricoles et ressources sur l'agriculture, la logistique et les circuits courts en Afrique."),
        keywords: t('seo.blog.keywords', 'blog, articles, actualités, agriculture, logistique, circuits courts'),
      },
      '/pricing': {
        title: t('seo.pricing.title', 'Tarifs | Harvests'),
        description: t('seo.pricing.description', 'Découvrez nos tarifs et plans pour producteurs, restaurateurs, transporteurs et exportateurs.'),
        keywords: t('seo.pricing.keywords', 'tarifs, prix, plans, abonnements, Harvests'),
      },
      '/loyalty': {
        title: t('seo.loyalty.title', 'Programme de fidélité | Harvests'),
        description: t('seo.loyalty.description', 'Rejoignez notre programme de fidélité et bénéficiez de remises, points et avantages exclusifs.'),
        keywords: t('seo.loyalty.keywords', 'fidélité, programme, avantages, points, remises, Harvests'),
      },
      '/about': {
        title: t('seo.about.title', 'À propos | Harvests'),
        description: t('seo.about.description', "Découvrez l'histoire de Harvests, notre mission et notre vision pour transformer la chaîne alimentaire en Afrique."),
        keywords: t('seo.about.keywords', 'à propos, mission, vision, histoire, Harvests'),
      },
      '/a-propos': {
        title: t('seo.about.title', 'À propos | Harvests'),
        description: t('seo.about.description', "Découvrez l'histoire de Harvests, notre mission et notre vision pour transformer la chaîne alimentaire en Afrique."),
        keywords: t('seo.about.keywords', 'à propos, mission, vision, histoire, Harvests'),
      },
      '/contact': {
        title: t('seo.contact.title', 'Contact | Harvests'),
        description: t('seo.contact.description', 'Contactez notre équipe pour toute question ou demande de partenariat.'),
        keywords: t('seo.contact.keywords', 'contact, support, assistance, partenariat, Harvests'),
      },
      '/help': {
        title: t('seo.faq.title', 'Aide & FAQ | Harvests'),
        description: t('seo.faq.description', 'Trouvez les réponses aux questions fréquentes sur la plateforme Harvests, la commande, la livraison et les paiements.'),
        keywords: t('seo.faq.keywords', 'FAQ, aide, questions fréquentes, support, commande, livraison'),
      },
      '/terms': {
        title: t('seo.terms.title', "Conditions d'utilisation | Harvests"),
        description: t('seo.terms.description', "Consultez les conditions générales d'utilisation de la plateforme Harvests."),
        keywords: t('seo.terms.keywords', "conditions d'utilisation, CGU, termes, Harvests"),
      },
      '/privacy': {
        title: t('seo.privacy.title', 'Politique de confidentialité | Harvests'),
        description: t('seo.privacy.description', 'Comment Harvests protège vos données personnelles et respecte votre vie privée conformément au RGPD.'),
        keywords: t('seo.privacy.keywords', 'confidentialité, protection des données, RGPD, vie privée'),
      },
    };

    // Matching routes dynamiques
    let dynamicSEO = null;

    if (/^\/products\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('seo.productDetail.title', 'Produit | Harvests'),
        description: t('seo.productDetail.description', 'Détails, prix et disponibilité du produit sur la marketplace Harvests.'),
        keywords: t('seo.productDetail.keywords', 'produit, achat, prix, disponibilité, Harvests'),
      };
    } else if (/^\/blog\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('seo.blogDetail.title', 'Article | Harvests Blog'),
        description: t('seo.blogDetail.description', "Article du blog Harvests sur l'agriculture, la logistique et les circuits courts en Afrique."),
        keywords: t('seo.blogDetail.keywords', 'article, blog, agriculture, logistique, Harvests'),
      };
    } else if (/^\/producers\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('seo.producerProfile.title', 'Profil producteur | Harvests'),
        description: t('seo.producerProfile.description', 'Découvrez ce producteur local, ses produits et ses disponibilités sur Harvests.'),
        keywords: t('seo.producerProfile.keywords', 'producteur, profil, produits locaux, Harvests'),
      };
    } else if (/^\/transformers\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('seo.transformerProfile.title', 'Profil transformateur | Harvests'),
        description: t('seo.transformerProfile.description', 'Découvrez ce transformateur, ses produits et ses spécialités sur Harvests.'),
        keywords: t('seo.transformerProfile.keywords', 'transformateur, profil, produits transformés, Harvests'),
      };
    } else if (/^\/restaurateurs\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('seo.restaurateurProfile.title', 'Profil restaurateur | Harvests'),
        description: t('seo.restaurateurProfile.description', 'Découvrez ce restaurateur partenaire de Harvests.'),
        keywords: t('seo.restaurateurProfile.keywords', 'restaurateur, profil, restaurant, Harvests'),
      };
    }

    const staticConfig = routeConfigs[path];
    const routeConfig = dynamicSEO || staticConfig || defaultSEO;

    return {
      ...defaultSEO,
      ...routeConfig,
      ...customSEO,
      canonical: customSEO.canonical || `${baseUrl}${path}`,
    };
  }, [location.pathname, t, baseUrl, customSEO]);

  return routeSEO;
};
