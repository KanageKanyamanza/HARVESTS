import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import DiscountBanner from '../../assets/images/Discount-Bannar.jpg';

const DiscountBannerSection = () => {
  return (
    <section className="py-20 bg-gray-100">
      <div className="container-xl">
        <div 
          className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] bg-cover bg-center"
          style={{ backgroundImage: `url(${DiscountBanner})` }}
        >
          {/* Overlay pour améliorer la lisibilité du texte (optionnel) */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Contenu - Prêt pour ajouter du texte */}
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            {/* Espace réservé pour le texte futur */}
            <div className="max-w-3xl mx-auto text-white">
              {/* Le texte sera ajouté ici plus tard */}
              {/* Exemple de structure commentée : */}
              {/* 
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                Super Discount
              </h2>
              <p className="text-xl md:text-2xl mb-8">
                Description de l'offre
              </p>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-600 transition-all duration-300"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscountBannerSection;

