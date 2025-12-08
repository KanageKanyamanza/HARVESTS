import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus } from 'lucide-react';
import AdminFilters from './adminManagement/AdminFilters';
import AdminTable from './adminManagement/AdminTable';
import AdminPagination from './adminManagement/AdminPagination';
import AdminCreateModal from './adminManagement/AdminCreateModal';
import AdminViewModal from './adminManagement/AdminViewModal';
import AdminEditModal from './adminManagement/AdminEditModal';
import { getRoleColor, getRoleLabel, getDepartmentLabel, formatDate } from './adminManagement/utils';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulaire de création/édition
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'moderator',
    department: 'support',
    isActive: true
  });

  // Fonction loadAdmins mémorisée
  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAdmins({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : undefined
      });
      
      if (response.status === 'success' || response.data) {
        const data = response.data || response;
        setAdmins(data.admins || []);
        const total = data.total || data.admins?.length || 0;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        setAdmins([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des administrateurs:', error);
      setError('Erreur lors du chargement des administrateurs');
      setAdmins([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, itemsPerPage]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // Réinitialiser les filtres quand ils changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Gestion de la création
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await adminService.createAdmin(formData);
      setSuccess('Administrateur créé avec succès');
      setShowCreateModal(false);
      resetForm();
      loadAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la création de l\'administrateur');
    } finally {
      setSaving(false);
    }
  };

  // Gestion de l'édition
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { ...formData };
      // Ne pas envoyer le mot de passe s'il est vide
      if (!updateData.password) {
        delete updateData.password;
      }
      await adminService.updateAdmin(selectedAdmin._id, updateData);
      setSuccess('Administrateur mis à jour avec succès');
      setShowEditModal(false);
      setSelectedAdmin(null);
      resetForm();
      loadAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'administrateur');
    } finally {
      setSaving(false);
    }
  };

  // Gestion de la suppression
  const handleDelete = async (admin) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'administrateur ${admin.firstName} ${admin.lastName} ?`)) {
      return;
    }

    try {
      setError('');
      await adminService.deleteAdmin(admin._id);
      setSuccess('Administrateur supprimé avec succès');
      loadAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression de l\'administrateur');
    }
  };

  // Gestion du toggle status
  const handleToggleStatus = async (admin) => {
    try {
      setError('');
      await adminService.toggleAdminStatus(admin._id);
      setSuccess(`Administrateur ${admin.isActive ? 'désactivé' : 'activé'} avec succès`);
      loadAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  // Ouvrir modal de visualisation
  const handleView = async (admin) => {
    try {
      const response = await adminService.getAdminById(admin._id);
      setSelectedAdmin(response.data?.admin || response.admin || admin);
      setShowViewModal(true);
    } catch (error) {
      setError('Erreur lors du chargement des détails');
      setSelectedAdmin(admin);
      setShowViewModal(true);
    }
  };

  // Ouvrir modal d'édition
  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      password: '',
      phone: admin.phone || '',
      role: admin.role || 'moderator',
      department: admin.department || 'support',
      isActive: admin.isActive !== undefined ? admin.isActive : true
    });
    setShowEditModal(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'moderator',
      department: 'support',
      isActive: true
    });
    setSelectedAdmin(null);
  };

  if (loading && admins.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        {/* Messages de succès/erreur */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* En-tête */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des administrateurs
              </h1>
              <p className="mt-2 text-gray-600">
                Gérez les comptes administrateurs et leurs permissions
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer un administrateur
            </button>
          </div>
        </div>

        {/* Filtres */}
        <AdminFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Tableau des administrateurs */}
        <AdminTable
          admins={admins}
          getRoleColor={getRoleColor}
          getRoleLabel={getRoleLabel}
          getDepartmentLabel={getDepartmentLabel}
          formatDate={formatDate}
          handleView={handleView}
          handleEditClick={handleEditClick}
          handleDelete={handleDelete}
          handleToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
        />

        {/* Modal de création */}
        <AdminCreateModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          saving={saving}
          resetForm={resetForm}
        />

        {/* Modal de visualisation */}
        <AdminViewModal
          show={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedAdmin(null);
          }}
          admin={selectedAdmin}
          getRoleColor={getRoleColor}
          getRoleLabel={getRoleLabel}
          getDepartmentLabel={getDepartmentLabel}
          formatDate={formatDate}
        />

        {/* Modal d'édition */}
        <AdminEditModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          admin={selectedAdmin}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          saving={saving}
          resetForm={resetForm}
        />
      </div>
    </div>
  );
};

export default AdminManagement;
