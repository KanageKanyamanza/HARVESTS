import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../../../../hooks/useAuth';
import { transformerService } from '../../../../services';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import {
  FiAward,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiCalendar
} from 'react-icons/fi';

const CertificationsList = () => {
  // const { user } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });

  // Charger les certifications
  useEffect(() => {
    const loadCertifications = async () => {
      try {
        setLoading(true);
        const response = await transformerService.getMyCertifications();
        setCertifications(response.data?.data?.certifications || []);
      } catch (error) {
        console.error('Erreur lors du chargement des certifications:', error);
        setError('Erreur lors du chargement des certifications');
        // Données de démonstration
        setCertifications([
          {
            _id: 'demo-cert-1',
            name: 'Certification HACCP',
            type: 'food-safety',
            issuedBy: 'Ministère de la Santé',
            certificateNumber: 'HACCP-2024-001',
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'valid',
            document: 'haccp-certificate.pdf'
          },
          {
            _id: 'demo-cert-2',
            name: 'Certification Bio',
            type: 'organic',
            issuedBy: 'Organisme de Certification Bio',
            certificateNumber: 'BIO-2024-002',
            validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            issuedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'valid',
            document: 'bio-certificate.pdf'
          },
          {
            _id: 'demo-cert-3',
            name: 'ISO 22000',
            type: 'iso',
            issuedBy: 'Bureau Veritas',
            certificateNumber: 'ISO-22000-2024-003',
            validUntil: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            issuedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'expired',
            document: 'iso-22000-certificate.pdf'
          },
          {
            _id: 'demo-cert-4',
            name: 'Certification Halal',
            type: 'halal',
            issuedBy: 'Association Halal Sénégal',
            certificateNumber: 'HALAL-2024-004',
            validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            issuedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'expiring',
            document: 'halal-certificate.pdf'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCertifications();
  }, [setError]);

  // Filtrer les certifications
  const filteredCertifications = certifications.filter(cert => {
    const matchesType = !filters.type || cert.type === filters.type;
    const matchesStatus = !filters.status || cert.status === filters.status;
    const matchesSearch = !filters.search || 
      cert.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      cert.issuedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Déterminer le statut de la certification
  const getCertificationStatus = (validUntil) => {
    const now = new Date();
    const validDate = new Date(validUntil);
    const daysUntilExpiry = Math.ceil((validDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'valid': return 'Valide';
      case 'expiring': return 'Expire bientôt';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return FiCheckCircle;
      case 'expiring': return FiClock;
      case 'expired': return FiAlertCircle;
      default: return FiAlertCircle;
    }
  };

  // Obtenir la couleur du type
  const getTypeColor = (type) => {
    switch (type) {
      case 'food-safety': return 'bg-blue-100 text-blue-800';
      case 'quality': return 'bg-green-100 text-green-800';
      case 'organic': return 'bg-emerald-100 text-emerald-800';
      case 'halal': return 'bg-purple-100 text-purple-800';
      case 'kosher': return 'bg-indigo-100 text-indigo-800';
      case 'iso': return 'bg-gray-100 text-gray-800';
      case 'haccp': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le libellé du type
  const getTypeLabel = (type) => {
    switch (type) {
      case 'food-safety': return 'Sécurité alimentaire';
      case 'quality': return 'Qualité';
      case 'organic': return 'Bio';
      case 'halal': return 'Halal';
      case 'kosher': return 'Kosher';
      case 'iso': return 'ISO';
      case 'haccp': return 'HACCP';
      default: return type;
    }
  };

  // Calculer les statistiques
  const stats = {
    total: certifications.length,
    valid: certifications.filter(c => getCertificationStatus(c.validUntil) === 'valid').length,
    expiring: certifications.filter(c => getCertificationStatus(c.validUntil) === 'expiring').length,
    expired: certifications.filter(c => getCertificationStatus(c.validUntil) === 'expired').length
  };

  const certificationTypes = [
    { value: 'food-safety', label: 'Sécurité alimentaire' },
    { value: 'quality', label: 'Qualité' },
    { value: 'organic', label: 'Bio' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'iso', label: 'ISO' },
    { value: 'haccp', label: 'HACCP' }
  ];

  const statuses = [
    { value: 'valid', label: 'Valide' },
    { value: 'expiring', label: 'Expire bientôt' },
    { value: 'expired', label: 'Expirée' }
  ];

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Certifications</h1>
            <p className="text-gray-600 mt-1">Gérez vos certifications et documents légaux</p>
          </div>
          <Link
            to="/transformer/certifications/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Ajouter une certification
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiAward className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiCheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Valides</p>
                <p className="text-2xl font-bold text-gray-900">{stats.valid}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiClock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Expirent bientôt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiring}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiAlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Expirées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous les types</option>
                {certificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous les statuts</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Rechercher par nom ou numéro..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: '', status: '', search: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <FiRefreshCw className="h-4 w-4 mr-2 inline" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des certifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Certifications ({filteredCertifications.length})
            </h2>
          </div>
          
          {filteredCertifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Émetteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCertifications.map((cert) => {
                    const status = getCertificationStatus(cert.validUntil);
                    const StatusIcon = getStatusIcon(status);
                    return (
                      <tr key={cert._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiAward className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {cert.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Émise le {new Date(cert.issuedDate).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(cert.type)}`}>
                            {getTypeLabel(cert.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cert.issuedBy || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cert.certificateNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="h-4 w-4 mr-1" />
                            {new Date(cert.validUntil).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/transformer/certifications/${cert._id}`}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <FiEye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/transformer/certifications/${cert._id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit className="h-4 w-4" />
                            </Link>
                            {cert.document && (
                              <a
                                href={`/documents/${cert.document}`}
                                download
                                className="text-green-600 hover:text-green-900"
                              >
                                <FiDownload className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiAward className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune certification</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.type || filters.status || filters.search 
                  ? 'Aucune certification ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore de certifications enregistrées.'
                }
              </p>
              {!filters.type && !filters.status && !filters.search && (
                <div className="mt-6">
                  <Link
                    to="/transformer/certifications/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Ajouter une certification
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default CertificationsList;
