import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { producerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import { FiSearch, FiPlus, FiEdit, FiEye, FiTrash2, FiPackage, FiDollarSign, FiCheckCircle, FiXCircle, FiClock, FiSend, FiStar } from 'react-icons/fi';

const MyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  useEffect(() => {
    const loadProducts = async () => {
      if (user?.userType === 'producer') {
        try {
          setLoading(true);
          const response = await producerService.getProducts({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchTerm || undefined
          });
          const productsData = response.data.data?.products || response.data.products || response.data || [];
          setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
          console.error('Erreur lors du chargement des produits:', error);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      }
    };
    loadProducts();
  }, [user]); // Supprimer les dépendances qui causent trop de rechargements

  const getStatusConfig = (status) => {
    const configs = {
      'approved': { color: 'bg-green-100 text-green-800', text: 'Publié', icon: FiCheckCircle },
      'pending-review': { color: 'bg-yellow-100 text-yellow-800', text: 'En révision', icon: FiClock },
      'draft': { color: 'bg-blue-100 text-blue-800', text: 'Brouillon', icon: FiEdit },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Rejeté', icon: FiXCircle },
      'inactive': { color: 'bg-gray-100 text-gray-800', text: 'Inactif', icon: FiXCircle }
    };
    return configs[status] || configs['draft'];
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await producerService.deleteProduct(productId);
        setProducts(products.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const handlePublishProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir publier ce produit ? Il sera soumis à révision.')) {
      try {
        await producerService.updateProduct(productId, { status: 'pending-review' });
        // Recharger les produits
        const response = await producerService.getProducts();
        const productsData = response.data.data?.products || response.data.products || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        alert('Produit soumis à révision avec succès !');
      } catch (error) {
        console.error('Erreur lors de la publication:', error);
        alert('Erreur lors de la publication du produit');
      }
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    const productName = product.name?.fr || product.name?.en || product.name || '';
    const productDescription = product.description?.fr || product.description?.en || product.description || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesFeatured = featuredFilter === 'all' || 
                           (featuredFilter === 'featured' && product.isFeatured) ||
                           (featuredFilter === 'not-featured' && !product.isFeatured);
    return matchesSearch && matchesStatus && matchesFeatured;
  });

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
              <p className="text-gray-600 mt-1">Gérez votre catalogue de produits</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/producer/products/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="approved">Publié</option>
                  <option value="pending-review">En révision</option>
                  <option value="draft">Brouillon</option>
                  <option value="rejected">Rejeté</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                >
                  <option value="all">Tous les produits</option>
                  <option value="featured">Mis en avant</option>
                  <option value="not-featured">Non mis en avant</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun produit ne correspond à vos critères de recherche'
                : 'Commencez par ajouter votre premier produit'
              }
            </p>
            <div className="mt-6">
              <Link
                to="/producer/products/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const statusConfig = getStatusConfig(product.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    {product.images && product.images.length > 0 && product.images[0]?.url ? (
                      <CloudinaryImage
                        src={product.images[0].url}
                        alt={product.name?.fr || product.name?.en || product.name || 'Image du produit'}
                        className="w-full h-48 object-cover"
                        width={800}
                        height={600}
                        quality="auto"
                        crop="fit"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
                        <FiPackage className="h-16 w-16 text-gray-400 mb-2" />
                        <span className="text-sm font-medium">Aucune image</span>
                        <span className="text-xs text-gray-400">Ajoutez une image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {product.name?.fr || product.name?.en || product.name || 'Produit sans nom'}
                      </h3>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.text}
                        </span>
                        {product.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FiStar className="w-3 h-3 mr-1 fill-current" />
                            Mis en avant
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {product.description?.fr || product.description?.en || product.description || 'Aucune description'}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FiDollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-lg font-bold text-gray-900">
                            {product.price?.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FiPackage className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {product.inventory?.quantity || 0} en stock
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/producer/products/edit/${product._id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
                        >
                          <FiEdit className="h-4 w-4 mr-1" />
                          Modifier
                        </Link>
                        {product.status === 'draft' && (
                          <button
                            onClick={() => handlePublishProduct(product._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <FiSend className="h-4 w-4 mr-1" />
                            Publier
                          </button>
                        )}
                        <Link
                          to={`/products/${product._id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
                        >
                          <FiEye className="h-4 w-4 mr-1" />
                          Voir
                        </Link>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default MyProducts;
