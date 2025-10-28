import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import DiscountBanner from '../../assets/images/Discount-Bannar.jpg';
import harvestIntroVideo from '../../assets/videos/harvestintro.mp4';

const DiscountBannerSection = () => {
  return (
    <section id="why-harvests" className="py-20 bg-harvests-light">
      <div className="container-xl">
        {/* En-tête de la section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Pourquoi choisir Harvests ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez notre vision et notre engagement pour une agriculture durable et connectée
          </p>
        </div>

        {/* Conteneur principal avec image de fond et vidéo à droite */}
        <div className="relative rounded-3xl overflow-hidden min-h-[600px] md:h-[500px] bg-cover bg-center shadow-2xl"
             style={{ backgroundImage: `url(${DiscountBanner})` }}>
          {/* Overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Contenu en deux colonnes */}
          <div className="relative h-full flex flex-col md:flex-row py-4">
            {/* Colonne gauche - Contenu textuel */}
            <div className="flex-1 flex flex-col justify-center p-6 md:p-12 text-white">
              <div className="max-w-lg">
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  Votre Partenaire Agricole de Confiance
                </h3>
                <p className="text-lg md:text-xl mb-8 text-white/90">
                  Rejoignez une communauté qui valorise la qualité, la durabilité et la connexion directe entre producteurs et consommateurs.
                </p>
                
                {/* Points clés */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm">🌱</span>
                    </div>
                    <span className="text-lg">Agriculture durable et respectueuse</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm">🤝</span>
                    </div>
                    <span className="text-lg">Connexion directe producteur-consommateur</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm">⭐</span>
                    </div>
                    <span className="text-lg">Qualité garantie et produits frais</span>
                  </div>
                </div>

                <Link
                  to="/products"
                  className="inline-flex items-center px-8 py-4 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Découvrir nos Produits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Colonne droite - Vidéo */}
            <div className="w-full md:w-1/2 lg:w-2/5 p-4 md:p-8 flex items-center">
              <div className="relative w-full h-[280px] md:h-full rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                  onError={(e) => {
                    console.error('Erreur de chargement de la vidéo:', e);
                  }}
                >
                  <source src={harvestIntroVideo} type="video/mp4" />    
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscountBannerSection;

