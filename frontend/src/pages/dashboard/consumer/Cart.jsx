import React from 'react';
import { useCart } from '../../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import CloudinaryImage from '../../../components/common/CloudinaryImage';

const Cart = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-harvests-light py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Mon Panier</h1>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-harvests-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Voir les produits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harvests-light py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Mon Panier ({totalItems} articles)</h1>
          </div>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Vider le panier
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {items.map((item) => (
                <div key={item.productId} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <CloudinaryImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        width={80}
                        height={80}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Par {item.producer?.name || item.producerName || item.supplierName || 'Fournisseur'}
                      </p>
                      <p className="text-lg font-semibold text-harvests-green">
                        {item.price.toLocaleString()} FCFA
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.originType)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <FiMinus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-2 min-w-[3rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.originType)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.originType)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Résumé de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Sous-total ({totalItems} articles)</span>
                  <span>{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString()} FCFA</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  // Navigation vers la route checkout du consommateur
                  navigate('/consumer/checkout');
                }}
                className="w-full bg-harvests-green text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Passer la commande
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
