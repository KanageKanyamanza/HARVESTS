import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurateurService } from '../../../services';
import { useNotifications } from '../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import {
  FiPlus,
  FiMinus,
  FiSearch,
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiMapPin,
  FiClock
} from 'react-icons/fi';

const NewOrder = () => {
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState({
    deliveryAddress: {
      street: '',
      city: '',
      region: '',
      postalCode: ''
    },
    billingAddress: {
      street: '',
      city: '',
      region: '',
      postalCode: ''
    },
    paymentMethod: 'mobile-money',
    notes: '',
    deliveryDate: '',
    deliveryTime: ''
  });

  // Charger les fournisseurs
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await restaurateurService.discoverSuppliers({ limit: 20 });
        setSuppliers(response.data?.data?.suppliers || []);
      } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
        showError('Erreur lors du chargement des fournisseurs');
      }
    };

    loadSuppliers();
  }, []);

  // Charger les produits du fournisseur sélectionné
  useEffect(() => {
    if (selectedSupplier) {
      const loadProducts = async () => {
        try {
          const response = await restaurateurService.getSupplierDetails(selectedSupplier._id);
          setProducts(response.data?.data?.supplier?.products || []);
        } catch (error) {
          console.error('Erreur lors du chargement des produits:', error);
          showError('Erreur lors du chargement des produits');
        }
      };

      loadProducts();
    }
  }, [selectedSupplier]);

  // Filtrer les fournisseurs
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer les produits
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter au panier
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Retirer du panier
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  // Modifier la quantité
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  // Calculer le total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Gérer les changements d'input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrder(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrder(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

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
  };

  // Passer à l'étape précédente
  const prevStep = () => {
    setStep(step - 1);
  };

  // Créer la commande
  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      const orderData = {
        supplier: selectedSupplier._id,
        items: cart.map(item => ({
          productId: item.product._id,
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

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Commande</h1>
          <p className="text-gray-600 mt-1">Créez une nouvelle commande d'approvisionnement</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-harvests-green text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > stepNumber ? 'bg-harvests-green' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Fournisseur</span>
            <span>Produits</span>
            <span>Livraison</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Step 1: Sélection du fournisseur */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner un fournisseur</h2>
            
            {/* Recherche */}
            <div className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
            </div>

            {/* Liste des fournisseurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier._id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSupplier?._id === supplier._id
                      ? 'border-harvests-green bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {supplier.avatar ? (
                        <CloudinaryImage
                          src={supplier.avatar}
                          alt={supplier.firstName}
                          className="w-12 h-12 object-cover rounded-lg"
                          width={200}
                          height={200}
                          quality="auto"
                          crop="fill"
                        />
                      ) : (
                        <FiUsers className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {supplier.firstName} {supplier.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {supplier.companyName || supplier.userType}
                      </p>
                      <div className="flex items-center mt-1">
                        <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-500">
                          {supplier.rating || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedSupplier && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    Fournisseur sélectionné: {selectedSupplier.firstName} {selectedSupplier.lastName}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Sélection des produits */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des produits */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Produits de {selectedSupplier?.firstName} {selectedSupplier?.lastName}
                </h2>
                
                {/* Recherche de produits */}
                <div className="mb-4">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                </div>

                {/* Liste des produits */}
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <CloudinaryImage
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              width={200}
                              height={200}
                              quality="auto"
                              crop="fill"
                            />
                          ) : (
                            <FiPackage className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.description}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {product.price?.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                      >
                        <FiPlus className="h-4 w-4 mr-1" />
                        Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panier */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Panier</h3>
                
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Votre panier est vide</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product._id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.product.price?.toLocaleString()} FCFA
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <FiMinus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <FiMinus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total:</span>
                        <span>{calculateTotal().toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Informations de livraison */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations de livraison</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Adresse de livraison */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Adresse de livraison</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rue *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.street"
                      value={order.deliveryAddress.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress.city"
                        value={order.deliveryAddress.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress.postalCode"
                        value={order.deliveryAddress.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date et heure de livraison */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Date et heure de livraison</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de livraison *
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={order.deliveryDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de livraison
                    </label>
                    <input
                      type="time"
                      name="deliveryTime"
                      value={order.deliveryTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Méthode de paiement
                    </label>
                    <select
                      name="paymentMethod"
                      value={order.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    >
                      <option value="mobile-money">Mobile Money</option>
                      <option value="cash">Espèces</option>
                      <option value="card">Carte bancaire</option>
                      <option value="bank-transfer">Virement bancaire</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                name="notes"
                value={order.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Instructions spéciales pour la livraison..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Confirmation de la commande</h2>
            
            <div className="space-y-6">
              {/* Fournisseur */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Fournisseur</h3>
                <p className="text-sm text-gray-600">
                  {selectedSupplier?.firstName} {selectedSupplier?.lastName}
                </p>
              </div>

              {/* Produits */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Produits commandés</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex justify-between text-sm">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>{(item.product.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{calculateTotal().toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Livraison */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Informations de livraison</h3>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {order.deliveryDate} à {order.deliveryTime}
                </p>
                <p className="text-sm text-gray-600">
                  Paiement: {order.paymentMethod}
                </p>
              </div>
            </div>
          </div>
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
