import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Search,
  MessageSquare
} from 'lucide-react';

const AdvancedStatsTab = ({ stats }) => {
  if (!stats) return null;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0);
  };

  const getGrowthColor = (growth) => {
    if (!growth || growth === '0%') return 'text-gray-600';
    return growth.startsWith('-') ? 'text-red-600' : 'text-green-600';
  };

  const getGrowthIcon = (growth) => {
    if (!growth || growth === '0%') return null;
    return growth.startsWith('-') ? TrendingDown : TrendingUp;
  };

  return (
    <div className="space-y-6">
      {/* Métriques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Croissance */}
        {stats.overview?.growth && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Croissance</p>
                <p className={`text-2xl font-bold ${getGrowthColor(stats.overview.growth)}`}>
                  {stats.overview.growth}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  vs période précédente
                </p>
              </div>
              {(() => {
                const Icon = getGrowthIcon(stats.overview.growth);
                return Icon ? <Icon className="h-10 w-10 text-gray-300" /> : <Activity className="h-10 w-10 text-gray-300" />;
              })()}
            </div>
          </div>
        )}

        {/* Taux de satisfaction */}
        {stats.overview?.satisfactionRate && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taux de satisfaction</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.overview.satisfactionRate}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Basé sur les feedbacks
                </p>
              </div>
              <Target className="h-10 w-10 text-green-300" />
            </div>
          </div>
        )}

        {/* Temps de réponse moyen */}
        {stats.overview?.avgResponseTime && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Temps de réponse</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.overview.avgResponseTime.avg}ms
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Moyenne
                </p>
              </div>
              <Clock className="h-10 w-10 text-blue-300" />
            </div>
          </div>
        )}

        {/* Questions totales */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Questions posées</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.overview?.totalInteractions || 0)}
              </p>
            </div>
            <MessageSquare className="h-10 w-10 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Graphiques avancés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par type de question */}
        {stats.questionTypeDistribution && Object.keys(stats.questionTypeDistribution).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-green-600" />
              Types de questions
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.questionTypeDistribution)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([type, data]) => {
                  const typeLabels = {
                    'how': 'Comment',
                    'what': 'Quoi',
                    'when': 'Quand',
                    'where': 'Où',
                    'why': 'Pourquoi',
                    'how_much': 'Combien',
                    'yes_no': 'Oui/Non',
                    'general': 'Général'
                  };
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {typeLabels[type] || type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {data.count} ({data.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Distribution par intention */}
        {stats.intentDistribution && stats.intentDistribution.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Intentions détectées
            </h3>
            <div className="space-y-3">
              {stats.intentDistribution.slice(0, 8).map((intent) => {
                const intentLabels = {
                  'GREETING': 'Salutation',
                  'BOT_CAPABILITIES': 'Capacités',
                  'TRACK_ORDER': 'Suivi commande',
                  'MY_ORDERS': 'Mes commandes',
                  'MY_CART': 'Mon panier',
                  'SEARCH_PRODUCT': 'Recherche produit',
                  'CONTACT_SUPPORT': 'Support'
                };
                return (
                  <div key={intent.intent} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {intentLabels[intent.intent] || intent.intent}
                        </span>
                        <span className="text-sm text-gray-500">
                          {intent.count} ({intent.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${intent.percentage}%` }}
                        />
                      </div>
                      {intent.avgConfidence && (
                        <p className="text-xs text-gray-400 mt-1">
                          Confiance moyenne: {intent.avgConfidence}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activité par heure */}
        {stats.hourlyStats && Object.keys(stats.hourlyStats).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Activité par heure
            </h3>
            <div className="flex items-end space-x-1 h-48">
              {Array.from({ length: 24 }, (_, i) => {
                const count = stats.hourlyStats[i] || 0;
                const maxCount = Math.max(...Object.values(stats.hourlyStats));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end">
                      <div
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: '2px' }}
                        title={`${i}h: ${count} interactions`}
                      />
                    </div>
                    {i % 3 === 0 && (
                      <span className="text-xs text-gray-400 mt-1">{i}h</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top recherches */}
        {stats.topSearches && stats.topSearches.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Search className="h-5 w-5 mr-2 text-orange-600" />
              Top recherches
            </h3>
            <div className="space-y-3">
              {stats.topSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{search.search}</p>
                    <div className="flex items-center mt-1 space-x-4">
                      <span className="text-xs text-gray-500">{search.count}x recherché</span>
                      <span className="text-xs text-green-600">
                        {search.successRate}% de réussite
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top questions */}
        {stats.topQuestions && stats.topQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
              Questions les plus fréquentes
            </h3>
            <div className="space-y-3">
              {stats.topQuestions.map((q, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{q.question}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">{q.count}x posée</span>
                      {q.avgConfidence && (
                        <span className="text-xs text-blue-600">
                          Confiance: {q.avgConfidence}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-400 ml-2">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedStatsTab;

