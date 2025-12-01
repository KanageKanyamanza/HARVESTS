const Consumer = require('../../models/Consumer');

/**
 * Service pour la gestion des méthodes de paiement du consommateur
 */

async function getPaymentMethods(consumerId) {
  const consumer = await Consumer.findById(consumerId).select('paymentMethods');
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  return consumer.paymentMethods || [];
}

async function addPaymentMethod(consumerId, paymentMethodData) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  if (!consumer.paymentMethods) {
    consumer.paymentMethods = [];
  }
  
  // Si c'est la première méthode ou si isDefault est true, la définir comme défaut
  if (consumer.paymentMethods.length === 0 || paymentMethodData.isDefault) {
    consumer.paymentMethods.forEach(method => { method.isDefault = false; });
    paymentMethodData.isDefault = true;
  }
  
  consumer.paymentMethods.push(paymentMethodData);
  await consumer.save();
  
  return consumer.paymentMethods[consumer.paymentMethods.length - 1];
}

async function updatePaymentMethod(consumerId, methodId, updateData) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  const method = consumer.paymentMethods.id(methodId);
  if (!method) {
    throw new Error('Méthode de paiement non trouvée');
  }
  
  // Si on définit cette méthode comme défaut, retirer le défaut des autres
  if (updateData.isDefault) {
    consumer.paymentMethods.forEach(m => {
      if (m._id.toString() !== methodId) {
        m.isDefault = false;
      }
    });
  }
  
  Object.keys(updateData).forEach(key => {
    method[key] = updateData[key];
  });
  
  await consumer.save();
  return method;
}

async function removePaymentMethod(consumerId, methodId) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  consumer.paymentMethods.pull(methodId);
  await consumer.save();
}

async function setDefaultPaymentMethod(consumerId, methodId) {
  const consumer = await Consumer.findById(consumerId);
  if (!consumer) {
    throw new Error('Consommateur non trouvé');
  }
  
  const method = consumer.paymentMethods.id(methodId);
  if (!method) {
    throw new Error('Méthode de paiement non trouvée');
  }
  
  consumer.paymentMethods.forEach(m => {
    m.isDefault = m._id.toString() === methodId;
  });
  
  await consumer.save();
  return method;
}

module.exports = {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod
};

