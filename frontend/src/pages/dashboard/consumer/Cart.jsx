import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services/api';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiHeart,
  FiTag,
  FiTruck,
  FiClock,
  FiMapPin
} from 'react-icons/fi';

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Charger le panier
  useEffect(() => {
    const loadCart = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const response = await consumerService.getCart();
          console.log('📡 Réponse API Cart:', response);
          setCartItems(response.data.cart?.items || []);
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error);
          setCartItems([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCart();
  }, [user]);

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    
    try {
      console.log('🔄 Update quantity:', id, newQuantity);
      await consumerService.updateCartItem(id, { quantity: newQuantity });
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
    }
  };

  const removeItem = async (id) => {
    try {
      console.log('🗑️ Remove item:', id);
      await consumerService.removeFromCart(id);
      setCartItems(items => items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const applyPromoCode = () => {
    const promoCodes = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE5000': { discount: 5000, type: 'fixed' }
    };

    if (promoCodes[promoCode]) {
      setAppliedPromo({ code: promoCode, ...promoCodes[promoCode] });
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2000;
  const discount = appliedPromo 
    ? appliedPromo.type === 'percentage' 
      ? (subtotal * appliedPromo.discount) / 100
      : appliedPromo.discount
    : 0;
  const total = subtotal + deliveryFee - discount;

  const getAvailabilityBadge = (availability) => {
    const configs = {
      'in-stock': { color: 'bg-green-100 text-green-800', text: 'En stock' },
      'low-stock': { color: 'bg-yellow-100 text-yellow-800', text: 'Stock limité' },
      'out-of-stock': { color: 'bg-red-100 text-red-800', text: 'Rupture' }
    };
    const config = configs[availability] || configs['in-stock'];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Votre panier est vide</h2>
            <p className="mt-2 text-gray-600">
              Découvrez nos produits frais et commencez vos achats
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
              >
                Parcourir les produits
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mon panier</h1>
          <p className="text-gray-600 mt-1">
            {cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Articles</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FiShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <div className="mt-1 flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                Par {item.seller.name} • {item.seller.location}
                              </span>
                              {getAvailabilityBadge(item.availability)}
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <FiTruck className="h-4 w-4 mr-1" />
                              Livraison: {item.deliveryTime}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <FiHeart className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">Quantité:</span>
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 text-gray-600 hover:text-gray-800"
                              >
                                <FiMinus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-2 text-center min-w-[60px]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 text-gray-600 hover:text-gray-800"
                              >
                                <FiPlus className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="text-sm text-gray-600">{item.unit}</span>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {item.price.toLocaleString()} FCFA / {item.unit}
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {(item.price * item.quantity).toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center text-harvests-green hover:text-green-600 font-medium"
              >
                <FiArrowRight className="h-5 w-5 mr-2 rotate-180" />
                Continuer mes achats
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
              
              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code promo
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Entrer le code"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <FiTag className="h-4 w-4" />
                  </button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-green-600">Code "{appliedPromo.code}" appliqué</span>
                    <button
                      onClick={removePromoCode}
                      className="text-red-600 hover:text-red-700"
                    >
                      Retirer
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">{deliveryFee.toLocaleString()} FCFA</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Réduction</span>
                    <span className="font-medium text-green-600">-{discount.toLocaleString()} FCFA</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiMapPin className="h-4 w-4 mr-2" />
                  Livraison à Yaoundé
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiClock className="h-4 w-4 mr-2" />
                  Estimée entre 2-3 jours
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full bg-harvests-green text-white py-3 px-4 rounded-md font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                Procéder au paiement
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>

              {/* Security Info */}
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>Paiement sécurisé • Livraison garantie</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Cart;
