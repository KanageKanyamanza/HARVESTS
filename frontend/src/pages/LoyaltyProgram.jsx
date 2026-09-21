import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Award, Gift, TrendingUp, Star, ArrowRight, ShoppingBag, Coins, Crown, Sparkles, Medal, Trophy, Gem, ShoppingCart } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';

// Partie non textuelle des niveaux (les avantages viennent de loyalty.tiers dans les locales,
// dans le même ordre : Bronze, Silver, Gold, Platinum).
const TIER_META = [
  {
    name: 'Bronze',
    icon: <Medal className="w-12 h-12 mx-auto text-orange-500" />,
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    points: '0 - 999',
  },
  {
    name: 'Silver',
    icon: <Medal className="w-12 h-12 mx-auto text-gray-400" />,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    points: '1,000 - 4,999',
  },
  {
    name: 'Gold',
    icon: <Trophy className="w-12 h-12 mx-auto text-yellow-500" />,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    points: '5,000 - 9,999',
  },
  {
    name: 'Platinum',
    icon: <Gem className="w-12 h-12 mx-auto text-purple-500" />,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    points: '10,000+',
  },
];

const STEP_ICONS = [ShoppingBag, Coins, Crown, Sparkles];
const WHY_ICONS = [Gift, TrendingUp, Star, Award];

const LoyaltyProgram = () => {
  const { t } = useTranslation('public');
  const { isAuthenticated, userType } = useAuth();

  const tierTexts = t('loyalty.tiers', { returnObjects: true });
  const tiers = TIER_META.map((meta, index) => ({ ...meta, benefits: tierTexts[index].benefits }));
  const howItWorks = t('loyalty.steps', { returnObjects: true }).map((step, index) => ({
    ...step,
    icon: STEP_ICONS[index],
  }));
  const whyItems = t('loyalty.why', { returnObjects: true }).map((item, index) => ({
    ...item,
    icon: WHY_ICONS[index],
  }));
  const faqItems = t('loyalty.faq', { returnObjects: true });

  return (
    <div className="min-h-screen bg-[#F8FAF6] pb-16">
      <SEOHead />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">

        {/* Hero Banner Agritech */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-10 overflow-hidden shadow-xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Award className="w-4 h-4 text-[#31BC2E]" />
              <span>{t('loyalty.badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              {t('loyalty.heroTitle')}
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6">
              {t('loyalty.heroDescription')}
            </p>

            {isAuthenticated && userType === 'consumer' ? (
              <Link
                to="/consumer/loyalty"
                className="inline-flex items-center px-6 py-3 bg-white text-[#1A5514] font-bold rounded-full hover:shadow-xl shadow-lg transition-all duration-300"
              >
                {t('loyalty.viewMyProgram')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#31BC2E] to-[#1A5514] text-white font-bold rounded-full hover:shadow-xl shadow-lg transition-all duration-300"
              >
                {t('loyalty.joinNow')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-sm p-5 sm:p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14] mb-2">
              {t('loyalty.howTitle')}
            </h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              {t('loyalty.howSubtitle')}
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
              {t('loyalty.tiersTitle')}
            </h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              {t('loyalty.tiersSubtitle')}
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
                    <p className="text-xs font-bold text-gray-700">{tier.points} {t('loyalty.pointsSuffix')}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h5 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">{t('loyalty.benefitsLabel')}</h5>
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
              {t('loyalty.whyTitle')}
            </h2>
            <div className="space-y-5">
              {whyItems.map(({ icon: Icon, title, desc }) => (
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
            <h3 className="text-xl font-extrabold mb-5 relative z-10">{t('loyalty.examplesTitle')}</h3>
            <div className="space-y-3 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{t('loyalty.examplePurchase')}</span>
                  <ShoppingCart className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-xs text-white/70 leading-relaxed">
                  {t('loyalty.exampleBronze')}<br/>
                  {t('loyalty.examplePlatinum')}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{t('loyalty.exampleSavings')}</span>
                  <Coins className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-xs text-white/70 leading-relaxed">
                  {t('loyalty.exampleSavings1')}<br/>
                  {t('loyalty.exampleSavings2')}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{t('loyalty.exampleBonus')}</span>
                  <Gem className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-xs text-white/70 leading-relaxed">
                  {t('loyalty.exampleBonus1')}<br/>
                  {t('loyalty.exampleBonus2')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-sm p-5 sm:p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14]">
              {t('loyalty.faqTitle')}
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {faqItems.map((faq, index) => (
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
              {t('loyalty.ctaTitle')}
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
              {t('loyalty.ctaDescription')}
            </p>

            {isAuthenticated && userType === 'consumer' ? (
              <Link
                to="/consumer/loyalty"
                className="inline-flex items-center px-6 py-3 bg-white text-[#1A5514] font-bold rounded-full hover:shadow-xl shadow-lg transition-all duration-300"
              >
                {t('loyalty.ctaAccess')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#31BC2E] to-[#1A5514] text-white font-bold rounded-full hover:shadow-xl shadow-lg transition-all duration-300"
                >
                  {t('loyalty.ctaCreate')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 border border-white/30 transition-all duration-300"
                >
                  {t('loyalty.ctaLogin')}
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
