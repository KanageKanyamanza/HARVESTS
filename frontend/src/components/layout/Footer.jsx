import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import SocialLinks from '../common/SocialLinks';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services';
import logo from '../../assets/logo.png';

// Labels des catégories
const CATEGORY_LABELS = {
  'cereals': 'Céréales',
  'vegetables': 'Légumes',
  'fruits': 'Fruits',
  'legumes': 'Légumineuses',
  'tubers': 'Tubercules',
  'spices': 'Épices',
  'herbs': 'Herbes',
  'nuts': 'Noix',
  'seeds': 'Graines',
  'dairy': 'Produits Laitiers',
  'meat': 'Viande',
  'poultry': 'Volaille',
  'fish': 'Poisson',
  'processed-foods': 'Produits Transformés',
  'beverages': 'Boissons',
  'other': 'Autre'
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);

  const contactInfo = {
    phones: ['+221 771970713', '+221 774536704'],
    email: 'contact@harvests.site',
    address: 'Dakar, Sénégal',
  };

  // Liens dynamiques selon le type d'utilisateur
  const myAccountLinks = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { name: 'Connexion', href: '/login' },
        { name: 'Inscription', href: '/register' },
        { name: 'Panier', href: '/cart' },
      ];
    }

    const userType = user?.userType || 'consumer';
    const basePath = `/${userType}/dashboard`;

    const commonLinks = [
      { name: 'Mon Compte', href: basePath },
      { name: 'Profil', href: `${basePath}/profile` },
    ];

    switch (userType) {
      case 'producer':
      case 'transformer':
        return [
          ...commonLinks,
          { name: 'Mes Produits', href: `${basePath}/products` },
          { name: 'Mes Commandes', href: `${basePath}/orders` },
        ];
      case 'restaurateur':
        return [
          ...commonLinks,
          { name: 'Mes Plats', href: `${basePath}/dishes` },
          { name: 'Mes Commandes', href: `${basePath}/orders` },
        ];
      case 'transporter':
        return [
          ...commonLinks,
          { name: 'Mes Livraisons', href: `${basePath}/deliveries` },
        ];
      case 'consumer':
      default:
        return [
          ...commonLinks,
          { name: 'Mes Commandes', href: `${basePath}/orders` },
          { name: 'Panier', href: '/cart' },
          { name: 'Favoris', href: '/favorites' },
        ];
    }
  }, [isAuthenticated, user?.userType]);

  // Charger les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productService.getCategories();
        if (response.data.status === 'success') {
          setCategories(response.data.data || []);
        }
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
      }
    };
    loadCategories();
  }, []);

  // Rotation des catégories toutes les 3 minutes
  useEffect(() => {
    if (categories.length <= 4) return;
    
    const interval = setInterval(() => {
      setCategoryIndex(prev => (prev + 4) % categories.length);
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, [categories.length]);

  // Catégories à afficher (4 à la fois avec rotation)
  const displayedCategories = useMemo(() => {
    if (categories.length === 0) {
      // Fallback si pas de catégories chargées
      return [
        { name: 'Fruits', slug: 'fruits' },
        { name: 'Légumes', slug: 'vegetables' },
        { name: 'Céréales', slug: 'cereals' },
        { name: 'Viande', slug: 'meat' },
      ];
    }
    const result = [];
    for (let i = 0; i < 4 && i < categories.length; i++) {
      const idx = (categoryIndex + i) % categories.length;
      const cat = categories[idx];
      result.push({
        name: CATEGORY_LABELS[cat] || cat,
        slug: cat
      });
    }
    return result;
  }, [categories, categoryIndex]);

  const footerLinks = {
    help: [
      { name: 'À propos', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'FAQs', href: '/help' },
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Politique de confidentialité', href: '/privacy' },
    ],
  };


  // const countries = [
  //   { name: 'Cameroun', flag: '🇨🇲', code: 'CM' },
  //   { name: 'Sénégal', flag: '🇸🇳', code: 'SN' },
  //   { name: 'Ghana', flag: '🇬🇭', code: 'GH' },
  //   { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
  //   { name: 'Kenya', flag: '🇰🇪', code: 'KE' },
  //   { name: 'Côte d\'Ivoire', flag: '🇨🇮', code: 'CI' },
  // ];

  return (
    <footer className="bg-black text-white">
      <div className="container-xl">
        {/* Section principale */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img 
                src={logo} 
                alt="Harvests Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Produits agricoles frais.<br />
              Partenaires de la chaine de valeur alimentaire.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{contactInfo.address}</span>
              </div>
              {contactInfo.phones.map((phone, index) => (
                <a key={index} href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center space-x-2 hover:text-primary-500 transition-colors">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{phone}</span>
                </a>
              ))}
              <a href={`mailto:${contactInfo.email}`} className="flex items-center space-x-2 hover:text-primary-500 transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{contactInfo.email}</span>
              </a>
            </div>
          </div>

          {/* Mon Compte */}
          <div>
            <h3 className="font-semibold text-base mb-4">Mon Compte</h3>
            <ul className="space-y-2">
              {myAccountLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h3 className="font-semibold text-base mb-4">Aide</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="font-semibold text-base mb-4">Catégories</h3>
            <ul className="space-y-2">
              {displayedCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="text-gray-400 hover:text-primary-500 transition-colors text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section pays supportés */}
        {/* <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Disponible dans 6 pays africains
              </h4>
              <div className="flex flex-wrap gap-3">
                {countries.map((country) => (
                  <span
                    key={country.code}
                    className="inline-flex items-center space-x-1 text-xs text-gray-400"
                  >
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div> */}

        {/* Section copyright */}
        <div className="py-6 border-t border-gray-800 dark:border-gray-700 justify-center content-center text-center">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-500 text-sm">
                © {currentYear} Harvests. Tous droits réservés.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center content-center gap-2">
              <p className="text-gray-500 text-sm flex items-center">
                Un produit de <span className='text-yellow-200 font-bold ml-1'> UBB </span>
              </p>
              <SocialLinks 
                variant="minimal" 
                size="sm"
                className="justify-start"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
