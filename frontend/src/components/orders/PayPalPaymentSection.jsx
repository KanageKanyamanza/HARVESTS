import React, { useMemo } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { FiCreditCard, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';

const PayPalPaymentSection = ({
  user, paypalClientId, paypalCurrency, orderCurrency, showCurrencyNotice,
  paymentProcessing, paymentError, createPayPalOrder, handlePayPalApprove,
  handlePayPalCancel, handlePayPalError, handleFallbackPayment
}) => {
  const paypalOptions = useMemo(() => {
    if (!paypalClientId) return null;
    return {
      'client-id': paypalClientId,
      currency: paypalCurrency,
      components: 'buttons',
      'enable-funding': 'card',
      'disable-funding': 'credit,paylater,venmo',
      intent: 'capture'
    };
  }, [paypalClientId, paypalCurrency]);

  return (
    <div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6 mb-5 relative z-10">
      <h2 className="font-extrabold text-[#161D14] mb-4 flex items-center">
        <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5">
          <FiCreditCard className="h-4 w-4 text-[#1A5514]" />
        </span>
        PayPal ou Carte bancaire
      </h2>

      {user && (
        <div className="mb-5 bg-gray-50 border border-gray-100 rounded-xl p-4 relative z-10">
          <h3 className="text-xs font-bold text-[#161D14] mb-3 flex items-center">
            <FiUser className="h-4 w-4 mr-2" />Informations de facturation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-700">
              <FiUser className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{user.firstName || ''} {user.lastName || ''}</span>
            </div>
            {user.email && <div className="flex items-center text-gray-700"><FiMail className="h-4 w-4 mr-2 text-gray-400" /><span>{user.email}</span></div>}
            {user.phone && <div className="flex items-center text-gray-700"><FiPhone className="h-4 w-4 mr-2 text-gray-400" /><span>{user.phone}</span></div>}
          </div>
        </div>
      )}

      <div className="border border-emerald-200 rounded-xl bg-emerald-50 p-4 mb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1A5514]">Sélectionnez votre mode de paiement</h3>
            <p className="text-xs text-emerald-800/80 mt-1">Payez en toute sécurité avec Carte bancaire ou PayPal</p>
          </div>
          <FiCreditCard className="h-6 w-6 text-[#1A5514] flex-shrink-0" />
        </div>
      </div>

      <div className="relative z-10">
        {!paypalClientId ? (
          <FallbackButton paymentProcessing={paymentProcessing} handleFallbackPayment={handleFallbackPayment} message="Configuration PayPal manquante." />
        ) : paypalOptions ? (
          <PayPalScriptProvider key="paypal-buttons-checkout" options={paypalOptions}>
            <div className="relative z-10 bg-white rounded-xl p-4 border border-gray-100">
              <PayPalButtons style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'pay' }} createOrder={createPayPalOrder} onApprove={handlePayPalApprove} onCancel={handlePayPalCancel} onError={handlePayPalError} />
            </div>
          </PayPalScriptProvider>
        ) : (
          <FallbackButton paymentProcessing={paymentProcessing} handleFallbackPayment={handleFallbackPayment} message="Impossible d'initialiser PayPal." />
        )}

        {showCurrencyNotice && (
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3">
            Devise de la commande ({orderCurrency || 'N/A'}) différente de PayPal ({paypalCurrency}). Le paiement sera en {paypalCurrency}.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 relative z-10">
        <FiLock className="h-4 w-4" /><span>Paiement sécurisé protégé par cryptage SSL</span>
      </div>

      {paymentProcessing && <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl p-3 relative z-10">Préparation de la fenêtre de paiement…</div>}
      {paymentError && <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 relative z-10">{paymentError}</div>}
    </div>
  );
};

const FallbackButton = ({ paymentProcessing, handleFallbackPayment, message }) => (
  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
    {message}
    <div className="mt-3">
      <button onClick={handleFallbackPayment} disabled={paymentProcessing} className="w-full bg-[#003087] hover:bg-[#001f5c] text-white font-bold rounded-full py-3 transition disabled:opacity-50">
        {paymentProcessing ? 'Redirection…' : 'Continuer vers PayPal'}
      </button>
    </div>
  </div>
);

export default PayPalPaymentSection;

