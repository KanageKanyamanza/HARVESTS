import React, { createContext, useContext, useState } from 'react';
import EmailVerificationModal from './EmailVerificationModal';

// Contexte pour gérer les modales globalement
const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({
    emailVerification: {
      isOpen: false,
      email: '',
      isRegistration: false
    }
  });

  const openEmailVerificationModal = (email, isRegistration = false) => {
    setModals(prev => ({
      ...prev,
      emailVerification: {
        isOpen: true,
        email,
        isRegistration
      }
    }));
  };

  const closeEmailVerificationModal = () => {
    setModals(prev => ({
      ...prev,
      emailVerification: {
        ...prev.emailVerification,
        isOpen: false
      }
    }));
  };

  const value = {
    modals,
    openEmailVerificationModal,
    closeEmailVerificationModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      
      {/* Modales globales */}
      <EmailVerificationModal
        isOpen={modals.emailVerification.isOpen}
        onClose={closeEmailVerificationModal}
        email={modals.emailVerification.email}
        isRegistration={modals.emailVerification.isRegistration}
      />
    </ModalContext.Provider>
  );
};

export default ModalProvider;
