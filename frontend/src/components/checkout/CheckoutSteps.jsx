import React from 'react';
import { FiMapPin, FiCreditCard, FiCheck, FiDollarSign, FiTruck, FiInfo, FiShield } from 'react-icons/fi';

export const ProgressSteps = ({ currentStep }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      {[
        { step: 1, title: 'Adresse', Icon: FiMapPin },
        { step: 2, title: 'Paiement', Icon: FiCreditCard },
        { step: 3, title: 'Confirmation', Icon: FiCheck }
      ].map(({ step, title, Icon }) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step ? 'bg-harvests-green text-white' : 'bg-gray-200 text-gray-600'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className={`ml-2 text-sm font-medium ${currentStep >= step ? 'text-harvests-green' : 'text-gray-600'}`}>{title}</span>
          {step < 3 && <div className={`w-16 h-0.5 mx-4 ${currentStep > step ? 'bg-harvests-green' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  </div>
);

export const AddressStep = ({ orderData, handleInputChange }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
      <FiMapPin className="h-5 w-5 mr-2" />Adresse de livraison
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField label="Prénom *" value={orderData.deliveryAddress.firstName} onChange={(v) => handleInputChange('deliveryAddress', 'firstName', v)} required />
      <InputField label="Nom *" value={orderData.deliveryAddress.lastName} onChange={(v) => handleInputChange('deliveryAddress', 'lastName', v)} required />
      <InputField label="Adresse *" value={orderData.deliveryAddress.street} onChange={(v) => handleInputChange('deliveryAddress', 'street', v)} placeholder="Rue, numéro, quartier" className="md:col-span-2" required />
      <InputField label="Ville *" value={orderData.deliveryAddress.city} onChange={(v) => handleInputChange('deliveryAddress', 'city', v)} required />
      <InputField label="Région/État/Province *" value={orderData.deliveryAddress.region} onChange={(v) => handleInputChange('deliveryAddress', 'region', v)} placeholder="Ex: Centre, Dakar..." required />
      <InputField label="Code postal" value={orderData.deliveryAddress.postalCode} onChange={(v) => handleInputChange('deliveryAddress', 'postalCode', v)} />
      <InputField label="Pays *" value={orderData.deliveryAddress.country} onChange={(v) => handleInputChange('deliveryAddress', 'country', v)} placeholder="Ex: Cameroun, Sénégal..." required />
      <InputField label="Téléphone *" value={orderData.deliveryAddress.phone} onChange={(v) => handleInputChange('deliveryAddress', 'phone', v)} type="tel" placeholder="+237 6XX XXX XXX" required />
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Instructions de livraison</label>
        <textarea
          value={orderData.deliveryAddress.deliveryInstructions}
          onChange={(e) => handleInputChange('deliveryAddress', 'deliveryInstructions', e.target.value)}
          placeholder="Informations supplémentaires pour le livreur..."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
        />
      </div>
    </div>
  </div>
);

export const PaymentStep = ({ orderData, handleInputChange }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <FiCreditCard className="h-5 w-5 mr-2" />Méthode de paiement
      </h2>
      
      <div className="space-y-4">
        {[
          { value: 'cash', label: 'Paiement à la livraison', description: 'Réglez en espèces auprès du livreur.', Icon: FiDollarSign },
          { value: 'paypal', label: 'Paypal ou Carte bancaire', description: 'Payer en ligne via PayPal ou Carte bancaire.', Icon: FiCreditCard }
        ].map(({ value, label, description, Icon }) => (
          <label key={value} className={`flex items-start p-4 border rounded-lg cursor-pointer transition hover:bg-harvests-light ${orderData.paymentMethod === value ? 'border-harvests-green bg-harvests-light/60' : 'border-gray-200'}`}>
            <input type="radio" name="paymentMethod" value={value} checked={orderData.paymentMethod === value} onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)} className="h-4 w-4 text-harvests-green mt-1" />
            <div className="ml-3">
              <div className="flex items-center space-x-2">
                <Icon className="h-6 w-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-900">{label}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{description}</p>
            </div>
          </label>
        ))}
      </div>

      {orderData.paymentMethod === 'cash' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <FiInfo className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Paiement à la livraison</h3>
            <p className="text-sm text-green-700 mt-1">Préparez le montant exact pour le livreur.</p>
          </div>
        </div>
      )}

      {orderData.paymentMethod === 'paypal' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <FiShield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Paiement sécurisé via PayPal</h3>
            <p className="text-sm text-blue-700 mt-1">Vous serez redirigé vers PayPal pour autoriser le paiement.</p>
          </div>
        </div>
      )}
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <FiTruck className="h-5 w-5 mr-2" />Mode de livraison
      </h2>
      
      <div className="space-y-4">
        {[
          { value: 'standard-delivery', label: 'Livraison standard', description: '2-3 jours ouvrables', price: '2 000 FCFA' },
          { value: 'express-delivery', label: 'Livraison express', description: '24 heures', price: '5 000 FCFA' }
        ].map((method) => (
          <label key={method.value} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-harvests-light">
            <div className="flex items-center">
              <input type="radio" name="deliveryMethod" value={method.value} checked={orderData.deliveryMethod === method.value} onChange={(e) => handleInputChange('', 'deliveryMethod', e.target.value)} className="h-4 w-4 text-harvests-green" />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{method.label}</div>
                <div className="text-sm text-gray-500">{method.description}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">{method.price}</div>
          </label>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes de commande</h2>
      <textarea value={orderData.notes} onChange={(e) => handleInputChange('', 'notes', e.target.value)} placeholder="Instructions spéciales..." rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green" />
    </div>
  </div>
);

export const ConfirmationStep = ({ orderData, cartItems }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
      <FiCheck className="h-5 w-5 mr-2" />Confirmation de commande
    </h2>
    
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Résumé de la commande</h3>
        <div className="space-y-2">
          {cartItems.map((item, i) => (
            <div key={item.productId || item.id || `item-${i}`} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Adresse de livraison</h3>
        <div className="text-sm text-gray-600">
          <p>{orderData.deliveryAddress.firstName} {orderData.deliveryAddress.lastName}</p>
          <p>{orderData.deliveryAddress.street}</p>
          <p>{orderData.deliveryAddress.city}, {orderData.deliveryAddress.region}</p>
          <p>{orderData.deliveryAddress.phone}</p>
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Paiement</h3>
        <div className="text-sm text-gray-600">
          <p>Méthode: {orderData.paymentMethod === 'paypal' ? 'PayPal' : 'Paiement à la livraison'}</p>
          {orderData.paymentMethod === 'paypal' && <p className="text-blue-600">Vous serez redirigé vers PayPal.</p>}
          {orderData.paymentMethod === 'cash' && <p className="text-green-600 font-medium">✓ Paiement en espèces à la livraison</p>}
        </div>
      </div>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder, className = '', required }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
      required={required}
    />
  </div>
);

