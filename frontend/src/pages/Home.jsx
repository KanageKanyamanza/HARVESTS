import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Users, Globe, ShoppingCart, Star, TrendingUp } from 'lucide-react';

const Home = () => {

  const features = [
    {
      icon: Leaf,
      title: 'Produits Frais',
      description: 'Directement des producteurs locaux à votre porte'
    },
    {
      icon: Users,
      title: 'Communauté',
      description: 'Connectez-vous avec des producteurs de toute l\'Afrique'
    },
    {
      icon: Globe,
      title: 'International',
      description: 'Disponible dans 6 pays africains'
    },
    {
      icon: ShoppingCart,
      title: 'Facile',
      description: 'Commandez en quelques clics'
    }
  ];

  const stats = [
    { label: 'Producteurs', value: '10,000+', icon: Users },
    { label: 'Produits', value: '50,000+', icon: Leaf },
    { label: 'Pays', value: '6', icon: Globe },
    { label: 'Avis', value: '4.9/5', icon: Star }
  ];

  const countries = [
    { name: 'Cameroun', flag: '🇨🇲', users: '2,500+' },
    { name: 'Sénégal', flag: '🇸🇳', users: '1,800+' },
    { name: 'Ghana', flag: '🇬🇭', users: '2,200+' },
    { name: 'Nigeria', flag: '🇳🇬', users: '3,500+' },
    { name: 'Kenya', flag: '🇰🇪', users: '1,900+' },
    { name: 'Côte d\'Ivoire', flag: '🇨🇮', users: '1,600+' }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative text-white" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #F4C542 100%)' }}>
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative container-xl py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-balance">
              L'Amazon des Produits Agricoles Africains
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
              Connectez-vous directement avec les producteurs locaux et découvrez les meilleurs produits agricoles d'Afrique
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/products"
                className="btn-lg font-semibold inline-flex items-center text-gray-900 hover:bg-gray-100"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                Découvrir les Produits
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="btn-lg border-2 font-semibold hover:bg-white"
                style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
              >
                Devenir Producteur
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: '#e8f5e8' }}>
                    <Icon className="h-6 w-6" style={{ color: '#4CAF50' }} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Pourquoi Choisir Harvests ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme conçue pour révolutionner l'agriculture africaine
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: '#4CAF50' }}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Présent dans 6 Pays Africains
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une communauté grandissante de producteurs et consommateurs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {countries.map((country, index) => (
              <div key={index} className="text-center card-hover p-6">
                <div className="text-4xl mb-3">{country.flag}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{country.name}</h3>
                <p className="text-sm text-gray-600">{country.users} utilisateurs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white" style={{ backgroundColor: '#4CAF50' }}>
        <div className="container-xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Prêt à Commencer ?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Rejoignez des milliers de producteurs et consommateurs qui font confiance à Harvests
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="btn-lg font-semibold inline-flex items-center text-gray-900 hover:bg-gray-100"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              Créer un Compte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/products"
              className="btn-lg border-2 font-semibold text-white hover:bg-white"
              style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
            >
              Explorer les Produits
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
