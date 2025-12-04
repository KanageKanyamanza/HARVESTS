import React from 'react';

const AnswerModal = ({ selectedQuestion, answerForm, setAnswerForm, saving, onClose, onSubmit }) => {
  if (!selectedQuestion) return null;

  return (
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
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={onSubmit}
              disabled={saving || !answerForm.answer.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer la réponse'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerModal;

