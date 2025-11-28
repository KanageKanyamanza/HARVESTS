import React from 'react';
import { ArrowLeft, Save, X, Image as ImageIcon } from 'lucide-react';
import { blogTypes, blogCategories, difficultyLevels } from '../../hooks/useBlogForm';
import SimpleTextEditor from './SimpleTextEditor';
import AutoTranslation from './AutoTranslation';
import ImageUploader from './ImageUploader';
import CloudinaryImage from '../common/CloudinaryImage';

export const BlogFormHeader = ({ isEdit, navigate, loadFromStorage, resetForm }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center space-x-4">
      <button onClick={() => navigate('/admin/blog')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Modifier le blog' : 'Créer un nouveau blog'}</h1>
        <p className="text-gray-600">
          {isEdit ? 'Modifiez les informations du blog' : 'Remplissez les informations pour créer un nouveau blog'}
          {!isEdit && loadFromStorage() && <span className="ml-2 text-blue-600 text-sm">💾 Brouillon sauvegardé</span>}
        </p>
      </div>
    </div>
    {!isEdit && (
      <button type="button" onClick={() => window.confirm('Effacer le brouillon ?') && resetForm()} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200">
        Effacer le brouillon
      </button>
    )}
  </div>
);

export const LanguageConfig = ({ selectedLanguage, setSelectedLanguage, useAutoTranslation, setUseAutoTranslation }) => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-medium text-gray-700">Configuration de rédaction</h3>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="auto-translation" checked={useAutoTranslation} onChange={(e) => setUseAutoTranslation(e.target.checked)} className="rounded border-gray-300 text-primary-600" />
        <label htmlFor="auto-translation" className="text-sm text-gray-700">Traduction automatique</label>
      </div>
    </div>
    
    {useAutoTranslation ? (
      <div className="space-y-3">
        <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded-lg">💡 Mode traduction automatique activé</div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Langue :</span>
          <div className="flex space-x-2">
            {['fr', 'en'].map(lang => (
              <button key={lang} type="button" onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${selectedLanguage === lang ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                {lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-sm text-gray-600">Mode manuel : Remplissez les champs en français et en anglais séparément.</div>
    )}
  </div>
);

export const BasicInfoFields = ({ formData, handleTitleChange, handleChange, handleBilingualChange, selectedLanguage }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre Français *</label>
        <input type="text" value={formData.title.fr || ''} onChange={(e) => handleTitleChange('fr', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Titre en français" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre Anglais *</label>
        <input type="text" value={formData.title.en || ''} onChange={(e) => handleTitleChange('en', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Title in English" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2">
          {blogTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
        <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2">
          {blogCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Résumé Français *</label>
        <textarea value={formData.excerpt.fr || ''} onChange={(e) => handleBilingualChange('excerpt', 'fr', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} placeholder="Résumé en français..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Résumé Anglais *</label>
        <textarea value={formData.excerpt.en || ''} onChange={(e) => handleBilingualChange('excerpt', 'en', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} placeholder="Summary in English..." />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
      <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2">
        <option value="draft">Brouillon</option>
        <option value="published">Publié</option>
        <option value="archived">Archivé</option>
      </select>
    </div>
  </>
);

export const ContentEditors = ({ formData, handleBilingualChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Contenu Français *</label>
      <SimpleTextEditor value={formData.content.fr || ''} onChange={(v) => handleBilingualChange('content', 'fr', v)} placeholder="Rédigez en français..." editorId="blog-content-editor-fr" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Contenu Anglais *</label>
      <SimpleTextEditor value={formData.content.en || ''} onChange={(v) => handleBilingualChange('content', 'en', v)} placeholder="Write in English..." editorId="blog-content-editor-en" />
    </div>
  </div>
);

export const CaseStudyFields = ({ formData, handleChange }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'étude de cas</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Entreprise" value={formData.caseStudy.company} onChange={(v) => handleChange('caseStudy.company', v)} placeholder="Nom de l'entreprise" />
      <Input label="Secteur" value={formData.caseStudy.sector} onChange={(v) => handleChange('caseStudy.sector', v)} placeholder="Secteur d'activité" />
    </div>
    <Textarea label="Défi" value={formData.caseStudy.challenge} onChange={(v) => handleChange('caseStudy.challenge', v)} placeholder="Décrivez le défi" />
    <Textarea label="Solution" value={formData.caseStudy.solution} onChange={(v) => handleChange('caseStudy.solution', v)} placeholder="Décrivez la solution" />
    <Textarea label="Résultats" value={formData.caseStudy.results} onChange={(v) => handleChange('caseStudy.results', v)} placeholder="Décrivez les résultats" />
  </div>
);

export const TutorialFields = ({ formData, handleChange }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du tutoriel</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
        <select value={formData.tutorial.difficulty} onChange={(e) => handleChange('tutorial.difficulty', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2">
          {difficultyLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>
      <Input label="Durée" value={formData.tutorial.duration} onChange={(v) => handleChange('tutorial.duration', v)} placeholder="ex: 15 minutes" />
    </div>
  </div>
);

export const TestimonialFields = ({ formData, handleChange }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du témoignage</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Nom du client" value={formData.testimonial.clientName} onChange={(v) => handleChange('testimonial.clientName', v)} />
      <Input label="Entreprise" value={formData.testimonial.clientCompany} onChange={(v) => handleChange('testimonial.clientCompany', v)} />
    </div>
    <Input label="Poste" value={formData.testimonial.clientPosition} onChange={(v) => handleChange('testimonial.clientPosition', v)} className="mt-4" />
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Note (1-5)</label>
      <input type="number" min="1" max="5" value={formData.testimonial.rating} onChange={(e) => handleChange('testimonial.rating', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    </div>
  </div>
);

export const TagsField = ({ formData, newTag, setNewTag, addTag, removeTag }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
    <div className="flex flex-wrap gap-2 mb-2">
      {formData.tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-primary-600 hover:text-primary-800"><X className="h-3 w-3" /></button>
        </span>
      ))}
    </div>
    <div className="flex flex-wrap gap-2">
      <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 border border-gray-300 rounded-md px-3 py-2" placeholder="Ajouter un tag" />
      <button type="button" onClick={addTag} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Ajouter</button>
    </div>
  </div>
);

export const FeaturedImageField = ({ formData, setFormData, uploadingImage, handleUploadFeaturedImage, fileInputRef }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Image à la une</label>
    {formData.featuredImage?.url ? (
      <div className="relative inline-block">
        <CloudinaryImage src={formData.featuredImage.url} alt="Featured" className="w-64 h-48 object-cover rounded-lg" />
        <button type="button" onClick={() => setFormData(prev => ({ ...prev, featuredImage: { url: '', alt: '', caption: '' } }))} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div onClick={() => !uploadingImage && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${uploadingImage ? 'border-blue-400 bg-blue-50 cursor-wait' : 'border-gray-300 hover:border-green-500 cursor-pointer'}`}>
        {uploadingImage ? (
          <><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div><p className="text-blue-600 font-medium">Upload en cours...</p></>
        ) : (
          <><ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" /><p className="text-gray-600">Cliquez pour uploader</p></>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadFeaturedImage} disabled={uploadingImage} className="hidden" />
      </div>
    )}
  </div>
);

export const SEOFields = ({ formData, handleChange }) => (
  <div className="border-t border-gray-200 pt-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">SEO</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre SEO <span className="text-sm text-gray-500">({formData.metaTitle.length}/60)</span></label>
        <input type="text" value={formData.metaTitle} onChange={(e) => e.target.value.length <= 60 && handleChange('metaTitle', e.target.value)} className={`w-full border rounded-md px-3 py-2 ${formData.metaTitle.length > 50 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'}`} placeholder="Titre SEO" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description SEO <span className="text-sm text-gray-500">({formData.metaDescription.length}/160)</span></label>
        <textarea value={formData.metaDescription} onChange={(e) => e.target.value.length <= 160 && handleChange('metaDescription', e.target.value)} className={`w-full border rounded-md px-3 py-2 ${formData.metaDescription.length > 140 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'}`} rows={3} placeholder="Description SEO" />
      </div>
    </div>
  </div>
);

export const FormActions = ({ loading, isEdit, navigate }) => (
  <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
    <button type="button" onClick={() => navigate('/admin/blog')} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annuler</button>
    <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center">
      {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Save className="h-4 w-4 mr-2" />}
      {isEdit ? 'Mettre à jour' : 'Créer'}
    </button>
  </div>
);

const Input = ({ label, value, onChange, placeholder, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder={placeholder} />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder }) => (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} placeholder={placeholder} />
  </div>
);

