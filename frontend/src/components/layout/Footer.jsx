import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import SocialLinks from '../common/SocialLinks';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'À propos de nous', href: '/about' },
      { name: 'Nous contacter', href: '/contact' },
      { name: 'Aide', href: '/help' },
    ],
    legal: [
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Politique de confidentialité', href: '/privacy' },
    ],
    categories: [
      { name: 'Céréales', href: '/categories/cereals' },
      { name: 'Légumes', href: '/categories/vegetables' },
      { name: 'Fruits', href: '/categories/fruits' },
      { name: 'Épices', href: '/categories/spices' },
    ]
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
    <footer className="bg-gray-900 text-white">
      <div className="container-xl">
        {/* Section principale */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-harvest rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="font-display font-bold text-xl">Harvests</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              L'Amazon des produits agricoles africains. Connecter les producteurs aux consommateurs à travers l'Afrique.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Yaoundé, Cameroun</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+237 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@harvests.africa</span>
              </div>
            </div>
          </div>

          {/* Liens entreprise */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories populaires */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Catégories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter et réseaux sociaux */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Restez connecté</h3>
            
            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3">
                Abonnez-vous à notre newsletter
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-lg transition-colors"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <p className="text-gray-400 text-sm mb-3">Suivez-nous</p>
              <SocialLinks 
                variant="minimal" 
                size="sm"
                className="justify-start"
              />
            </div>
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
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-400 text-sm">
                © {currentYear} Harvests. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-4">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm flex items-center">
                Fait avec <Heart className="h-4 w-4 mx-1 text-red-500" /> en <span className="font-semibold">Afrique</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
