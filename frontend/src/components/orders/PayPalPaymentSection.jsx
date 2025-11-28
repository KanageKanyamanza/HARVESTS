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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-200 relative z-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">PayPal ou Carte bancaire</h2>
      
      {user && (
        <div className="mb-6 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm relative z-10">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FiUser className="h-4 w-4 mr-2" />Informations de facturation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-900">
              <FiUser className="h-4 w-4 mr-2 text-gray-600" />
              <span className="font-medium">{user.firstName || ''} {user.lastName || ''}</span>
            </div>
            {user.email && <div className="flex items-center text-gray-900"><FiMail className="h-4 w-4 mr-2 text-gray-600" /><span>{user.email}</span></div>}
            {user.phone && <div className="flex items-center text-gray-900"><FiPhone className="h-4 w-4 mr-2 text-gray-600" /><span>{user.phone}</span></div>}
          </div>
        </div>
      )}
      
      <div className="border-2 border-green-500 rounded-xl bg-green-100 p-4 mb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-green-900">Sélectionnez votre mode de paiement</h3>
            <p className="text-sm text-green-800 mt-1">Payez en toute sécurité avec Carte bancaire ou PayPal</p>
          </div>
          <FiCreditCard className="h-6 w-6 text-green-800" />
        </div>
      </div>

      <div className="relative z-10">
        {!paypalClientId ? (
          <FallbackButton paymentProcessing={paymentProcessing} handleFallbackPayment={handleFallbackPayment} message="Configuration PayPal manquante." />
        ) : paypalOptions ? (
          <PayPalScriptProvider key="paypal-buttons-checkout" options={paypalOptions}>
            <div className="relative z-10 bg-white rounded-lg p-4">
              <PayPalButtons style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'pay' }} createOrder={createPayPalOrder} onApprove={handlePayPalApprove} onCancel={handlePayPalCancel} onError={handlePayPalError} />
            </div>
          </PayPalScriptProvider>
        ) : (
          <FallbackButton paymentProcessing={paymentProcessing} handleFallbackPayment={handleFallbackPayment} message="Impossible d'initialiser PayPal." />
        )}
        
        {showCurrencyNotice && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg p-3">
            Devise de la commande ({orderCurrency || 'N/A'}) différente de PayPal ({paypalCurrency}). Le paiement sera en {paypalCurrency}.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600 relative z-10">
        <FiLock className="h-4 w-4" /><span>Paiement sécurisé protégé par cryptage SSL</span>
      </div>

      {paymentProcessing && <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-3 relative z-10">Préparation de la fenêtre de paiement…</div>}
      {paymentError && <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 relative z-10">{paymentError}</div>}
    </div>
  );
};

const FallbackButton = ({ paymentProcessing, handleFallbackPayment, message }) => (
  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
    {message}
    <div className="mt-3">
      <button onClick={handleFallbackPayment} disabled={paymentProcessing} className="w-full bg-[#003087] hover:bg-[#001f5c] text-white font-semibold rounded-lg py-3 transition disabled:opacity-50">
        {paymentProcessing ? 'Redirection…' : 'Continuer vers PayPal'}
      </button>
    </div>
  </div>
);

export default PayPalPaymentSection;

