import { useState } from 'react';
import { useAuth } from './useAuth';
import { useModal } from './useModal';
import { validateRegisterForm, prepareRegistrationData } from '../utils/registerValidation';

/**
 * Hook personnalisé pour gérer la soumission du formulaire d'inscription
 */
export const useRegisterSubmission = (formData, setErrors, resetForm) => {
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
      const registrationData = prepareRegistrationData(formData);

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
      
      let errorMessage = 'Erreur lors de l\'inscription';
      
      // Gérer les erreurs spécifiques
      if (error.isTimeout) {
        errorMessage = 'La requête a pris trop de temps. Veuillez réessayer.';
      } else if (error.message && error.message.includes('existe déjà')) {
        errorMessage = 'Un compte avec cet email existe déjà. Essayez de vous connecter.';
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

