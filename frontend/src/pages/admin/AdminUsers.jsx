import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Ban,
  UserCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminUsers = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fonction loadUsers mémorisée pour éviter les re-rendus
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      };
      const response = await adminService.getUsers(params);
      console.log('🔍 AdminUsers - Response:', response.data);
      
      // Vérifier si la réponse contient des utilisateurs
      if (response.data && response.data.users) {
        console.log('👥 AdminUsers - Users:', response.data.users);
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response.data && response.data.data && response.data.data.users) {
        // Structure alternative avec data.users
        console.log('👥 AdminUsers - Users (alt):', response.data.data.users);
        setUsers(response.data.data.users || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        console.log('❌ AdminUsers - No users found in response:', response.data);
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    if (i18n.isInitialized && i18n.language) {
      loadUsers();
    }
  }, [i18n.isInitialized, i18n.language, loadUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length 
        ? [] 
        : users.map(user => user._id)
    );
  };

  const handleBanUser = async (userId) => {
    if (window.confirm(t('admin.confirmBanUser'))) {
      try {
        await adminService.banUser(userId, 'Violation des règles');
        loadUsers();
      } catch (error) {
        console.error('Erreur lors du bannissement:', error);
      }
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await adminService.verifyUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'text-red-600 bg-red-100',
      'producer': 'text-green-600 bg-green-100',
      'consumer': 'text-blue-600 bg-blue-100',
      'transformer': 'text-purple-600 bg-purple-100',
      'restaurateur': 'text-orange-600 bg-orange-100',
      'exporter': 'text-indigo-600 bg-indigo-100',
      'transporter': 'text-gray-600 bg-gray-100'
    };
    return colors[role] || 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-600 bg-green-100',
      'inactive': 'text-gray-600 bg-gray-100',
      'banned': 'text-red-600 bg-red-100',
      'pending': 'text-yellow-600 bg-yellow-100',
      'verified': 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

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
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.users')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.usersDescription')}
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
              {t('admin.exportUsers')}
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              {t('admin.addUser')}
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
                placeholder={t('admin.searchUsers')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={handleRoleFilter}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('admin.allRoles')}</option>
              <option value="admin">{t('admin.admin')}</option>
              <option value="producer">{t('admin.producer')}</option>
              <option value="consumer">{t('admin.consumer')}</option>
              <option value="transformer">{t('admin.transformer')}</option>
              <option value="restaurateur">{t('admin.restaurateur')}</option>
              <option value="exporter">{t('admin.exporter')}</option>
              <option value="transporter">{t('admin.transporter')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('admin.allStatuses')}</option>
              <option value="active">{t('admin.active')}</option>
              <option value="inactive">{t('admin.inactive')}</option>
              <option value="banned">{t('admin.banned')}</option>
              <option value="pending">{t('admin.pending')}</option>
              <option value="verified">{t('admin.verified')}</option>
            </select>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200">
              <Filter className="h-4 w-4 inline mr-2" />
              {t('admin.moreFilters')}
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('admin.usersList')} ({users.length})
              </h3>
              {selectedUsers.length > 0 && (
                <div className="flex space-x-2">
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                    {t('admin.banSelected')}
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                    {t('admin.verifySelected')}
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
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.joined')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleVerifyUser(user._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleBanUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {t('admin.showing')} {((currentPage - 1) * 10) + 1} {t('admin.to')} {Math.min(currentPage * 10, users.length)} {t('admin.of')} {users.length} {t('admin.results')}
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

export default AdminUsers;
