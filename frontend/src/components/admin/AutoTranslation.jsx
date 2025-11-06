import React, { useState } from 'react';
import { Languages, Check, X, Loader } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../contexts/NotificationContext';

const AutoTranslation = ({
  formData,
  onFormDataChange,
  selectedLanguage
}) => {
  const { showSuccess, showError } = useNotifications();
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState({});
  const [showTranslations, setShowTranslations] = useState(false);

  const fieldsToTranslate = ['title', 'excerpt', 'content'];

  const handleTranslate = async () => {
    setTranslating(true);
    setShowTranslations(true);

    try {
      const sourceLang = selectedLanguage;
      const targetLang = selectedLanguage === 'fr' ? 'en' : 'fr';

      const translationPromises = fieldsToTranslate.map(async (field) => {
        const sourceText = formData[field]?.[sourceLang] || '';
        if (!sourceText.trim()) return null;

        try {
          const response = await adminService.translateText(sourceText, sourceLang, targetLang);

          return {
            field,
            translated: response.data?.translatedText || response.translatedText || sourceText
          };
        } catch (error) {
          console.error(`Erreur de traduction pour ${field}:`, error);
          return {
            field,
            translated: sourceText,
            error: true
          };
        }
      });

      const results = await Promise.all(translationPromises);
      const newTranslations = {};

      results.forEach((result) => {
        if (result) {
          newTranslations[result.field] = result.translated;
        }
      });

      setTranslations(newTranslations);
      showSuccess('Traduction terminée');
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      showError('Erreur lors de la traduction');
    } finally {
      setTranslating(false);
    }
  };

  const applyTranslation = (field) => {
    const targetLang = selectedLanguage === 'fr' ? 'en' : 'fr';
    onFormDataChange({
      ...formData,
      [field]: {
        ...formData[field],
        [targetLang]: translations[field]
      }
    });
    showSuccess(`${field} traduit et appliqué`);
  };

  const applyAllTranslations = () => {
    const targetLang = selectedLanguage === 'fr' ? 'en' : 'fr';
    const updatedFormData = { ...formData };

    fieldsToTranslate.forEach((field) => {
      if (translations[field]) {
        updatedFormData[field] = {
          ...updatedFormData[field],
          [targetLang]: translations[field]
        };
      }
    });

    onFormDataChange(updatedFormData);
    showSuccess('Toutes les traductions ont été appliquées');
    setShowTranslations(false);
    setTranslations({});
  };

  const hasContentToTranslate = fieldsToTranslate.some(
    (field) => formData[field]?.[selectedLanguage]?.trim()
  );

  if (!hasContentToTranslate) {
    return null;
  }

  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Languages className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-900">
            Traduction automatique
          </h3>
        </div>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={translating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {translating ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Traduction en cours...</span>
            </>
          ) : (
            <>
              <Languages className="h-4 w-4" />
              <span>Traduire</span>
            </>
          )}
        </button>
      </div>

      {showTranslations && Object.keys(translations).length > 0 && (
        <div className="space-y-4">
          {fieldsToTranslate.map((field) => {
            if (!translations[field]) return null;

            const fieldLabels = {
              title: 'Titre',
              excerpt: 'Résumé',
              content: 'Contenu'
            };

            return (
              <div key={field} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {fieldLabels[field]}
                  </h4>
                  <button
                    type="button"
                    onClick={() => applyTranslation(field)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center space-x-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Appliquer</span>
                  </button>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                  {translations[field]}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowTranslations(false);
                setTranslations({});
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={applyAllTranslations}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Appliquer toutes les traductions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoTranslation;

