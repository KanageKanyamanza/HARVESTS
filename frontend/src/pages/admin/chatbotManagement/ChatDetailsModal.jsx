import React from 'react';
import { X, MessageCircle, Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const ChatDetailsModal = ({ 
  selectedInteraction, 
  chatHistory, 
  loadingHistory, 
  formatDate, 
  formatTime, 
  onClose 
}) => {
  if (!selectedInteraction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Détails complets du chat
            </h3>
            {selectedInteraction.userId && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedInteraction.userId.firstName} {selectedInteraction.userId.lastName} 
                {selectedInteraction.userId.email && ` • ${selectedInteraction.userId.email}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loadingHistory ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune interaction trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((interaction, index) => (
                <div key={interaction._id || index} className="flex flex-col space-y-2">
                  {/* User Question */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">Utilisateur</span>
                        <span className="text-xs text-gray-400">{formatTime(interaction.createdAt)}</span>
                      </div>
                      <p className="text-gray-900">{interaction.question}</p>
                    </div>
                  </div>

                  {/* Bot Response */}
                  {interaction.response && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 bg-green-50 rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500">Bot</span>
                            {interaction.responseType && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                interaction.responseType === 'faq' ? 'bg-green-100 text-green-700' :
                                interaction.responseType === 'product_search' ? 'bg-blue-100 text-blue-700' :
                                interaction.responseType === 'intent' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {interaction.responseType}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {interaction.feedback === 'helpful' && (
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                            )}
                            {interaction.feedback === 'not_helpful' && (
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-400">{formatTime(interaction.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-gray-800">{interaction.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total interactions: {chatHistory.length}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDetailsModal;

