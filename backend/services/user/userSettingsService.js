const User = require('../../models/User');

/**
 * Service pour les paramètres utilisateur
 */

/**
 * Obtenir les informations financières
 */
async function getFinancialInfo(userId) {
  const user = await User.findById(userId);
  
  return {
    bankAccount: user.bankAccount || null,
    paymentMethods: user.paymentMethods || [],
    totalEarnings: user.totalEarnings || 0,
    pendingPayments: user.pendingPayments || 0,
    totalWithdrawals: user.totalWithdrawals || 0,
    currency: user.currency || 'XAF',
    taxInfo: user.taxInfo || null
  };
}

/**
 * Mettre à jour les informations financières
 */
async function updateFinancialInfo(userId, financialData) {
  const { bankAccount, paymentMethods, currency, taxInfo } = financialData;
  
  const updateData = {};
  if (bankAccount) updateData.bankAccount = bankAccount;
  if (paymentMethods) updateData.paymentMethods = paymentMethods;
  if (currency) updateData.currency = currency;
  if (taxInfo) updateData.taxInfo = taxInfo;
  
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  return updatedUser;
}

/**
 * Obtenir les paramètres de notification
 */
async function getNotificationSettings(userId) {
  const user = await User.findById(userId);
  
  return {
    email: user.notificationSettings?.email || {
      orders: true,
      payments: true,
      promotions: true,
      updates: true
    },
    push: user.notificationSettings?.push || {
      orders: true,
      payments: true,
      promotions: false,
      updates: true
    },
    sms: user.notificationSettings?.sms || {
      orders: false,
      payments: true,
      promotions: false,
      updates: false
    },
    frequency: user.notificationSettings?.frequency || 'immediate'
  };
}

/**
 * Mettre à jour les paramètres de notification
 */
async function updateNotificationSettings(userId, notificationData) {
  const user = await User.findById(userId);
  const { email, push, sms, frequency } = notificationData;
  
  const notificationSettings = {
    email: email || user.notificationSettings?.email,
    push: push || user.notificationSettings?.push,
    sms: sms || user.notificationSettings?.sms,
    frequency: frequency || user.notificationSettings?.frequency
  };
  
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { notificationSettings },
    { new: true, runValidators: true }
  );

  return updatedUser;
}

/**
 * Obtenir le statut de vérification
 */
async function getVerificationStatus(userId) {
  const user = await User.findById(userId);
  
  return {
    email: {
      verified: user.isEmailVerified,
      verifiedAt: user.emailVerifiedAt,
      pending: !user.isEmailVerified
    },
    phone: {
      verified: user.isPhoneVerified,
      verifiedAt: user.phoneVerifiedAt,
      pending: !user.isPhoneVerified
    },
    identity: {
      verified: user.isIdentityVerified,
      verifiedAt: user.identityVerifiedAt,
      pending: !user.isIdentityVerified,
      documents: user.identityDocuments || []
    },
    business: {
      verified: user.isBusinessVerified,
      verifiedAt: user.businessVerifiedAt,
      pending: !user.isBusinessVerified,
      documents: user.businessDocuments || []
    },
    overall: {
      verified: user.isEmailVerified && user.isPhoneVerified,
      level: calculateVerificationLevel(user)
    }
  };
}

/**
 * Obtenir les adresses de livraison
 */
async function getDeliveryAddresses(userId) {
  const user = await User.findById(userId);
  return user.deliveryAddresses || [];
}

/**
 * Ajouter une adresse de livraison
 */
async function addDeliveryAddress(userId, addressData) {
  const { name, address, city, region, country, postalCode, phone, isDefault } = addressData;
  
  const newAddress = {
    name,
    address,
    city,
    region,
    country,
    postalCode,
    phone,
    isDefault: isDefault || false
  };
  
  // Si c'est l'adresse par défaut, désactiver les autres
  if (isDefault) {
    await User.updateMany(
      { _id: userId, 'deliveryAddresses.isDefault': true },
      { $set: { 'deliveryAddresses.$.isDefault': false } }
    );
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $push: { deliveryAddresses: newAddress } },
    { new: true, runValidators: true }
  );

  return updatedUser;
}

/**
 * Mettre à jour une adresse de livraison
 */
async function updateDeliveryAddress(userId, addressId, addressData) {
  // Si c'est l'adresse par défaut, désactiver les autres
  if (addressData.isDefault) {
    await User.updateMany(
      { _id: userId, 'deliveryAddresses.isDefault': true },
      { $set: { 'deliveryAddresses.$.isDefault': false } }
    );
  }
  
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, 'deliveryAddresses._id': addressId },
    { $set: { 'deliveryAddresses.$': { ...addressData, _id: addressId } } },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new Error('Adresse de livraison non trouvée');
  }

  return updatedUser;
}

/**
 * Supprimer une adresse de livraison
 */
async function deleteDeliveryAddress(userId, addressId) {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $pull: { deliveryAddresses: { _id: addressId } } },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new Error('Adresse de livraison non trouvée');
  }

  return updatedUser;
}

// Fonction utilitaire pour calculer le niveau de vérification
function calculateVerificationLevel(user) {
  let level = 0;
  if (user.isEmailVerified) level += 1;
  if (user.isPhoneVerified) level += 1;
  if (user.isIdentityVerified) level += 1;
  if (user.isBusinessVerified) level += 1;
  
  const levels = ['Non vérifié', 'Basique', 'Standard', 'Avancé', 'Complet'];
  return levels[level] || 'Non vérifié';
}

module.exports = {
  getFinancialInfo,
  updateFinancialInfo,
  getNotificationSettings,
  updateNotificationSettings,
  getVerificationStatus,
  getDeliveryAddresses,
  addDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress
};

