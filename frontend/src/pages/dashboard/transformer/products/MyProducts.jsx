import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transformerService } from '../../../../services';
import { useNotifications } from '../../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import ProductCard from '../../../../components/common/ProductCard';
import EmailVerificationRequired from '../../../../components/common/EmailVerificationRequired';
import {
  FiPackage,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiShoppingCart,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';

const MyProducts = () => {
  const { showSuccess, showError } = useNotifications();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailVerificationError, setEmailVerificationError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Charger les produits
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setEmailVerificationError(null);
        setError(null);
        const response = await transformerService.getMyProducts();
        setProducts(response.data?.data?.products || []);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        
        // Vérifier si c'est une erreur de vérification d'email
        if (error.response?.status === 403 && error.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
          setEmailVerificationError(error.response.data);
          setProducts([]);
        } else {
          setError('Erreur lors du chargement des produits');
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Supprimer un produit
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await transformerService.deleteProduct(productId);
        setProducts(products.filter(p => p._id !== productId));
        showSuccess('Produit supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showError('Erreur lors de la suppression du produit');
      }
    }
  };

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesStatus = !filters.status || product.status === filters.status;
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });


  // Obtenir le statut de modération du produit
  const getModerationStatus = (product) => {
    return product.status || 'draft';
  };


  // Soumettre un produit pour révision
  const handleSubmitForReview = async (productId) => {
    try {
      await transformerService.submitProductForReview(productId);
      
      // Mettre à jour le statut localement
      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, status: 'pending-review' } : p
      ));
      
      showSuccess('Produit soumis pour révision avec succès !', 'Succès');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Erreur lors de la soumission du produit', 'Erreur');
    }
  };

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (error) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="text-center py-12">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Réessayer
          </button>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* Message de vérification d'email */}
        {emailVerificationError && (
          <EmailVerificationRequired 
            errorData={emailVerificationError} 
            onResendEmail={() => {
              setEmailVerificationError(null);
              // Recharger les produits après renvoi d'email
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }}
          />
        )}

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
            <p className="text-gray-600 mt-1">Gérez les produits de votre boutique</p>
          </div>
          <Link
            to="/transformer/products/add"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Link>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="pending-review">En révision</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <button
              onClick={() => setFilters({ status: '', search: '' })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total produits</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiClock className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Brouillons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => getModerationStatus(p) === 'draft').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiAlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En révision</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => getModerationStatus(p) === 'pending-review').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => getModerationStatus(p) === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ventes totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + (p.sales || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des produits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Produits ({filteredProducts.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par ajouter votre premier produit.
                </p>
                <div className="mt-6">
                  <Link
                    to="/transformer/products/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Ajouter un produit
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    userType="transformer"
                    showActions={true}
                    showStatus={true}
                    showFeatured={false}
                    onEdit={true}
                    onView={true}
                    onPublish={(productId) => {
                      // Soumettre pour révision
                      handleSubmitForReview(productId);
                    }}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default MyProducts;
