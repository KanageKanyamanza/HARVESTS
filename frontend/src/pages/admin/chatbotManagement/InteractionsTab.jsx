import React from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const InteractionsTab = ({
  interactions,
  loading,
  interactionFilters,
  setInteractionFilters,
  interactionsPagination,
  loadInteractions,
  formatDate,
  handleViewChatDetails
}) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              value={interactionFilters.search}
              onChange={(e) => setInteractionFilters({ ...interactionFilters, search: e.target.value })}
              placeholder="Question ou réponse..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type de réponse</label>
            <select
              value={interactionFilters.responseType}
              onChange={(e) => setInteractionFilters({ ...interactionFilters, responseType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              <option value="faq">FAQ</option>
              <option value="intent">Intention</option>
              <option value="product_search">Recherche produit</option>
              <option value="no_answer">Sans réponse</option>
              <option value="greeting">Salutation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
            <select
              value={interactionFilters.feedback}
              onChange={(e) => setInteractionFilters({ ...interactionFilters, feedback: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              <option value="helpful">Utile</option>
              <option value="not_helpful">Inutile</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              value={interactionFilters.startDate}
              onChange={(e) => setInteractionFilters({ ...interactionFilters, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={interactionFilters.endDate}
              onChange={(e) => setInteractionFilters({ ...interactionFilters, endDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setInteractionFilters({
                  responseType: '',
                  feedback: '',
                  search: '',
                  userId: '',
                  startDate: '',
                  endDate: ''
                });
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Interactions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : interactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune interaction trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réponse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interactions.map((interaction) => (
                  <tr key={interaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(interaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {interaction.userId ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {interaction.userId.firstName} {interaction.userId.lastName}
                          </div>
                          <div className="text-gray-500 text-xs">{interaction.userId.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Visiteur</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {interaction.question}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {interaction.response || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interaction.responseType === 'faq' ? 'bg-green-100 text-green-700' :
                        interaction.responseType === 'product_search' ? 'bg-blue-100 text-blue-700' :
                        interaction.responseType === 'no_answer' ? 'bg-red-100 text-red-700' :
                        interaction.responseType === 'intent' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {interaction.responseType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {interaction.feedback === 'helpful' ? (
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                      ) : interaction.feedback === 'not_helpful' ? (
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {interaction.userId && (
                        <button
                          onClick={() => handleViewChatDetails(interaction)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          title="Voir les détails complets du chat"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {interactionsPagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => loadInteractions(interactionsPagination.currentPage - 1)}
            disabled={interactionsPagination.currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {interactionsPagination.currentPage} sur {interactionsPagination.totalPages} ({interactionsPagination.total} total)
          </span>
          <button
            onClick={() => loadInteractions(interactionsPagination.currentPage + 1)}
            disabled={interactionsPagination.currentPage === interactionsPagination.totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InteractionsTab;

