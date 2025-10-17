import React from 'react';
import { Truck, Headphones, ShieldCheck, RotateCcw } from 'lucide-react';

const TrustBadgesSection = () => {
  const badges = [
    {
      icon: Truck,
      title: 'Livraison Gratuite',
      description: 'Livraison gratuite sur toute commande',
      color: '#4CAF50'
    },
    {
      icon: Headphones,
      title: 'Support Client 24/7',
      description: 'Support disponible à tout moment',
      color: '#4CAF50'
    },
    {
      icon: ShieldCheck,
      title: 'Paiement 100% Sécurisé',
      description: 'Vos paiements sont protégés',
      color: '#4CAF50'
    },
    {
      icon: RotateCcw,
      title: 'Garantie Satisfait ou Remboursé',
      description: '30 jours de garantie sans question',
      color: '#4CAF50'
    }
  ];

  return (
    <section className="py-12 bg-harvests-light">
      <div className="container-xl">
        <div className="shadow-lg p-2 bg-white rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-4 p-1 rounded-lg hover:bg-harvests-light transition-colors"
              >
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${badge.color}15` }}
                >
                  <Icon 
                    className="w-6 h-6" 
                    style={{ color: badge.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;

