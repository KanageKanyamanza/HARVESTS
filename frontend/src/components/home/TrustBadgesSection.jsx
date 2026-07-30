import React from 'react';
import { Truck, Headphones, ShieldCheck, RotateCcw, Sprout, Award } from 'lucide-react';

const TrustBadgesSection = () => {
  const badges = [
    {
      icon: Truck,
      title: 'Livraison Rapide & Suivie',
      description: 'Chaîne du froid et logistique directe du champ à votre porte',
      accent: 'from-[#1A5514] to-[#31BC2E]',
      iconColor: 'text-[#1A5514]',
      badgeBg: 'bg-emerald-50'
    },
    {
      icon: Award,
      title: 'Producteurs Certifiés',
      description: 'Récoltes 100% traçables sans intermédiaires inutiles',
      accent: 'from-[#004D40] to-[#00897B]',
      iconColor: 'text-[#004D40]',
      badgeBg: 'bg-teal-50'
    },
    {
      icon: ShieldCheck,
      title: 'Paiement 100% Sécurisé',
      description: 'Mobile Money (Orange, Wave, MTN), PayPal & Cartes',
      accent: 'from-[#B78103] to-[#FF9900]',
      iconColor: 'text-[#B78103]',
      badgeBg: 'bg-amber-50'
    },
    {
      icon: RotateCcw,
      title: 'Garantie Fraîcheur & Qualité',
      description: 'Remboursement ou remplacement garanti sous 48h',
      accent: 'from-[#1E3A8A] to-[#3B82F6]',
      iconColor: 'text-[#1E3A8A]',
      badgeBg: 'bg-blue-50'
    }
  ];

  return (
    <section className="my-6 px-0 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10" data-aos="fade-up">
      <div className="md:bg-white rounded-2xl md:shadow-agri-card md:border border-emerald-100/80 p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={index} 
                className={`group flex flex-col justify-start p-3 sm:p-4 transition-all duration-300 ${index !== 0 ? 'sm:pl-5 lg:pl-6' : ''}`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className={`flex-shrink-0 w-10 h-10 rounded-xl ${badge.badgeBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon className={`w-5 h-5 ${badge.iconColor}`} />
                  </div>
                  <h3 className="font-extrabold text-[#161D14] text-sm sm:text-base leading-snug">
                    {badge.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed w-full">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;

