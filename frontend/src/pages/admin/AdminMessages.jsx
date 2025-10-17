import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  User,
  Mail,
  Clock,
  CheckCircle,
  Reply,
  Trash2,
  Eye
} from 'lucide-react';

import { adminService } from '../../services/adminService';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Fonction loadMessages mémorisée pour éviter les re-rendus
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm
      };

      const response = await adminService.getMessages(params);
      
      // Vérifier si la réponse contient des messages
      if (response.data && response.data.messages) {
        setMessages(response.data.messages || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response.data && response.data.data && response.data.data.messages) {
        // Structure alternative avec data.messages
        setMessages(response.data.data.messages || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        setMessages([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setMessages([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await adminService.markAsRead(messageId);
      loadMessages();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;
    
    try {
      await adminService.replyToMessage(messageId, replyText);
      setReplyText('');
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        await adminService.deleteMessage(messageId);
        loadMessages();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'unread': 'text-blue-600 bg-blue-100',
      'read': 'text-green-600 bg-green-100',
      'pending': 'text-yellow-600 bg-yellow-100',
      'replied': 'text-purple-600 bg-purple-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'unread': 'Non lu',
      'read': 'Lu',
      'pending': 'En attente',
      'replied': 'Répondu'
    };
    return statusMap[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600 bg-red-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'low': 'text-green-600 bg-green-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'high': 'Élevée',
      'medium': 'Moyenne',
      'low': 'Faible'
    };
    return priorityMap[priority] || priority;
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Support client</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les messages et demandes des utilisateurs
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Rechercher par expéditeur ou sujet..."
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
                <option value="unread">Non lus</option>
                <option value="read">Lus</option>
                <option value="pending">En attente</option>
                <option value="replied">Répondus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des messages */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {messages.map((message) => (
              <li key={message._id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {message.sender.firstName} {message.sender.lastName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                            {getStatusText(message.status)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {getPriorityText(message.priority)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {message.sender.email}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {message.subject}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {message.content}
                        </p>
                        {message.replies.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-xs text-blue-700">
                              <strong>Réponse:</strong> {message.replies[0].content}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {message.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(message._id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Marquer comme lu"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="text-green-600 hover:text-green-900"
                      title="Répondre"
                    >
                      <Reply className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(message._id)}
                      className="text-red-600 hover:text-red-900"
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

        {/* Modal de réponse */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Répondre à {selectedMessage.sender.firstName} {selectedMessage.sender.lastName}
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Sujet:</strong> {selectedMessage.subject}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Message:</strong> {selectedMessage.content}
                  </p>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Votre réponse..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  rows={4}
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedMessage(null);
                      setReplyText('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleReply(selectedMessage._id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{messages.length}</span> sur{' '}
                <span className="font-medium">{messages.length}</span> résultats
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

export default AdminMessages;
