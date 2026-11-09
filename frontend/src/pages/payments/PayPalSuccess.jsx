import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiHome, FiLoader, FiXCircle } from 'react-icons/fi';
import { paymentService } from '../../services';

const PayPalSuccess = () => {
  const location = useLocation();
  const { t } = useTranslation('public');
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId') || params.get('paymentId');
  const paypalToken = params.get('token') || params.get('paypalOrderId');
  const paymentIdParam = params.get('paymentId');
  const redirectTimerRef = useRef(null);
  const hasClickedRef = useRef(false);

  // Démarre en « chargement » : aucun succès n'est annoncé avant la réponse du serveur.
  const [confirmationState, setConfirmationState] = useState({
    loading: true,
    error: null,
    success: false,
  });

  useEffect(() => {
    const confirmPayment = async () => {
      const type = params.get('type');
      const planId = params.get('planId');
      
      // Pour les souscriptions, utiliser les clés spécifiques
      const storageKey = type === 'subscription' && planId
        ? `harvests_subscription_payment_${planId}`
        : orderId
        ? `harvests_paypal_payment_${orderId}`
        : null;
      const confirmedKey = type === 'subscription' && planId
        ? `harvests_subscription_confirmed_${planId}`
        : orderId
        ? `harvests_paypal_confirmed_${orderId}`
        : null;
      const paypalOrderKey = type === 'subscription' && planId
        ? `harvests_subscription_paypal_order_${planId}`
        : null;
      
      const alreadyConfirmed = confirmedKey
        ? sessionStorage.getItem(confirmedKey) === 'true'
        : false;

      // Essayer de récupérer le paypalOrderId depuis sessionStorage si absent de l'URL
      let finalPaypalToken = paypalToken;
      if (!finalPaypalToken && paypalOrderKey) {
        finalPaypalToken = sessionStorage.getItem(paypalOrderKey);
      }

      if (!finalPaypalToken) {
        if (alreadyConfirmed) {
          setConfirmationState({ loading: false, error: null, success: true });
        } else {
          setConfirmationState({
            loading: false,
            error: t('pricing.paypalSuccess.errors.missingPaypalId'),
            success: false,
          });
        }
        return;
      }

      let paymentId = paymentIdParam;
      if (!paymentId && storageKey) {
        paymentId = sessionStorage.getItem(storageKey);
      }

      if (!paymentId) {
        if (alreadyConfirmed) {
          setConfirmationState({ loading: false, error: null, success: true });
        } else {
          setConfirmationState({
            loading: false,
            error: t('pricing.checkout.errors.paymentIdMissing'),
            success: false,
          });
        }
        return;
      }

      if (alreadyConfirmed) {
        setConfirmationState({ loading: false, error: null, success: true });
        return;
      }

      setConfirmationState({ loading: true, error: null, success: false });

      try {
        await paymentService.confirmPayment(paymentId, {
          paypalOrderId: finalPaypalToken,
        });
        if (storageKey) {
          sessionStorage.removeItem(storageKey);
        }
        if (confirmedKey) {
          sessionStorage.setItem(confirmedKey, 'true');
        }
        if (paypalOrderKey) {
          sessionStorage.removeItem(paypalOrderKey);
        }
        setConfirmationState({ loading: false, error: null, success: true });
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          t('pricing.paypalSuccess.errors.confirmationFailed');
        setConfirmationState({
          loading: false,
          error: message,
          success: false,
        });
      }
    };

    confirmPayment();
    // `t` volontairement absent : changer de langue ne doit pas relancer une confirmation de paiement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paypalToken, paymentIdParam, location.search]);

  // Redirection automatique vers l'accueil après 5 secondes avec rechargement forcé
  useEffect(() => {
    // Ne démarrer le timer que si le paiement est confirmé avec succès
    if (!confirmationState.success) {
      return;
    }

    // Fonction pour rediriger vers l'accueil avec rechargement forcé
    const redirectToHome = () => {
      if (!hasClickedRef.current) {
        window.location.href = '/';
      }
    };

    // Démarrer le timer de 5 secondes
    redirectTimerRef.current = setTimeout(redirectToHome, 5000);

    // Nettoyer le timer si le composant est démonté
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [confirmationState.success]);

  // Gestionnaire de clic pour les boutons
  const handleButtonClick = (e, targetPath) => {
    e.preventDefault();
    hasClickedRef.current = true;
    // Annuler le timer si un bouton est cliqué
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    // Rediriger avec rechargement forcé
    window.location.href = targetPath;
  };

  const handleHomeClick = () => {
    hasClickedRef.current = true;
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    // Rediriger vers l'accueil avec rechargement forcé
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
          {confirmationState.success ? (
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <FiCheckCircle className="h-12 w-12" />
            </div>
          ) : confirmationState.error ? (
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiXCircle className="h-12 w-12" />
            </div>
          ) : (
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FiLoader className="h-12 w-12 animate-spin" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {confirmationState.success
              ? t('pricing.paypalSuccess.title')
              : confirmationState.error
                ? t('pricing.paypalSuccess.failedTitle')
                : t('pricing.paypalSuccess.pendingTitle')}
          </h1>
          {confirmationState.success && (
            <p className="text-gray-600 mb-6">
              {t('pricing.paypalSuccess.thanks')}
              {orderId && (
                <>
                  {' '}
                  {t('pricing.paypalSuccess.finalisingOrder')}{' '}
                  <span className="font-semibold">{orderId}</span>.
                </>
              )}
            </p>
          )}
          {confirmationState.error && (
            <p className="text-gray-600 mb-6">
              {t('pricing.paypalSuccess.failedHint')}
            </p>
          )}

          {confirmationState.loading && (
            <div className="bg-blue-50 text-blue-700 text-sm rounded-xl p-4 mb-6">
              {t('pricing.paypalSuccess.confirming')}
            </div>
          )}

          {confirmationState.error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-6">
              {confirmationState.error}
            </div>
          )}

          {confirmationState.success && (
            <div className="bg-green-50 text-green-700 text-sm rounded-xl p-4 mb-6">
              {t('pricing.paypalSuccess.confirmed')}
            </div>
          )}

          {confirmationState.success && (
            <div className="bg-gray-50 rounded-xl p-5 text-left text-sm text-gray-600 mb-6">
              <p className="mb-2">
                {params.get('type') === 'subscription'
                  ? t('pricing.paypalSuccess.subscriptionEmail')
                  : t('pricing.paypalSuccess.orderEmail')}
              </p>
              {params.get('type') !== 'subscription' && (
                <p>
                  {t('pricing.paypalSuccess.orderRefresh')}
                </p>
              )}
            </div>
          )}

          {/* Boutons aussi en cas d'échec : le client ne doit pas rester bloqué sur la page. */}
          {!confirmationState.loading && (
            <div className="flex flex-col md:flex-row md:justify-center gap-3">
              <button
                onClick={handleHomeClick}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-harvests-green px-6 py-3 font-semibold text-white hover:bg-green-600 transition-colors"
              >
                <FiHome className="h-5 w-5" />
                {t('pricing.paypalSuccess.backHome')}
              </button>
              {params.get('type') !== 'subscription' && (
                <>
                  <button
                    onClick={(e) => handleButtonClick(e, '/consumer/orders')}
                    className="inline-flex items-center justify-center rounded-lg border border-harvests-green px-6 py-3 font-semibold text-harvests-green hover:bg-green-50 transition-colors"
                  >
                    {t('pricing.paypalSuccess.viewOrders')}
                  </button>
                  <button
                    onClick={(e) => handleButtonClick(e, '/products')}
                    className="inline-flex items-center justify-center rounded-lg border border-harvests-green px-6 py-3 font-semibold text-harvests-green hover:bg-green-50 transition-colors"
                  >
                    {t('pricing.paypalSuccess.continueShopping')}
                  </button>
                </>
              )}
            </div>
          )}
          
          {confirmationState.success && (
            <p className="mt-4 text-sm text-gray-500">
              {t('pricing.paypalSuccess.redirect')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayPalSuccess;
