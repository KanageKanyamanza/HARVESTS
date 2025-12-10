import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurateurService } from '../../../services';
import { useNotifications } from '../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import OrderProgress from '../../../components/orders/OrderProgress';
import SupplierSelector from '../../../components/orders/SupplierSelector';
import ProductSelector from '../../../components/orders/ProductSelector';
import DeliveryForm from '../../../components/orders/DeliveryForm';
import OrderConfirmation from '../../../components/orders/OrderConfirmation';
import { useOrderForm } from '../../../hooks/useOrderForm';
import { useOrderCart } from '../../../hooks/useOrderCart';
import { useOrderSuppliers } from '../../../hooks/useOrderSuppliers';
import { useOrderProducts } from '../../../hooks/useOrderProducts';

const NewOrder = () => {
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks personnalisés
  const { order, handleInputChange } = useOrderForm();
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    calculateTotal 
  } = useOrderCart();
  const { 
    suppliers, 
    selectedSupplier, 
    setSelectedSupplier 
  } = useOrderSuppliers();
  const { products } = useOrderProducts(selectedSupplier);

  // Passer à l'étape suivante
  const nextStep = () => {
    if (step === 1 && !selectedSupplier) {
      showError('Veuillez sélectionner un fournisseur');
      return;
    }
    if (step === 2 && cart.length === 0) {
      showError('Veuillez ajouter des produits au panier');
      return;
    }
    setStep(step + 1);
    // Scroll vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Passer à l'étape précédente
  const prevStep = () => {
    setStep(step - 1);
    // Scroll vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Créer la commande
  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      const orderData = {
        supplier: selectedSupplier._id,
        items: cart.map(item => ({
          productId: item.product.relatedProductId || item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: calculateTotal(),
        deliveryAddress: order.deliveryAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        deliveryDate: order.deliveryDate,
        deliveryTime: order.deliveryTime
      };

      await restaurateurService.createOrder(orderData);
      showSuccess('Commande créée avec succès');
      navigate('/restaurateur/orders');
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      showError('Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'ajout au panier avec le fournisseur sélectionné
  const handleAddToCart = (product) => {
    addToCart(product, selectedSupplier);
  };

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Commande</h1>
          <p className="text-gray-600 mt-1">Créez une nouvelle commande d'approvisionnement</p>
        </div>

        {/* Progress Bar */}
        <OrderProgress currentStep={step} />

        {/* Step 1: Sélection du fournisseur */}
        {step === 1 && (
          <SupplierSelector
            suppliers={suppliers}
            selectedSupplier={selectedSupplier}
            onSelectSupplier={setSelectedSupplier}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        {/* Step 2: Sélection des produits */}
        {step === 2 && (
          <ProductSelector
            selectedSupplier={selectedSupplier}
            products={products}
            cart={cart}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onCalculateTotal={calculateTotal}
            onBackToSuppliers={() => setStep(1)}
          />
        )}

        {/* Step 3: Informations de livraison */}
        {step === 3 && (
          <DeliveryForm
            order={order}
            onInputChange={handleInputChange}
          />
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <OrderConfirmation
            selectedSupplier={selectedSupplier}
            cart={cart}
            order={order}
            calculateTotal={calculateTotal}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-harvests-green hover:bg-green-600"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-harvests-green hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer la commande'}
            </button>
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default NewOrder;
