import { useState, useEffect } from 'react';
import { restaurateurService } from '../services';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Hook personnalisé pour gérer les fournisseurs
 */
export const useOrderSuppliers = () => {
  const { showError } = useNotifications();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger les fournisseurs
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        const response = await restaurateurService.discoverSuppliers({ limit: 20 });
        setSuppliers(response.data?.data?.suppliers || []);
      } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
        showError('Erreur lors du chargement des fournisseurs');
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, [showError]);

  return {
    suppliers,
    selectedSupplier,
    setSelectedSupplier,
    loading
  };
};

