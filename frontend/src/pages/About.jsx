import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, Target, Shield, Zap, Layers, Eye, Scale, Users, Lightbulb } from 'lucide-react';
import logo from '../assets/logo.png';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Ubuntu',
      subtitle: 'Humanité, Solidarité',
      description: 'Nous croyons en la force de la communauté et en l\'entraide mutuelle pour créer un impact positif.'
    },
    {
      icon: Target,
      title: 'Excellence',
      subtitle: '',
      description: 'Nous visons l\'excellence dans tout ce que nous faisons, en offrant des produits et services de la plus haute qualité.'
    },
    {
      icon: Shield,
      title: 'Intégrité & Transparence',
      subtitle: '',
      description: 'Nous agissons avec honnêteté, transparence et éthique dans toutes nos relations et transactions.'
    },
    {
      icon: Zap,
      title: 'Pragmatisme & Simplicité',
      subtitle: '',
      description: 'Nous privilégions des solutions simples, pratiques et efficaces qui répondent aux besoins réels.'
    },
    {
      icon: Layers,
      title: 'Discipline & Structure',
      subtitle: '',
      description: 'Nous maintenons une approche structurée et disciplinée pour assurer la qualité et la cohérence.'
    },
    {
      icon: Eye,
      title: 'Leadership & Vision',
      subtitle: '',
      description: 'Nous menons avec vision et innovation pour transformer l\'agriculture africaine.'
    },
    {
      icon: Scale,
      title: 'Justice & Équité',
      subtitle: '',
      description: 'Nous promouvons la justice et l\'équité pour tous les acteurs de la chaîne agricole.'
    },
    {
      icon: Users,
      title: 'Responsabilité & Impact',
      subtitle: '',
      description: 'Nous assumons nos responsabilités et mesurons notre impact positif sur les communautés et l\'environnement.'
    },
    {
      icon: Heart,
      title: 'Collaboration & Partenariat',
      subtitle: '',
      description: 'Nous croyons en la force du travail d\'équipe et des partenariats stratégiques pour atteindre nos objectifs.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation & Modernisation',
      subtitle: '',
      description: 'Nous embrassons l\'innovation et la modernisation pour améliorer continuellement nos services.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-harvests-light to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container-xl px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6" data-aos="fade-down">
              <img 
                src={logo} 
                alt="Harvests Logo" 
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-aos="fade-up" data-aos-delay="100">
              À Propos de Harvests
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8" data-aos="fade-up" data-aos-delay="200">
              L'Amazon des Produits Agricoles Africains
            </p>
            <p className="text-lg text-primary-200 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="300">
              Une plateforme e-commerce moderne connectant producteurs et consommateurs 
              à travers l'Afrique, avec support multilingue et paiements locaux.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container-xl px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center" data-aos="fade-up">
              Notre Mission
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 text-center space-y-4">
              <p data-aos="fade-up" data-aos-delay="100">
                Harvests a pour mission de révolutionner le commerce agricole en Afrique en créant 
                une plateforme digitale qui connecte directement les producteurs aux consommateurs, 
                en éliminant les intermédiaires et en garantissant des prix équitables pour tous.
              </p>
              <p data-aos="fade-up" data-aos-delay="200">
                Nous nous engageons à promouvoir l'agriculture durable, à soutenir les petits producteurs 
                et à faciliter l'accès aux produits agricoles frais et de qualité pour tous les Africains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-harvests-light">
        <div className="container-xl px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center" data-aos="fade-up">
              Nos Valeurs
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Ces principes fondamentaux guident chacune de nos actions et décisions
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                    data-aos="fade-up"
                    data-aos-delay={100 + (index * 50)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <h3 className="text-xl font-semibold text-gray-900">
                            {value.title}
                          </h3>
                        </div>
                        {value.subtitle && (
                          <p className="text-sm text-primary-600 font-medium mb-2">
                            {value.subtitle}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-white">
        <div className="container-xl px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center" data-aos="fade-up">
              Notre Vision
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 text-center space-y-4">
              <p data-aos="fade-up" data-aos-delay="100">
                Nous aspirons à devenir la plateforme de référence pour le commerce agricole en Afrique, 
                en connectant des millions de producteurs et de consommateurs à travers le continent.
              </p>
              <p data-aos="fade-up" data-aos-delay="200">
                Notre vision est de créer un écosystème agricole numérique prospère qui valorise les 
                producteurs locaux, améliore la sécurité alimentaire et contribue au développement 
                économique durable de l'Afrique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-xl px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" data-aos="fade-up">
              Rejoignez la Révolution Agricole
            </h2>
            <p className="text-xl text-primary-100 mb-8" data-aos="fade-up" data-aos-delay="100">
              Que vous soyez producteur, transformateur ou consommateur, 
              Harvests est votre partenaire de confiance.
            </p>
            <div className="flex flex-wrap justify-center gap-4" data-aos="fade-up" data-aos-delay="200">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Créer un compte
              </Link>
              <Link
                to="/contact"
                className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors border border-primary-500"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

