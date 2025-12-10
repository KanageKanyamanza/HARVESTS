import { useState, useEffect } from 'react';
import { 
  restaurateurService, 
  producerService, 
  transformerService, 
  exporterService 
} from '../services';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Hook personnalisé pour gérer les produits d'un fournisseur
 */
export const useOrderProducts = (selectedSupplier) => {
  const { showError } = useNotifications();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les produits du fournisseur sélectionné
  useEffect(() => {
    if (!selectedSupplier?._id) {
      setProducts([]);
      return;
    }

    const loadProducts = async () => {
      try {
        setLoading(true);
        const supplierId = selectedSupplier._id;
        let productsData = [];

        if (selectedSupplier.userType === 'producer') {
          const response = await producerService.getPublicProducts(supplierId);
          productsData = response.data?.data?.products || [];
        } else if (selectedSupplier.userType === 'transformer') {
          const response = await transformerService.getPublicProducts(supplierId);
          productsData = response.data?.data?.products || response.data?.data?.dishes || [];
        } else if (selectedSupplier.userType === 'exporter') {
          const response = await exporterService.getFleet({ supplier: supplierId });
          productsData = response.data?.data?.fleet || [];
        }

        if (!Array.isArray(productsData) || productsData.length === 0) {
          const fallbackResponse = await restaurateurService.getSupplierDetails(supplierId);
          const supplierData = fallbackResponse.data?.data?.supplier || fallbackResponse.data?.data;
          productsData = supplierData?.products || supplierData?.availableProducts || [];
        }

        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        showError('Erreur lors du chargement des produits');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedSupplier, showError]);

  return {
    products,
    loading
  };
};

