import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import heroBg from '../../assets/images/herobg.jpg';

const HeroSection = () => {
  return (
    <section 
      className="relative h-screen text-white bg-cover bg-center bg-no-repeat content-center justify-center items-center"
      style={{ 
        backgroundImage: `url(${heroBg})`
      }}
    >
      <div className="absolute bg-black inset-0 bg-pattern opacity-50"></div>
      <div className="relative container-xl py-20 lg:pt-24 lg:pb-32">
        <div className="text-left max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-balance">
           Your Harvests
           <br />
           Your Future
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl text-balance">
            Connectez-vous directement avec les producteurs locaux et découvrez les meilleurs produits agricoles d'Afrique
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-start items-start">
            <Link
              to="/products"
              className="btn-lg bg-white font-semibold inline-flex items-center text-gray-900 hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:ring-4 hover:ring-offset-2 hover:ring-primary-200 hover:ring-opacity-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              Découvrir les Produits
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/register"
              className="btn-lg bg-primary-500 font-semibold inline-flex items-center text-white hover:bg-primary-600 hover:ring-4 hover:ring-offset-2 hover:ring-primary-200 hover:ring-opacity-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              Devenir Producteur
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

