import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, Image as ImageIcon, Tag } from 'lucide-react';
import { adminService } from '../../services/adminService';
import uploadService from '../../services/uploadService';
import { useNotifications } from '../../contexts/NotificationContext';
import ImageUploader from '../../components/admin/ImageUploader';
import SimpleTextEditor from '../../components/admin/SimpleTextEditor';
import AutoTranslation from '../../components/admin/AutoTranslation';
import CloudinaryImage from '../../components/common/CloudinaryImage';

const AdminBlogCreate = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const isEdit = false;
  const id = null;

  const [formData, setFormData] = useState({
    title: { fr: '', en: '' },
    slug: { fr: '', en: '' },
    excerpt: { fr: '', en: '' },
    content: { fr: '', en: '' },
    type: 'article',
    category: 'strategie',
    tags: [],
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    featuredImage: { url: '', alt: '', caption: '' },
    images: [],
    caseStudy: {
      company: '',
      sector: '',
      companySize: '',
      challenge: '',
      solution: '',
      results: '',
      metrics: []
    },
    tutorial: {
      difficulty: 'debutant',
      duration: '',
      prerequisites: []
    },
    testimonial: {
      clientName: '',
      clientCompany: '',
      clientPosition: '',
      clientPhoto: '',
      rating: 5
    }
  });

  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newMetric, setNewMetric] = useState({ label: '', value: '', description: '' });
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [useAutoTranslation, setUseAutoTranslation] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const STORAGE_KEY = `blog-edit-draft-${id || 'new'}`;

  const saveToStorage = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Impossible de sauvegarder le brouillon:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Impossible de charger le brouillon:', error);
      return null;
    }
  };

  const clearStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Impossible d\'effacer le brouillon:', error);
    }
  };

  const blogTypes = [
    { value: 'article', label: 'Article' },
    { value: 'etude-cas', label: 'Étude de cas' },
    { value: 'tutoriel', label: 'Tutoriel' },
    { value: 'actualite', label: 'Actualité' },
    { value: 'temoignage', label: 'Témoignage' }
  ];

  const blogCategories = [
    { value: 'strategie', label: 'Stratégie' },
    { value: 'technologie', label: 'Technologie' },
    { value: 'finance', label: 'Finance' },
    { value: 'ressources-humaines', label: 'Ressources Humaines' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Opérations' },
    { value: 'gouvernance', label: 'Gouvernance' }
  ];

  const difficultyLevels = [
    { value: 'debutant', label: 'Débutant' },
    { value: 'intermediaire', label: 'Intermédiaire' },
    { value: 'avance', label: 'Avancé' }
  ];

  useEffect(() => {
    if (!isEdit) {
      const savedData = loadFromStorage();
      if (savedData) {
        setFormData(savedData);
        if (savedData.selectedLanguage) setSelectedLanguage(savedData.selectedLanguage);
        if (savedData.useAutoTranslation !== undefined) setUseAutoTranslation(savedData.useAutoTranslation);
        showSuccess('Brouillon restauré depuis la dernière session');
      }
    }
  }, [isEdit]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const dataToSave = {
        ...formData,
        selectedLanguage,
        useAutoTranslation,
        lastSaved: new Date().toISOString()
      };
      saveToStorage(dataToSave);
      
      if (formData.title?.fr?.trim() || formData.title?.en?.trim() || 
          formData.content?.fr?.trim() || formData.content?.en?.trim()) {
        // Sauvegarde silencieuse, pas de notification
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, selectedLanguage, useAutoTranslation]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleBilingualChange = (field, language, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleChange = (language, value) => {
    setFormData(prev => ({
      ...prev,
      title: {
        ...prev.title,
        [language]: value
      },
      slug: {
        ...prev.slug,
        [language]: generateSlug(value)
      }
    }));
  };

  const handleMetaTitleChange = (value) => {
    if (value.length <= 60) {
      handleChange('metaTitle', value);
    }
  };

  const handleMetaDescriptionChange = (value) => {
    if (value.length <= 160) {
      handleChange('metaDescription', value);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addMetric = () => {
    if (newMetric.label.trim() && newMetric.value.trim()) {
      setFormData(prev => ({
        ...prev,
        caseStudy: {
          ...prev.caseStudy,
          metrics: [...prev.caseStudy.metrics, { ...newMetric }]
        }
      }));
      setNewMetric({ label: '', value: '', description: '' });
    }
  };

  const removeMetric = (index) => {
    setFormData(prev => ({
      ...prev,
      caseStudy: {
        ...prev.caseStudy,
        metrics: prev.caseStudy.metrics.filter((_, i) => i !== index)
      }
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.tutorial.prerequisites.includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        tutorial: {
          ...prev.tutorial,
          prerequisites: [...prev.tutorial.prerequisites, newPrerequisite.trim()]
        }
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisiteToRemove) => {
    setFormData(prev => ({
      ...prev,
      tutorial: {
        ...prev.tutorial,
        prerequisites: prev.tutorial.prerequisites.filter(p => p !== prerequisiteToRemove)
      }
    }));
  };

  const handleUploadFeaturedImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'harvests/blogs');
      
      const response = await uploadService.uploadToCloudinary(formDataUpload);
      const imageData = response.data?.data || response.data;
      const imageUrl = imageData?.secure_url || imageData?.url;
      
      if (imageUrl) {
        setFormData(prev => ({
          ...prev,
          featuredImage: {
            url: imageUrl,
            cloudinaryId: imageData?.public_id,
            alt: prev.featuredImage?.alt || '',
            caption: prev.featuredImage?.caption || ''
          }
        }));
        showSuccess('Image uploadée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      showError(error.response?.data?.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title[selectedLanguage]?.trim()) {
      showError('Le titre est obligatoire');
      return;
    }
    
    if (!formData.content[selectedLanguage]?.trim()) {
      showError('Le contenu est obligatoire');
      return;
    }

    setLoading(true);
    try {
      await adminService.createBlog(formData);
      clearStorage();
      showSuccess('Blog créé avec succès');
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving blog:', error);
      showError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-5 pb-8 pt-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/blog')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Modifier le blog' : 'Créer un nouveau blog'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Modifiez les informations du blog' : 'Remplissez les informations pour créer un nouveau blog'}
                {!isEdit && loadFromStorage() && (
                  <span className="ml-2 text-blue-600 text-sm">💾 Brouillon sauvegardé automatiquement</span>
                )}
              </p>
            </div>
          </div>
          
          {!isEdit && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir effacer le brouillon ?')) {
                  clearStorage();
                  setFormData({
                    title: { fr: '', en: '' },
                    slug: { fr: '', en: '' },
                    excerpt: { fr: '', en: '' },
                    content: { fr: '', en: '' },
                    type: 'article',
                    category: 'strategie',
                    tags: [],
                    status: 'draft',
                    metaTitle: '',
                    metaDescription: '',
                    featuredImage: { url: '', alt: '', caption: '' },
                    images: [],
                    caseStudy: { company: '', sector: '', companySize: '', challenge: '', solution: '', results: '', metrics: [] },
                    tutorial: { difficulty: 'debutant', duration: '', prerequisites: [] },
                    testimonial: { clientName: '', clientCompany: '', clientPosition: '', clientPhoto: '', rating: 5 }
                  });
                  showSuccess('Brouillon effacé');
                }
              }}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md border border-red-200"
            >
              Effacer le brouillon
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Configuration de rédaction */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Configuration de rédaction
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-translation"
                    checked={useAutoTranslation}
                    onChange={(e) => setUseAutoTranslation(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="auto-translation" className="text-sm text-gray-700">
                    Traduction automatique
                  </label>
                </div>
              </div>
              
              {useAutoTranslation ? (
                <div className="space-y-3">
                  <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded-lg">
                    💡 <strong>Mode traduction automatique :</strong> Rédigez dans votre langue préférée, 
                    la traduction automatique générera l'autre version. Vous pourrez réviser les traductions avant de les appliquer.
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Langue de rédaction :</span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLanguage('fr')}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          selectedLanguage === 'fr'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        🇫🇷 Français
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLanguage('en')}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          selectedLanguage === 'en'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Mode manuel : Remplissez les champs en français et en anglais séparément.
                </div>
              )}
            </div>

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre {selectedLanguage === 'fr' ? 'Français' : 'Anglais'} *
                </label>
                <input
                  type="text"
                  value={formData.title[selectedLanguage] || ''}
                  onChange={(e) => handleTitleChange(selectedLanguage, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={`Titre du blog en ${selectedLanguage === 'fr' ? 'français' : 'anglais'}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {blogTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Slug généré automatiquement */}
            {formData.slug[selectedLanguage] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du blog {selectedLanguage === 'fr' ? 'Français' : 'Anglais'} (générée automatiquement)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">/blog/</span>
                  <input
                    type="text"
                    value={formData.slug[selectedLanguage] || ''}
                    onChange={(e) => handleBilingualChange('slug', selectedLanguage, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                    placeholder="slug-du-blog"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {blogCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            {/* Titre et Résumé côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre Français *
                </label>
                <input
                  type="text"
                  value={formData.title.fr || ''}
                  onChange={(e) => handleTitleChange('fr', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Titre du blog en français"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre Anglais *
                </label>
                <input
                  type="text"
                  value={formData.title.en || ''}
                  onChange={(e) => handleTitleChange('en', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Blog title in English"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résumé Français *
                </label>
                <textarea
                  value={formData.excerpt.fr || ''}
                  onChange={(e) => handleBilingualChange('excerpt', 'fr', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Résumé de votre article en français..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résumé Anglais *
                </label>
                <textarea
                  value={formData.excerpt.en || ''}
                  onChange={(e) => handleBilingualChange('excerpt', 'en', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Article summary in English..."
                />
              </div>
            </div>

            {/* Contenu côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu Français *
                </label>
                <SimpleTextEditor
                  value={formData.content.fr || ''}
                  onChange={(value) => handleBilingualChange('content', 'fr', value)}
                  placeholder="Rédigez votre article en français..."
                  className="w-full"
                  editorId="blog-content-editor-fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu Anglais *
                </label>
                <SimpleTextEditor
                  value={formData.content.en || ''}
                  onChange={(value) => handleBilingualChange('content', 'en', value)}
                  placeholder="Write your article in English..."
                  className="w-full"
                  editorId="blog-content-editor-en"
                />
              </div>
            </div>

            {/* Traduction automatique */}
            {useAutoTranslation && (
              <AutoTranslation
                formData={formData}
                onFormDataChange={setFormData}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* Champs spécifiques selon le type */}
            {formData.type === 'etude-cas' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'étude de cas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.caseStudy.company}
                      onChange={(e) => handleChange('caseStudy.company', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secteur
                    </label>
                    <input
                      type="text"
                      value={formData.caseStudy.sector}
                      onChange={(e) => handleChange('caseStudy.sector', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Secteur d'activité"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Défi
                  </label>
                  <textarea
                    value={formData.caseStudy.challenge}
                    onChange={(e) => handleChange('caseStudy.challenge', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Décrivez le défi rencontré"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution
                  </label>
                  <textarea
                    value={formData.caseStudy.solution}
                    onChange={(e) => handleChange('caseStudy.solution', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Décrivez la solution mise en place"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Résultats
                  </label>
                  <textarea
                    value={formData.caseStudy.results}
                    onChange={(e) => handleChange('caseStudy.results', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Décrivez les résultats obtenus"
                  />
                </div>
              </div>
            )}

            {formData.type === 'tutoriel' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du tutoriel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulté
                    </label>
                    <select
                      value={formData.tutorial.difficulty}
                      onChange={(e) => handleChange('tutorial.difficulty', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      {difficultyLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée
                    </label>
                    <input
                      type="text"
                      value={formData.tutorial.duration}
                      onChange={(e) => handleChange('tutorial.duration', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="ex: 15 minutes"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'temoignage' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du témoignage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du client
                    </label>
                    <input
                      type="text"
                      value={formData.testimonial.clientName}
                      onChange={(e) => handleChange('testimonial.clientName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Nom du client"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.testimonial.clientCompany}
                      onChange={(e) => handleChange('testimonial.clientCompany', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Entreprise du client"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste
                  </label>
                  <input
                    type="text"
                    value={formData.testimonial.clientPosition}
                    onChange={(e) => handleChange('testimonial.clientPosition', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Poste du client"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.testimonial.rating}
                    onChange={(e) => handleChange('testimonial.rating', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ajouter un tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Images du blog */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images du blog
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Comment positionner vos images :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>En haut :</strong> Images avant le contenu</li>
                  <li><strong>Début du contenu :</strong> Images juste avant le premier paragraphe</li>
                  <li><strong>Au milieu :</strong> Images entre les paragraphes</li>
                  <li><strong>En bas :</strong> Images après le contenu</li>
                  <li><strong>Fin du contenu :</strong> Images juste après le dernier paragraphe</li>
                  <li><strong>Dans le texte :</strong> Copiez le HTML généré et collez-le dans votre contenu HTML</li>
                </ul>
              </div>
              <ImageUploader
                images={formData.images}
                onImagesChange={(images) => handleChange('images', images)}
                maxImages={10}
                showPositionControls={true}
              />
            </div>

            {/* Image à la une */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image à la une
              </label>
              {formData.featuredImage?.url ? (
                <div className="relative inline-block">
                  <CloudinaryImage
                    src={formData.featuredImage.url}
                    alt="Featured"
                    className="w-64 h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featuredImage: { url: '', alt: '', caption: '' } }))}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !uploadingImage && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    uploadingImage 
                      ? 'border-blue-400 bg-blue-50 cursor-wait' 
                      : 'border-gray-300 hover:border-green-500 cursor-pointer'
                  }`}
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-blue-600 font-medium">Upload en cours...</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-600">Cliquez pour uploader une image</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFeaturedImage}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* SEO */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre SEO
                    <span className="text-sm text-gray-500 ml-2">
                      ({formData.metaTitle.length}/60 caractères)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleMetaTitleChange(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      formData.metaTitle.length > 60 
                        ? 'border-red-300 bg-red-50' 
                        : formData.metaTitle.length > 50 
                          ? 'border-yellow-300 bg-yellow-50' 
                          : 'border-gray-300'
                    }`}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                  {formData.metaTitle.length > 60 && (
                    <p className="text-red-500 text-sm mt-1">
                      Le titre SEO ne peut pas dépasser 60 caractères
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description SEO
                    <span className="text-sm text-gray-500 ml-2">
                      ({formData.metaDescription.length}/160 caractères)
                    </span>
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleMetaDescriptionChange(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      formData.metaDescription.length > 160 
                        ? 'border-red-300 bg-red-50' 
                        : formData.metaDescription.length > 140 
                          ? 'border-yellow-300 bg-yellow-50' 
                          : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="Description pour les moteurs de recherche"
                  />
                  {formData.metaDescription.length > 160 && (
                    <p className="text-red-500 text-sm mt-1">
                      La description SEO ne peut pas dépasser 160 caractères
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => navigate('/admin/blog')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBlogCreate;
