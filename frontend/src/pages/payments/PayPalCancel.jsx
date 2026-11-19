import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiXCircle, FiHome } from 'react-icons/fi';

const PayPalCancel = () => {
  const { t } = useTranslation('public');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const reason = params.get('reason');
  const orderId = params.get('orderId');
  const redirectTimerRef = useRef(null);
  const hasClickedRef = useRef(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (orderId) {
      sessionStorage.removeItem(`harvests_paypal_payment_${orderId}`);
      sessionStorage.removeItem(`harvests_paypal_confirmed_${orderId}`);
    }
  }, [orderId]);

  // Redirection automatique vers l'accueil après 5 secondes avec rechargement forcé
  useEffect(() => {
    // Fonction pour rediriger vers l'accueil avec rechargement forcé
    const redirectToHome = () => {
      if (!hasClickedRef.current) {
        window.location.href = '/';
      }
    };

    // Démarrer le timer de 5 secondes
    redirectTimerRef.current = setTimeout(redirectToHome, 5000);

    // Compte à rebours
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Nettoyer les timers si le composant est démonté
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      clearInterval(countdownInterval);
    };
  }, []);

  const handleHomeClick = () => {
    hasClickedRef.current = true;
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    // Rediriger vers l'accueil avec rechargement forcé
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#fdf7f7] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FiXCircle className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {t('pricing.paypalCancel.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('pricing.paypalCancel.interrupted')}
            {reason && (
              <>
                {' '}
                {t('pricing.paypalCancel.reason')} <span className="font-semibold">{reason}</span>.
              </>
            )}
          </p>

          <div className="bg-gray-50 rounded-xl p-5 text-left text-sm text-gray-600 mb-6">
            <p className="mb-2">
              {t('pricing.paypalCancel.notCharged')}
            </p>
            <p>
              {t('pricing.paypalCancel.help')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:justify-center gap-3">
            <button
              onClick={handleHomeClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-harvests-green px-6 py-3 font-semibold text-white hover:bg-green-600 transition-colors"
            >
              <FiHome className="h-5 w-5" />
              {t('pricing.paypalCancel.backHome')}
            </button>
            <button
              onClick={() => { 
                hasClickedRef.current = true; 
                if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
                window.location.href = '/consumer/checkout';
              }}
              className="inline-flex items-center justify-center rounded-lg border border-harvests-green px-6 py-3 font-semibold text-harvests-green hover:bg-green-50 transition-colors"
            >
              {t('pricing.paypalCancel.backToCheckout')}
            </button>
            <button
              onClick={() => { 
                hasClickedRef.current = true; 
                if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
                window.location.href = '/products';
              }}
              className="inline-flex items-center justify-center rounded-lg border border-harvests-green px-6 py-3 font-semibold text-harvests-green hover:bg-green-50 transition-colors"
            >
              {t('pricing.paypalCancel.backToShop')}
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            {t('pricing.paypalCancel.redirect', { count: countdown })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayPalCancel;

