import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const useSEO = (customSEO = {}) => {
  const location = useLocation();
  const { t } = useTranslation("seo");

  const baseUrl = (
    import.meta.env.VITE_FRONTEND_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    'https://www.harvests.site'
  ).replace(/\/$/, '');

  const routeSEO = useMemo(() => {
    const path = location.pathname;

    const defaultSEO = {
      title: t('default.title', 'Harvests | Marketplace agroalimentaire et logistique'),
      description: t('default.description', "Commandez des produits frais, travaillez avec des producteurs locaux et profitez d'une logistique fiable avec Harvests."),
      keywords: t('default.keywords', 'Harvests, marketplace, produits frais, agriculture, logistique, Sénégal'),
      image: `${baseUrl}/logo.png`,
      canonical: `${baseUrl}${path}`,
    };

    // Routes statiques
    const routeConfigs = {
      '/': {
        title: t('home.title', 'Harvests | Marketplace agroalimentaire et logistique'),
        description: t('home.description', 'Plateforme complète pour producteurs, restaurateurs et transporteurs. Circuits courts et livraisons rapides au Sénégal.'),
        keywords: t('home.keywords', 'Harvests, marketplace, produits frais, circuits courts, logistique, Sénégal'),
      },
      '/products': {
        title: t('products.title', 'Produits frais | Harvests'),
        description: t('products.description', 'Découvrez notre catalogue de produits frais et locaux. Fruits, légumes, viandes, produits transformés et bien plus encore.'),
        keywords: t('products.keywords', 'produits frais, fruits, légumes, viandes, produits locaux, acheter en ligne'),
      },
      '/categories': {
        title: t('categories.title', 'Catégories | Harvests'),
        description: t('categories.description', 'Parcourez nos catégories : fruits, légumes, viandes, céréales, produits transformés et bien plus encore.'),
        keywords: t('categories.keywords', 'catégories, produits, fruits, légumes, viandes, céréales'),
      },
      '/producers': {
        title: t('producers.title', 'Producteurs locaux | Harvests'),
        description: t('producers.description', 'Découvrez nos producteurs locaux et leurs produits frais de qualité directement depuis leur exploitation.'),
        keywords: t('producers.keywords', 'producteurs, agriculteurs, produits locaux, circuits courts, ferme'),
      },
      '/producteurs': {
        title: t('producers.title', 'Producteurs locaux | Harvests'),
        description: t('producers.description', 'Découvrez nos producteurs locaux et leurs produits frais de qualité directement depuis leur exploitation.'),
        keywords: t('producers.keywords', 'producteurs, agriculteurs, produits locaux, circuits courts, ferme'),
      },
      '/transformers': {
        title: t('transformers.title', 'Transformateurs | Harvests'),
        description: t('transformers.description', 'Découvrez nos transformateurs et leurs produits transformés de qualité : conserves, jus, huiles et plus.'),
        keywords: t('transformers.keywords', 'transformateurs, transformation, produits transformés, conserves'),
      },
      '/vendeurs': {
        title: t('vendeurs.title', 'Vendeurs | Harvests'),
        description: t('vendeurs.description', 'Découvrez les vendeurs de la plateforme Harvests et leurs produits disponibles à la vente.'),
        keywords: t('vendeurs.keywords', 'vendeurs, marchands, boutiques, Harvests'),
      },
      '/restaurateurs': {
        title: t('restaurateurs.title', 'Restaurateurs | Harvests'),
        description: t('restaurateurs.description', "Partenaires restaurateurs de Harvests — découvrez les professionnels de la restauration qui s'approvisionnent en circuits courts."),
        keywords: t('restaurateurs.keywords', 'restaurateurs, restaurants, cuisine, approvisionnement'),
      },
      '/logistics': {
        title: t('logistics.title', 'Logistique & Exportation | Harvests'),
        description: t('logistics.description', 'Trouvez des transporteurs et exportateurs fiables pour vos livraisons locales et internationales.'),
        keywords: t('logistics.keywords', 'logistique, transporteurs, exportateurs, livraisons, export'),
      },
      '/blog': {
        title: t('blog.title', 'Blog | Harvests'),
        description: t('blog.description', "Actualités, conseils agricoles et ressources sur l'agriculture, la logistique et les circuits courts en Afrique."),
        keywords: t('blog.keywords', 'blog, articles, actualités, agriculture, logistique, circuits courts'),
      },
      '/pricing': {
        title: t('pricing.title', 'Tarifs | Harvests'),
        description: t('pricing.description', 'Découvrez nos tarifs et plans pour producteurs, restaurateurs, transporteurs et exportateurs.'),
        keywords: t('pricing.keywords', 'tarifs, prix, plans, abonnements, Harvests'),
      },
      '/loyalty': {
        title: t('loyalty.title', 'Programme de fidélité | Harvests'),
        description: t('loyalty.description', 'Rejoignez notre programme de fidélité et bénéficiez de remises, points et avantages exclusifs.'),
        keywords: t('loyalty.keywords', 'fidélité, programme, avantages, points, remises, Harvests'),
      },
      '/about': {
        title: t('about.title', 'À propos | Harvests'),
        description: t('about.description', "Découvrez l'histoire de Harvests, notre mission et notre vision pour transformer la chaîne alimentaire en Afrique."),
        keywords: t('about.keywords', 'à propos, mission, vision, histoire, Harvests'),
      },
      '/a-propos': {
        title: t('about.title', 'À propos | Harvests'),
        description: t('about.description', "Découvrez l'histoire de Harvests, notre mission et notre vision pour transformer la chaîne alimentaire en Afrique."),
        keywords: t('about.keywords', 'à propos, mission, vision, histoire, Harvests'),
      },
      '/contact': {
        title: t('contact.title', 'Contact | Harvests'),
        description: t('contact.description', 'Contactez notre équipe pour toute question ou demande de partenariat.'),
        keywords: t('contact.keywords', 'contact, support, assistance, partenariat, Harvests'),
      },
      '/faq': {
        title: t('faq.title', 'Aide & FAQ | Harvests'),
        description: t('faq.description', 'Trouvez les réponses aux questions fréquentes sur la plateforme Harvests, la commande, la livraison et les paiements.'),
        keywords: t('faq.keywords', 'FAQ, aide, questions fréquentes, support, commande, livraison'),
      },
      '/terms': {
        title: t('terms.title', "Conditions d'utilisation | Harvests"),
        description: t('terms.description', "Consultez les conditions générales d'utilisation de la plateforme Harvests."),
        keywords: t('terms.keywords', "conditions d'utilisation, CGU, termes, Harvests"),
      },
      '/privacy': {
        title: t('privacy.title', 'Politique de confidentialité | Harvests'),
        description: t('privacy.description', 'Comment Harvests protège vos données personnelles et respecte votre vie privée conformément au RGPD.'),
        keywords: t('privacy.keywords', 'confidentialité, protection des données, RGPD, vie privée'),
      },
      '/invest': {
        title: t('invest.title', "Investir dans Harvests | Opportunités d'Investissement Agritech"),
        description: t('invest.description', "Rejoignez les investisseurs qui soutiennent la révolution agritech en Afrique. Contactez notre équipe pour recevoir le pitch deck et échanger sur les opportunités d'investissement."),
        keywords: t('invest.keywords', "investir agritech Afrique, opportunités investissement Sénégal, pitch deck Harvests, startup agroalimentaire, investisseurs impact"),
      },
    };

    // Matching routes dynamiques
    let dynamicSEO = null;

    if (/^\/products\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('productDetail.title', 'Produit | Harvests'),
        description: t('productDetail.description', 'Détails, prix et disponibilité du produit sur la marketplace Harvests.'),
        keywords: t('productDetail.keywords', 'produit, achat, prix, disponibilité, Harvests'),
      };
    } else if (/^\/blog\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('blogDetail.title', 'Article | Harvests Blog'),
        description: t('blogDetail.description', "Article du blog Harvests sur l'agriculture, la logistique et les circuits courts en Afrique."),
        keywords: t('blogDetail.keywords', 'article, blog, agriculture, logistique, Harvests'),
      };
    } else if (/^\/producers\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('producerProfile.title', 'Profil producteur | Harvests'),
        description: t('producerProfile.description', 'Découvrez ce producteur local, ses produits et ses disponibilités sur Harvests.'),
        keywords: t('producerProfile.keywords', 'producteur, profil, produits locaux, Harvests'),
      };
    } else if (/^\/transformers\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('transformerProfile.title', 'Profil transformateur | Harvests'),
        description: t('transformerProfile.description', 'Découvrez ce transformateur, ses produits et ses spécialités sur Harvests.'),
        keywords: t('transformerProfile.keywords', 'transformateur, profil, produits transformés, Harvests'),
      };
    } else if (/^\/restaurateurs\/[^/]+$/.test(path)) {
      dynamicSEO = {
        title: t('restaurateurProfile.title', 'Profil restaurateur | Harvests'),
        description: t('restaurateurProfile.description', 'Découvrez ce restaurateur partenaire de Harvests.'),
        keywords: t('restaurateurProfile.keywords', 'restaurateur, profil, restaurant, Harvests'),
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
