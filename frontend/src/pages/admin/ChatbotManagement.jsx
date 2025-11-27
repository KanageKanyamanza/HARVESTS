import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, AlertCircle, CheckCircle, XCircle, TrendingUp, Users, Clock, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ChatbotManagement = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerForm, setAnswerForm] = useState({ answer: '', keywords: '', category: 'autre' });
  const [saving, setSaving] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const response = await adminService.getChatStats();
      if (response.status === 'success') {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }, []);

  const loadQuestions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminService.getUnansweredQuestions({
        page,
        limit: 20,
        status: statusFilter
      });
      if (response.status === 'success') {
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Erreur chargement questions:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'questions') {
      loadQuestions();
    }
  }, [activeTab, loadQuestions]);

  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !answerForm.answer.trim()) return;
    
    setSaving(true);
    try {
      const keywords = answerForm.keywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);
      
      await adminService.answerQuestion(selectedQuestion._id, {
        answer: answerForm.answer,
        keywords,
        category: answerForm.category
      });
      
      setSelectedQuestion(null);
      setAnswerForm({ answer: '', keywords: '', category: 'autre' });
      loadQuestions(pagination.currentPage);
      loadStats();
    } catch (error) {
      console.error('Erreur réponse:', error);
      alert('Erreur lors de l\'enregistrement de la réponse');
    } finally {
      setSaving(false);
    }
  };

  const handleIgnoreQuestion = async (id) => {
    if (!window.confirm('Ignorer cette question ?')) return;
    
    try {
      await adminService.ignoreQuestion(id);
      loadQuestions(pagination.currentPage);
      loadStats();
    } catch (error) {
      console.error('Erreur ignore:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageCircle className="h-7 w-7 mr-3 text-green-600" />
            Gestion du Chatbot
          </h1>
          <p className="text-gray-600 mt-1">
            Statistiques d'utilisation et gestion des questions sans réponse
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'stats'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Statistiques
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'questions'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Questions sans réponse
                {stats?.overview?.pendingQuestions > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {stats.overview.pendingQuestions}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Overview Cards */}
            {stats?.overview && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total interactions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.overview.totalInteractions}</p>
                    </div>
                    <MessageCircle className="h-10 w-10 text-green-500 opacity-50" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Utilisateurs uniques</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.overview.uniqueUsers}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-500 opacity-50" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Taux de réponse</p>
                      <p className="text-2xl font-bold text-green-600">{stats.overview.responseRate}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Questions en attente</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.overview.pendingQuestions}</p>
                    </div>
                    <AlertCircle className="h-10 w-10 text-orange-500 opacity-50" />
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Stats */}
            {stats?.feedbackStats && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback utilisateurs</h3>
                <div className="flex items-center space-x-8">
                  <div className="flex items-center">
                    <ThumbsUp className="h-6 w-6 text-green-500 mr-2" />
                    <span className="text-2xl font-bold text-green-600">{stats.feedbackStats.helpful || 0}</span>
                    <span className="text-gray-500 ml-2">utiles</span>
                  </div>
                  <div className="flex items-center">
                    <ThumbsDown className="h-6 w-6 text-red-500 mr-2" />
                    <span className="text-2xl font-bold text-red-600">{stats.feedbackStats.not_helpful || 0}</span>
                    <span className="text-gray-500 ml-2">inutiles</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top Unanswered */}
            {stats?.topUnanswered && stats.topUnanswered.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Top questions sans réponse
                </h3>
                <div className="space-y-3">
                  {stats.topUnanswered.map((q, index) => (
                    <div key={q._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{q.question}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{q.count}x</span>
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setActiveTab('questions');
                          }}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Répondre
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Stats Chart */}
            {stats?.dailyStats && stats.dailyStats.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Activité des 7 derniers jours
                </h3>
                <div className="flex items-end space-x-2 h-40">
                  {stats.dailyStats.map((day) => {
                    const maxCount = Math.max(...stats.dailyStats.map(d => d.count));
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <div key={day._id} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center">
                          <span className="text-xs text-gray-500 mb-1">{day.count}</span>
                          <div
                            className="w-full bg-green-500 rounded-t"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          />
                          {day.noAnswer > 0 && (
                            <div
                              className="w-full bg-orange-400"
                              style={{ height: `${(day.noAnswer / maxCount) * 100}%`, minHeight: '2px' }}
                            />
                          )}
                        </div>
                        <span className="text-xs text-gray-400 mt-2">
                          {new Date(day._id).toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                    <span className="text-gray-600">Avec réponse</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded mr-2" />
                    <span className="text-gray-600">Sans réponse</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
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
        )}

        {/* Answer Modal */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Répondre à la question
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700">"{selectedQuestion.question}"</p>
                  <p className="text-sm text-gray-500 mt-2">Posée {selectedQuestion.count}x</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Réponse *
                    </label>
                    <textarea
                      value={answerForm.answer}
                      onChange={(e) => setAnswerForm({ ...answerForm, answer: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Tapez votre réponse ici..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mots-clés (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={answerForm.keywords}
                      onChange={(e) => setAnswerForm({ ...answerForm, keywords: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="mot1, mot2, mot3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ces mots-clés aideront le bot à trouver cette réponse
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={answerForm.category}
                      onChange={(e) => setAnswerForm({ ...answerForm, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="livraison">Livraison</option>
                      <option value="paiement">Paiement</option>
                      <option value="commande">Commande</option>
                      <option value="compte">Compte</option>
                      <option value="produits">Produits</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAnswerQuestion}
                    disabled={saving || !answerForm.answer.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer la réponse'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotManagement;

