import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import SocialLinks from '../common/SocialLinks';
import logo from '../../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    myAccount: [
      { name: 'Mon Compte', href: '/consumer/dashboard' },
      { name: 'Historique', href: '/order-history' },
      { name: 'Panier', href: '/cart' },
      { name: 'Liste de souhaits', href: '/favorites' },
    ],
    help: [
      { name: 'Contact', href: '/contact' },
      { name: 'FAQs', href: '/help' },
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Politique de confidentialité', href: '/privacy' },
    ],
    categories: [
      { name: 'Fruits & Légumes', href: '/categories/fruits' },
      { name: 'Viande & Poisson', href: '/categories/meat' },
      { name: 'Pain & Boulangerie', href: '/categories/processed-foods' },
      { name: 'Beauté & Santé', href: '/categories/herbs' },
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
              Système de gestion des équipements<br />
              Concentrateur agricole
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Dakar, Sénégal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+221 771970713</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+44 7546756325</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@growthubb.space</span>
              </div>
            </div>
          </div>

          {/* Mon Compte */}
          <div>
            <h3 className="font-semibold text-base mb-4">Mon Compte</h3>
            <ul className="space-y-2">
              {footerLinks.myAccount.map((link) => (
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
              {footerLinks.categories.map((link) => (
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
        <div className="py-6 border-t border-gray-900 justify-center content-center text-center">
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
