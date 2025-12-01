import { useCallback } from 'react';
import { transformerService } from '../services';
import { useAuth } from './useAuth';

// Hook personnalisé pour les services de transformateur avec mise à jour automatique du profil
export const useTransformerService = () => {
  const { refreshUser } = useAuth();

  // Wrapper pour les méthodes de mise à jour qui déclenchent refreshUser
  const updateWithRefresh = useCallback(async (updateFunction, ...args) => {
    try {
      const result = await updateFunction(...args);
      
      // Mettre à jour automatiquement les données utilisateur après une mise à jour
      try {
        await refreshUser();
      } catch (refreshError) {
        console.warn('Erreur lors de la mise à jour des données utilisateur:', refreshError);
        // Ne pas bloquer l'opération si la mise à jour échoue
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [refreshUser]);

  // Retourner le service avec les méthodes de mise à jour wrappées
  return {
    ...transformerService,
    updateMyProfile: (...args) => updateWithRefresh(transformerService.updateMyProfile, ...args),
    updateCompanyInfo: (...args) => updateWithRefresh(transformerService.updateCompanyInfo, ...args),
  };
};

export default useTransformerService;
