import React from 'react';
import { Filter, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const QuestionsTab = ({
  questions,
  loading,
  statusFilter,
  setStatusFilter,
  pagination,
  loadQuestions,
  formatDate,
  setSelectedQuestion,
  setAnswerForm,
  handleIgnoreQuestion
}) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="pending">En attente</option>
            <option value="answered">Répondues</option>
            <option value="ignored">Ignorées</option>
            <option value="all">Toutes</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Aucune question {statusFilter === 'pending' ? 'en attente' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      question.status === 'answered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {question.status === 'pending' ? 'En attente' :
                       question.status === 'answered' ? 'Répondue' : 'Ignorée'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Posée {question.count}x
                    </span>
                  </div>
                  <p className="text-lg text-gray-900 font-medium mb-2">
                    "{question.question}"
                  </p>
                  {question.similarQuestions && question.similarQuestions.length > 0 && (
                    <div className="text-sm text-gray-500 mb-2">
                      Questions similaires: {question.similarQuestions.map(sq => sq.text).join(', ')}
                    </div>
                  )}
                  {question.answer && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">{question.answer}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                    <span>Créée: {formatDate(question.createdAt)}</span>
                    {question.answeredAt && (
                      <span>Répondue: {formatDate(question.answeredAt)}</span>
                    )}
                  </div>
                </div>
                {question.status === 'pending' && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedQuestion(question);
                        setAnswerForm({ answer: '', keywords: '', category: question.category || 'autre' });
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Répondre
                    </button>
                    <button
                      onClick={() => handleIgnoreQuestion(question._id)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Ignorer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => loadQuestions(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} sur {pagination.totalPages}
          </span>
          <button
            onClick={() => loadQuestions(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;

