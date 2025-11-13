import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { paymentService } from '../../services';

const PayPalSuccess = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId') || params.get('paymentId');
  const paypalToken = params.get('token') || params.get('paypalOrderId');
  const paymentIdParam = params.get('paymentId');
  const reloadTimerRef = useRef(null);
  const hasClickedRef = useRef(false);

  const [confirmationState, setConfirmationState] = useState({
    loading: false,
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
            error: "Identifiant PayPal manquant dans l'URL.",
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
            error: 'Identifiant du paiement introuvable.',
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
          'Erreur lors de la confirmation PayPal.';
        setConfirmationState({
          loading: false,
          error: message,
          success: false,
        });
      }
    };

    confirmPayment();
  }, [orderId, paypalToken, paymentIdParam, params]);

  // Rechargement automatique après 5 secondes ou immédiatement après un clic
  useEffect(() => {
    // Ne démarrer le timer que si le paiement est confirmé avec succès
    if (!confirmationState.success) {
      return;
    }

    // Fonction pour recharger la page
    const reloadPage = () => {
      if (!hasClickedRef.current) {
        window.location.reload();
      }
    };

    // Démarrer le timer de 5 secondes
    reloadTimerRef.current = setTimeout(reloadPage, 5000);

    // Nettoyer le timer si le composant est démonté
    return () => {
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
      }
    };
  }, [confirmationState.success]);

  // Gestionnaire de clic pour les boutons
  const handleButtonClick = (e, targetPath) => {
    e.preventDefault();
    hasClickedRef.current = true;
    // Annuler le timer si un bouton est cliqué
    if (reloadTimerRef.current) {
      clearTimeout(reloadTimerRef.current);
    }
    // Recharger la page immédiatement, puis naviguer
    window.location.href = targetPath;
  };

  return (
    <div className="min-h-screen bg-[#f3f9e5] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <FiCheckCircle className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Paiement confirmé
          </h1>
          <p className="text-gray-600 mb-6">
            Merci ! Votre paiement a été validé avec succès via PayPal.
            {orderId && (
              <>
                {' '}
                Nous finalisons la commande <span className="font-semibold">{orderId}</span>.
              </>
            )}
          </p>

          {confirmationState.loading && (
            <div className="bg-blue-50 text-blue-700 text-sm rounded-xl p-4 mb-6">
              Confirmation de votre paiement en cours...
            </div>
          )}

          {confirmationState.error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-6">
              {confirmationState.error}
            </div>
          )}

          {confirmationState.success && (
            <div className="bg-green-50 text-green-700 text-sm rounded-xl p-4 mb-6">
              Votre paiement a été confirmé. Merci pour votre confiance !
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-5 text-left text-sm text-gray-600 mb-6">
            <p className="mb-2">
              {params.get('type') === 'subscription' 
                ? 'Vous recevrez un email de confirmation contenant tous les détails de votre souscription.'
                : 'Vous recevrez un email de confirmation contenant tous les détails de votre commande.'}
            </p>
            {params.get('type') !== 'subscription' && (
              <p>
                Si la commande n&apos;apparaît pas immédiatement dans votre historique, n&apos;hésitez pas à rafraîchir la page dans quelques instants.
              </p>
            )}
          </div>

          {params.get('type') !== 'subscription' && (
            <div className="flex flex-col md:flex-row md:justify-center gap-3">
              <button
                onClick={(e) => handleButtonClick(e, '/consumer/orders')}
                className="inline-flex items-center justify-center rounded-lg bg-harvests-green px-6 py-3 font-semibold text-white hover:bg-green-600 transition-colors"
              >
                Voir mes commandes
              </button>
              <button
                onClick={(e) => handleButtonClick(e, '/products')}
                className="inline-flex items-center justify-center rounded-lg border border-harvests-green px-6 py-3 font-semibold text-harvests-green hover:bg-green-50 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayPalSuccess;

