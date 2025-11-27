import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../contexts/CartContext';
import { useCheckout } from '../../../hooks/useCheckout';
import { consumerService } from '../../../services';
import cartService from '../../../services/cartService';
import { ProgressSteps, AddressStep, PaymentStep, ConfirmationStep } from '../../../components/checkout/CheckoutSteps';
import OrderSummary from '../../../components/checkout/OrderSummary';
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

const Checkout = () => {
  const { user } = useAuth();
  const { items: cartItems, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  
  const {
    currentStep, orderData, submitting, setSubmitting, estimation, isEstimating, estimationError,
    handleInputChange, processCartItems, calculateTotals, validateStep, nextStep, prevStep
  } = useCheckout(user, cartItems);

  const handleSubmitOrder = async () => {
    if (!validateStep(1) || !validateStep(2)) return;

    setSubmitting(true);
    try {
      const { valid: validCartItems, invalid: invalidCartItems } = processCartItems();

      if (invalidCartItems.length > 0) {
        invalidCartItems.forEach(item => removeFromCart(item.productId || item.id, item.originType || 'product'));
        window.alert('Certains articles ne sont plus disponibles et ont été retirés.');
        if (validCartItems.length === 0) { setSubmitting(false); return; }
      }

      const orderPayload = {
        deliveryAddress: orderData.deliveryAddress,
        billingAddress: orderData.billingAddress.sameAsDelivery ? orderData.deliveryAddress : orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentProvider: orderData.paymentProvider,
        deliveryMethod: orderData.deliveryMethod,
        notes: orderData.notes,
        useLoyaltyPoints: orderData.useLoyaltyPoints,
        loyaltyPointsToUse: orderData.loyaltyPointsToUse,
        currency: 'XAF',
        source: 'web',
        items: validCartItems.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          originType: item.originType || 'product',
          supplierId: item.producer?.id,
          supplierType: item.producer?.type || item.originType || 'producer',
          specialInstructions: item.specialInstructions || ''
        }))
      };

      const response = await consumerService.createOrder(orderPayload);
      const orderId = response.data?.data?.order?._id || response.data?.order?._id || response.data?.data?._id || null;

      validCartItems.forEach(item => removeFromCart(item.productId || item.id, item.originType || 'product'));
      clearCart();

      try { await cartService.clearCart(); } catch (e) { console.error('Erreur vidage panier serveur:', e); }

      navigate(orderId ? `/consumer/orders/${orderId}/confirmation` : '/consumer/orders');
    } catch (error) {
      console.error('Erreur création commande:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  if (cartItems.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Votre panier est vide</h2>
          <p className="mt-2 text-gray-600">Ajoutez des produits avant de passer commande</p>
          <div className="mt-6">
            <button onClick={() => navigate('/cart')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600">
              <FiArrowLeft className="mr-2 h-5 w-5" />Retour au panier
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/cart')} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <FiArrowLeft className="h-4 w-4 mr-2" />Retour au panier
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Finaliser la commande</h1>
          <p className="text-gray-600 mt-1">Étape {currentStep} sur 3 • {cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && <AddressStep orderData={orderData} handleInputChange={handleInputChange} />}
            {currentStep === 2 && <PaymentStep orderData={orderData} handleInputChange={handleInputChange} />}
            {currentStep === 3 && <ConfirmationStep orderData={orderData} cartItems={cartItems} />}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <button onClick={prevStep} disabled={currentStep === 1} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed">
                Précédent
              </button>
              
              {currentStep < 3 ? (
                <button onClick={nextStep} disabled={!validateStep(currentStep)} className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  Suivant
                </button>
              ) : (
                <button onClick={handleSubmitOrder} disabled={submitting || !validateStep(1) || !validateStep(2)} className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  {submitting ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Création...</>
                  ) : 'Confirmer la commande'}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary cartItems={cartItems} totals={totals} isEstimating={isEstimating} estimation={estimation} estimationError={estimationError} orderData={orderData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
