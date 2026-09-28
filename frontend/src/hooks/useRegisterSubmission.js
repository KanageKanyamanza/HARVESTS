import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';
import { useModal } from './useModal';
import { validateRegisterForm, prepareRegistrationData } from '../utils/registerValidation';

/**
 * Hook personnalisé pour gérer la soumission du formulaire d'inscription
 */
export const useRegisterSubmission = (formData, setErrors, resetForm) => {
  const { t, i18n } = useTranslation('auth');
  const { register } = useAuth();
  const { openEmailVerificationModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Effacer les erreurs précédentes

    try {
      // Préparer les données selon le type d'utilisateur
      // Jour 47 : langue active de l'interface au moment de l'inscription
      // (était figée à 'fr'), pour que les futurs e-mails suivent le choix
      // de l'utilisateur (Jours 64-65).
      const registrationData = {
        ...prepareRegistrationData(formData),
        preferredLanguage: i18n.language === 'en' ? 'en' : 'fr'
      };

      const result = await register(registrationData);
      if (result.success) {
        // Afficher la modale de vérification d'email
        openEmailVerificationModal(formData.email, true);
        
        // Afficher un message de succès
        console.log('✅ Inscription réussie:', result.message);
        
        // Réinitialiser le formulaire après succès
        resetForm();
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      
      let errorMessage = t('register.error');

      // Gérer les erreurs spécifiques
      if (error.isTimeout) {
        errorMessage = t('common.timeout');
      } else if (error.message && error.message.includes('existe déjà')) {
        errorMessage = t('register.emailExists');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};

