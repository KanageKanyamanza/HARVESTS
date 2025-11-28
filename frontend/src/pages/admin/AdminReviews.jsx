import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  Trash2
} from 'lucide-react';

import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState([]);

  // Fonction loadReviews mémorisée pour éviter les re-rendus
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm
      };

      const response = await adminService.getReviews(params);
      
      // Vérifier si la réponse contient des avis
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response.data && response.data.data && response.data.data.reviews) {
        // Structure alternative avec data.reviews
        setReviews(response.data.data.reviews || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        setReviews([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      setReviews([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectReview = (reviewId) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleSelectAll = () => {
    setSelectedReviews(
      selectedReviews.length === reviews.length 
        ? [] 
        : reviews.map(review => review._id)
    );
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await adminService.approveReview(reviewId);
      loadReviews();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleRejectReview = async (reviewId) => {
    const reason = window.prompt('Raison du rejet:');
    if (reason) {
      try {
        await adminService.rejectReview(reviewId, reason);
        loadReviews();
      } catch (error) {
        console.error('Erreur lors du rejet:', error);
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      try {
        await adminService.deleteReview(reviewId);
        loadReviews();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
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
      'pending': 'text-yellow-600 bg-yellow-100',
      'rejected': 'text-red-600 bg-red-100',
      'reported': 'text-orange-600 bg-orange-100',
      'hidden': 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'approved': 'Approuvé',
      'pending': 'En attente',
      'rejected': 'Rejeté',
      'reported': 'Signalé',
      'hidden': 'Masqué'
    };
    return statusMap[status] || status;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Chargement des avis..." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modération des avis</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les avis et commentaires des utilisateurs
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Rechercher par utilisateur ou produit..."
                value={searchTerm}
                onChange={handleSearch}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="reported">Signalés</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
              >
                {selectedReviews.length === reviews.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>
          </div>
        </div>

        {/* Actions groupées */}
        {selectedReviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedReviews.length} avis sélectionnés
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    selectedReviews.forEach(id => handleApproveReview(id));
                    setSelectedReviews([]);
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Approuver
                </button>
                <button
                  onClick={() => {
                    selectedReviews.forEach(id => handleRejectReview(id));
                    setSelectedReviews([]);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des avis */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <li key={review._id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review._id)}
                        onChange={() => handleSelectReview(review._id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {review.reviewer?.firstName || 'N/A'} {review.reviewer?.lastName || ''}
                          </h3>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                            {getStatusText(review.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Sur: {review.product?.name?.fr || review.product?.name?.en || 'Produit'} par {review.producer?.firstName || 'N/A'} {review.producer?.lastName || ''}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {review.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {review.comment}
                        </p>
                        {review.reports.length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-xs text-red-700">
                              <strong>Signalé:</strong> {review.reports[0].description}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveReview(review._id)}
                      className="text-green-600 hover:text-green-900"
                      title="Approuver"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRejectReview(review._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Rejeter"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{reviews.length}</span> sur{' '}
                <span className="font-medium">{reviews.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-harvests-light disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-harvests-light disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
