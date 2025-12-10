import React from 'react';

const OrderProgress = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Fournisseur' },
    { number: 2, label: 'Produits' },
    { number: 3, label: 'Livraison' },
    { number: 4, label: 'Confirmation' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= step.number
                ? 'bg-harvests-green text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${
                currentStep > step.number ? 'bg-harvests-green' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        {steps.map(step => (
          <span key={step.number}>{step.label}</span>
        ))}
      </div>
    </div>
  );
};

export default OrderProgress;

