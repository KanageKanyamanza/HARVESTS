import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const PayPalCancel = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const reason = params.get('reason');
  const orderId = params.get('orderId');

  useEffect(() => {
    if (orderId) {
      sessionStorage.removeItem(`harvests_paypal_payment_${orderId}`);
      sessionStorage.removeItem(`harvests_paypal_confirmed_${orderId}`);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#fdf7f7] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FiXCircle className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Paiement annulé
          </h1>
          <p className="text-gray-600 mb-6">
            La tentative de paiement via PayPal a été interrompue.
            {reason && (
              <>
                {' '}
                Motif communiqué&nbsp;: <span className="font-semibold">{reason}</span>.
              </>
            )}
          </p>

          <div className="bg-gray-50 rounded-xl p-5 text-left text-sm text-gray-600 mb-6">
            <p className="mb-2">
              Aucun montant n&apos;a été débité. Vous pouvez réessayer de finaliser votre commande ou choisir un autre moyen de paiement.
            </p>
            <p>
              Besoin d&apos;aide ? Contactez notre support depuis la page de contact.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:justify-center gap-3">
            <Link
              to="/consumer/checkout"
              className="inline-flex items-center justify-center rounded-lg bg-harvests-green px-6 py-3 font-semibold text-white hover:bg-green-600 transition-colors"
            >
              Retourner au checkout
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-lg border border-harvests-green px-6 py-3 font-semibold text-harvests-green hover:bg-green-50 transition-colors"
            >
              Revenir à la boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalCancel;

