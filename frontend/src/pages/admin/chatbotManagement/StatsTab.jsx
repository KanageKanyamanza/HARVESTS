import React from 'react';
import { MessageCircle, Users, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

const StatsTab = ({ stats, setActiveTab, setSelectedQuestion }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      {stats.overview && (
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
      {stats.feedbackStats && (
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
      {stats.topUnanswered && stats.topUnanswered.length > 0 && (
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
      {stats.dailyStats && stats.dailyStats.length > 0 && (
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
  );
};

export default StatsTab;

