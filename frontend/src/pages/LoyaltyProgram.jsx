import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Award, Gift, TrendingUp, Star, ArrowRight, ShoppingBag, Coins, Crown, Sparkles, Medal, Trophy, Gem, ShoppingCart } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';

const LoyaltyProgram = () => {
  const { isAuthenticated, userType } = useAuth();
  const tiers = [
    {
      name: 'Bronze',
      icon: <Medal className="w-12 h-12 mx-auto text-orange-500" />,
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
      icon: <Medal className="w-12 h-12 mx-auto text-gray-400" />,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-50',
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
      icon: <Trophy className="w-12 h-12 mx-auto text-yellow-500" />,
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
      icon: <Gem className="w-12 h-12 mx-auto text-purple-500" />,
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
    },
    {
      icon: Coins,
      title: 'Gagnez des Points',
      description: 'Recevez des points pour chaque achat (1 point = 100 XAF)',
    },
    {
      icon: Crown,
      title: 'Montez de Niveau',
      description: 'Plus vous gagnez de points, plus vous montez de niveau',
    },
    {
      icon: Sparkles,
      title: 'Profitez des Avantages',
      description: 'Utilisez vos points et profitez d\'avantages exclusifs',
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF6] pb-16">
      <SEOHead title="Programme de Fidélité | Harvests" description="Gagnez des points à chaque achat et débloquez des avantages exclusifs sur Harvests." />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">

        {/* Hero Banner Agritech */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-10 overflow-hidden shadow-xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Award className="w-4 h-4 text-[#31BC2E]" />
              <span>Récompenses & Fidélité</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Programme de Fidélité Harvests
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6">
              Gagnez des points à chaque achat et débloquez des avantages exclusifs, du producteur jusqu'à votre table.
            </p>

            {isAuthenticated && userType === 'consumer' ? (
              <Link
                to="/consumer/loyalty"
                className="inline-flex items-center px-6 py-3 bg-white text-[#1A5514] font-bold rounded-full hover:shadow-xl shadow-lg transition-all duration-300"
              >
                Voir Mon Programme
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#31BC2E] to-[#1A5514] text-white font-bold rounded-full hover:shadow-xl shadow-lg transition-all duration-300"
              >
                Rejoindre Maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-sm p-5 sm:p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14] mb-2">
              Comment ça marche ?
            </h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              Un programme simple et transparent pour récompenser votre fidélité
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center bg-[#F8FAF6] rounded-2xl p-5 border border-emerald-100/60">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 border border-emerald-200/60 rounded-2xl mb-3">
                    <Icon className="h-6 w-6 text-[#1A5514]" />
                  </div>
                  <div className="mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-[#1A5514] text-white rounded-full font-bold text-xs">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#161D14] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Niveaux de fidélité */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14] mb-2">
              Niveaux de Fidélité
            </h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              Progressez dans les niveaux et débloquez des avantages toujours plus intéressants
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tier.color}`}></div>

                <div className="text-center mb-5 mt-3">
                  <div className="flex justify-center mb-2">{tier.icon}</div>
                  <h4 className="font-extrabold text-xl mb-2 text-[#161D14]">{tier.name}</h4>
                  <div className={`inline-block px-3 py-1 ${tier.bgColor} rounded-full`}>
                    <p className="text-xs font-bold text-gray-700">{tier.points} points</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h5 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Avantages :</h5>
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#1A5514] mt-0.5 flex-shrink-0 text-sm">✓</span>
                      <span className="text-xs text-gray-600 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Avantages clés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-8">
          <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-sm p-5 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14] mb-6">
              Pourquoi rejoindre notre programme ?
            </h2>
            <div className="space-y-5">
              {[
                { icon: Gift, title: 'Récompenses Instantanées', desc: 'Vos points sont crédités immédiatement après chaque achat' },
                { icon: TrendingUp, title: 'Progression Claire', desc: 'Suivez facilement votre progression et vos points dans votre dashboard' },
                { icon: Star, title: 'Avantages Exclusifs', desc: 'Accédez à des offres et produits réservés aux membres fidèles' },
                { icon: Award, title: 'Sans Frais', desc: "L'adhésion au programme est gratuite et automatique" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-11 h-11 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#1A5514]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#161D14] mb-0.5">{title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#161D14] via-[#1A5514] to-[#0D330A] rounded-2xl p-5 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <h3 className="text-xl font-extrabold mb-5 relative z-10">Exemple de récompenses</h3>
            <div className="space-y-3 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">Achat de 50,000 XAF</span>
                  <ShoppingCart className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-xs text-white/70 leading-relaxed">
                  Niveau Bronze : +500 points<br/>
                  Niveau Platinum : +1,000 points
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">Économies possibles</span>
                  <Coins className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-xs text-white/70 leading-relaxed">
                  500 points = 500 XAF de réduction<br/>
                  1,000 points = 1,000 XAF de réduction
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">Bonus membre Platinum</span>
                  <Gem className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-xs text-white/70 leading-relaxed">
                  Livraison gratuite illimitée<br/>
                  Cadeaux mensuels premium
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-sm p-5 sm:p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14]">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
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
              <div key={index} className="bg-[#F8FAF6] rounded-2xl p-5 border border-emerald-100/60 hover:border-emerald-300 transition-colors">
                <h3 className="font-extrabold text-sm text-[#161D14] mb-1.5">
                  {faq.question}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-8 sm:p-12 text-center overflow-hidden shadow-xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">
              Prêt à commencer ?
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
              Rejoignez des milliers de membres qui profitent déjà du programme de fidélité Harvests
            </p>

            {isAuthenticated && userType === 'consumer' ? (
              <Link
                to="/consumer/loyalty"
                className="inline-flex items-center px-6 py-3 bg-white text-[#1A5514] font-bold rounded-full hover:shadow-xl shadow-lg transition-all duration-300"
              >
                Accéder à Mon Programme de Fidélité
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#31BC2E] to-[#1A5514] text-white font-bold rounded-full hover:shadow-xl shadow-lg transition-all duration-300"
                >
                  Créer un Compte
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 border border-white/30 transition-all duration-300"
                >
                  Se Connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;
