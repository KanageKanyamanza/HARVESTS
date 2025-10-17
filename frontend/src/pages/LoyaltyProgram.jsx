import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Award, Gift, TrendingUp, Star, ArrowRight, ShoppingBag, Coins, Crown, Sparkles } from 'lucide-react';

const LoyaltyProgram = () => {
  const { isAuthenticated, userType } = useAuth();
  const tiers = [
    {
      name: 'Bronze',
      icon: '🥉',
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      points: '0 - 999',
      benefits: [
        '1 point pour chaque 100 XAF dépensé',
        'Réductions exclusives',
        'Accès aux ventes flash',
        'Newsletter mensuelle'
      ]
    },
    {
      name: 'Silver',
      icon: '🥈',
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-harvests-light',
      borderColor: 'border-gray-200',
      points: '1,000 - 4,999',
      benefits: [
        '1 point pour chaque 100 XAF dépensé',
        'Tous les avantages Bronze',
        'Livraison gratuite sur commandes > 10,000 XAF',
        'Accès prioritaire aux nouveaux produits',
        'Birthday rewards'
      ]
    },
    {
      name: 'Gold',
      icon: '🥇',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      points: '5,000 - 9,999',
      benefits: [
        '1.5 points pour chaque 100 XAF dépensé',
        'Tous les avantages Silver',
        'Livraison gratuite illimitée',
        'Cadeaux exclusifs trimestriels',
        'Retours gratuits',
        'Service client prioritaire'
      ]
    },
    {
      name: 'Platinum',
      icon: '💎',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      points: '10,000+',
      benefits: [
        '2 points pour chaque 100 XAF dépensé',
        'Tous les avantages Gold',
        'Support VIP 24/7',
        'Accès aux événements exclusifs',
        'Consultation gratuite avec producteurs',
        'Personnalisation des commandes',
        'Cadeaux mensuels premium'
      ]
    }
  ];

  const howItWorks = [
    {
      icon: ShoppingBag,
      title: 'Achetez',
      description: 'Faites vos achats normalement sur notre plateforme',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Coins,
      title: 'Gagnez des Points',
      description: 'Recevez des points pour chaque achat (1 point = 100 XAF)',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Crown,
      title: 'Montez de Niveau',
      description: 'Plus vous gagnez de points, plus vous montez de niveau',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Sparkles,
      title: 'Profitez des Avantages',
      description: 'Utilisez vos points et profitez d\'avantages exclusifs',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-harvests-light">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="container-xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-6">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Programme de Fidélité Harvests
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Gagnez des points à chaque achat et débloquez des avantages exclusifs
          </p>
          
          {/* Boutons différents selon l'état de connexion */}
          {isAuthenticated && userType === 'consumer' ? (
            <Link
              to="/consumer/loyalty"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Voir Mon Programme
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Rejoindre Maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un programme simple et transparent pour récompenser votre fidélité
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${step.bgColor} rounded-2xl mb-4`}>
                    <Icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  <div className="mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-500 text-white rounded-full font-bold text-sm mb-2">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Niveaux de fidélité */}
      <section className="py-20 bg-harvests-light">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Niveaux de Fidélité
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Progressez dans les niveaux et débloquez des avantages toujours plus intéressants
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl p-6 border-2 ${tier.borderColor} shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${tier.color}`}></div>
                
                <div className="text-center mb-6 mt-4">
                  <div className="text-6xl mb-3">{tier.icon}</div>
                  <h4 className="font-bold text-2xl mb-2 text-gray-900">{tier.name}</h4>
                  <div className={`inline-block px-4 py-1 ${tier.bgColor} rounded-full`}>
                    <p className="text-sm font-semibold text-gray-700">{tier.points} points</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-semibold text-sm text-gray-900 mb-3">Avantages :</h5>
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1 flex-shrink-0">✓</span>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages clés */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Pourquoi rejoindre notre programme ?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Gift className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Récompenses Instantanées</h3>
                    <p className="text-gray-600">Vos points sont crédités immédiatement après chaque achat</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Progression Claire</h3>
                    <p className="text-gray-600">Suivez facilement votre progression et vos points dans votre dashboard</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Avantages Exclusifs</h3>
                    <p className="text-gray-600">Accédez à des offres et produits réservés aux membres fidèles</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Sans Frais</h3>
                    <p className="text-gray-600">L'adhésion au programme est gratuite et automatique</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Exemple de récompenses</h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Achat de 50,000 XAF</span>
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div className="text-sm text-white/80">
                    Niveau Bronze : +500 points<br/>
                    Niveau Platinum : +1,000 points
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Économies possibles</span>
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-sm text-white/80">
                    500 points = 500 XAF de réduction<br/>
                    1,000 points = 1,000 XAF de réduction
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Bonus membre Platinum</span>
                    <span className="text-2xl">💎</span>
                  </div>
                  <div className="text-sm text-white/80">
                    Livraison gratuite illimitée<br/>
                    Cadeaux mensuels premium
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-harvests-light">
        <div className="container-xl max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Comment gagner des points ?',
                answer: 'Vous gagnez automatiquement des points à chaque achat. Le nombre de points dépend de votre niveau : Bronze et Silver (1 pt/100 XAF), Gold (1.5 pts/100 XAF), Platinum (2 pts/100 XAF).'
              },
              {
                question: 'Comment utiliser mes points ?',
                answer: 'Lors du checkout, vous pouvez choisir d\'utiliser vos points. Chaque point vaut 1 XAF de réduction sur votre commande. Vous décidez du nombre de points à utiliser.'
              },
              {
                question: 'Les points expirent-ils ?',
                answer: 'Les points sont valables pendant 12 mois à partir de la date d\'acquisition. Vous recevrez une notification par email 30 jours avant leur expiration.'
              },
              {
                question: 'Comment monter de niveau ?',
                answer: 'Votre niveau est automatiquement mis à jour en fonction de votre solde de points actuel : Bronze (0-999), Silver (1000-4999), Gold (5000-9999), Platinum (10000+).'
              },
              {
                question: 'Puis-je perdre mon niveau ?',
                answer: 'Votre niveau dépend de votre solde de points actuel. Si vous utilisez beaucoup de points et que votre solde descend en dessous du seuil, vous pouvez changer de niveau.'
              },
              {
                question: 'Y a-t-il des frais pour rejoindre ?',
                answer: 'Non, le programme de fidélité est totalement gratuit. Vous êtes automatiquement inscrit dès votre première commande en tant que membre Bronze.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="container-xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de membres qui profitent déjà du programme de fidélité Harvests
          </p>
          
          {/* Boutons différents selon l'état de connexion */}
          {isAuthenticated && userType === 'consumer' ? (
            <Link
              to="/consumer/loyalty"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Accéder à Mon Programme de Fidélité
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:bg-gray-100 shadow-xl transition-all duration-300"
              >
                Créer un Compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 border-2 border-white transition-all duration-300"
              >
                Se Connecter
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LoyaltyProgram;

