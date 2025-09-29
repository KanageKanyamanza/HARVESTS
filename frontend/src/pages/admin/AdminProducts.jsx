import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Package,
  Calendar,
  User,
  DollarSign,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import CloudinaryImage from '../../components/common/CloudinaryImage';

const AdminProducts = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fonction utilitaire pour extraire le texte multilingue
  const getLocalizedText = (text, fallback = '') => {
    if (!text) return fallback;
    if (typeof text === 'string') return text;
    if (typeof text === 'object') {
      return text[i18n.language] || text.fr || text.en || fallback;
    }
    return fallback;
  };

  useEffect(() => {
    if (i18n.isInitialized && i18n.language) {
      loadProducts();
    }
  }, [i18n.isInitialized, i18n.language, currentPage, statusFilter, categoryFilter, searchTerm]);

  // Fonction loadProducts
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter
      };
      const response = await adminService.getProducts(params);
      console.log('🔍 AdminProducts - Response:', response.data);
      
      // Vérifier si la réponse contient des produits
      if (response.data && response.data.products) {
        console.log('📦 AdminProducts - Products:', response.data.products);
        setProducts(response.data.products || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response.data && response.data.data && response.data.data.products) {
        // Structure alternative avec data.products
        console.log('📦 AdminProducts - Products (alt):', response.data.data.products);
        setProducts(response.data.data.products || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        console.log('❌ AdminProducts - No products found in response:', response.data);
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === products.length 
        ? [] 
        : products.map(product => product._id)
    );
  };

  const handleApproveProduct = async (productId) => {
    if (window.confirm(t('admin.confirmApproveProduct'))) {
      try {
        await adminService.approveProduct(productId);
        loadProducts();
      } catch (error) {
        console.error('Erreur lors de l\'approbation:', error);
      }
    }
  };

  const handleRejectProduct = async (productId) => {
    const reason = window.prompt(t('admin.rejectionReason'));
    if (reason) {
      try {
        await adminService.rejectProduct(productId, reason);
        loadProducts();
      } catch (error) {
        console.error('Erreur lors du rejet:', error);
      }
    }
  };

  const handleFeatureProduct = async (productId) => {
    try {
      await adminService.featureProduct(productId);
      loadProducts();
    } catch (error) {
      console.error('Erreur lors de la mise en vedette:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': 'text-green-600 bg-green-100',
      'pending-review': 'text-yellow-600 bg-yellow-100',
      'draft': 'text-gray-600 bg-gray-100',
      'rejected': 'text-red-600 bg-red-100',
      'inactive': 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'approved': t('admin.approved'),
      'pending-review': t('admin.pendingReview'),
      'draft': t('admin.draft'),
      'rejected': t('admin.rejected'),
      'inactive': t('admin.inactive')
    };
    return statusMap[status] || status;
  };

  console.log('🔍 AdminProducts - Render - Products:', products);
  console.log('🔍 AdminProducts - Render - Loading:', loading);
  console.log('🔍 AdminProducts - Render - i18n initialized:', i18n.isInitialized);
  console.log('🔍 AdminProducts - Render - i18n language:', i18n.language);

  if (!i18n.isInitialized || !i18n.language || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.products')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.productsDescription')}
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
              {t('admin.exportProducts')}
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              {t('admin.addProduct')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.searchProducts')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('admin.allStatuses')}</option>
              <option value="approved">{t('admin.approved')}</option>
              <option value="pending-review">{t('admin.pendingReview')}</option>
              <option value="draft">{t('admin.draft')}</option>
              <option value="rejected">{t('admin.rejected')}</option>
              <option value="inactive">{t('admin.inactive')}</option>
            </select>
            <select
              value={categoryFilter}
              onChange={handleCategoryFilter}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('admin.allCategories')}</option>
              <option value="fruits">{t('products.categories.fruits')}</option>
              <option value="vegetables">{t('products.categories.vegetables')}</option>
              <option value="grains">{t('products.categories.grains')}</option>
              <option value="herbs">{t('products.categories.herbs')}</option>
              <option value="other">{t('products.categories.other')}</option>
            </select>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200">
              <Filter className="h-4 w-4 inline mr-2" />
              {t('admin.moreFilters')}
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('admin.productsList')} ({products.length})
              </h3>
              {selectedProducts.length > 0 && (
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                    {t('admin.approveSelected')}
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                    {t('admin.rejectSelected')}
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.product')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.producer')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.created')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">{t('admin.noProducts')}</p>
                          <p className="text-sm">{t('admin.noProductsDescription')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleSelectProduct(product._id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <CloudinaryImage
                                src={product.images?.[0]?.url || product.primaryImage?.url}
                                alt={getLocalizedText(product.name, 'Produit')}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {getLocalizedText(product.name, 'Produit sans nom')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.producer?.farmName || product.producer?.firstName} {product.producer?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.producer?.address?.city}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {getStatusText(product.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/products/${product._id}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {product.status === 'pending-review' && (
                              <>
                                <button
                                  onClick={() => handleApproveProduct(product._id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectProduct(product._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {product.status === 'approved' && !product.featured && (
                              <button
                                onClick={() => handleFeatureProduct(product._id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <Star className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {t('admin.showing')} {((currentPage - 1) * 10) + 1} {t('admin.to')} {Math.min(currentPage * 10, products.length)} {t('admin.of')} {products.length} {t('admin.results')}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.previous')}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.next')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
