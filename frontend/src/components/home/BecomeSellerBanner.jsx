import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiTrendingUp, FiGlobe, FiShield } from 'react-icons/fi';

const BecomeSellerBanner = () => {
  const { t } = useTranslation('public');
  return (
    <section className="bg-white mb-6 mx-4 sm:mx-6 lg:mx-8 max-w-[1500px] lg:mx-auto rounded-sm shadow-sm relative z-10 overflow-hidden" data-aos="fade-up">
      <div className="flex flex-col lg:flex-row bg-gradient-to-br from-green-50 to-emerald-100">

        {/* Text Content */}
        <div className="p-8 lg:p-12 lg:w-3/5 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('home.becomeSeller.title')}
          </h2>
          <p className="text-gray-700 text-lg mb-8 max-w-xl">
            {t('home.becomeSeller.subtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-start">
              <div className="bg-emerald-200 text-emerald-800 p-3 rounded-full mb-3">
                <FiGlobe className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{t('home.becomeSeller.globalReach.title')}</h4>
              <p className="text-sm text-gray-600">{t('home.becomeSeller.globalReach.description')}</p>
            </div>

            <div className="flex flex-col items-start">
              <div className="bg-emerald-200 text-emerald-800 p-3 rounded-full mb-3">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{t('home.becomeSeller.growth.title')}</h4>
              <p className="text-sm text-gray-600">{t('home.becomeSeller.growth.description')}</p>
            </div>

            <div className="flex flex-col items-start">
              <div className="bg-emerald-200 text-emerald-800 p-3 rounded-full mb-3">
                <FiShield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{t('home.becomeSeller.securePayment.title')}</h4>
              <p className="text-sm text-gray-600">{t('home.becomeSeller.securePayment.description')}</p>
            </div>
          </div>

          <div>
            <Link
              to="/register"
              className="inline-block bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-sm transition-colors text-center"
            >
              {t('home.becomeSeller.cta')}
            </Link>
          </div>
        </div>

        {/* Image Content */}
        <div className="lg:w-2/5 relative min-h-[300px] lg:min-h-full">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800&h=600"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay gradient for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-emerald-100/90 lg:from-emerald-100 via-transparent to-transparent"></div>
        </div>

      </div>
    </section>
  );
};

export default BecomeSellerBanner;
