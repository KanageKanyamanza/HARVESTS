import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import uploadService from '../services/uploadService';
import { useNotifications } from '../contexts/NotificationContext';

const initialFormData = {
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
};

export const useBlogForm = (id = null) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(isEdit);
  const [newTag, setNewTag] = useState('');
  const [newMetric, setNewMetric] = useState({ label: '', value: '', description: '' });
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [useAutoTranslation, setUseAutoTranslation] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const STORAGE_KEY = `blog-edit-draft-${id || 'new'}`;

  const saveToStorage = useCallback((data) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [STORAGE_KEY]);

  const loadFromStorage = useCallback(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : null; } catch { return null; }
  }, [STORAGE_KEY]);

  const clearStorage = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, [STORAGE_KEY]);

  // Load blog for edit
  useEffect(() => {
    if (isEdit && id) {
      setFetchingBlog(true);
      adminService.getBlog(id)
        .then(response => {
          const blog = response.data?.data?.blog || response.data?.blog;
          if (blog) {
            setFormData(prev => ({
              ...prev,
              ...blog,
              title: blog.title || { fr: '', en: '' },
              slug: blog.slug || { fr: '', en: '' },
              excerpt: blog.excerpt || { fr: '', en: '' },
              content: blog.content || { fr: '', en: '' },
              caseStudy: blog.caseStudy || prev.caseStudy,
              tutorial: blog.tutorial || prev.tutorial,
              testimonial: blog.testimonial || prev.testimonial
            }));
          }
        })
        .catch(err => showError('Erreur lors du chargement du blog'))
        .finally(() => setFetchingBlog(false));
    }
  }, [id, isEdit, showError]);

  // Load draft for new
  useEffect(() => {
    if (!isEdit) {
      const savedData = loadFromStorage();
      if (savedData) {
        setFormData(savedData);
        if (savedData.selectedLanguage) setSelectedLanguage(savedData.selectedLanguage);
        if (savedData.useAutoTranslation !== undefined) setUseAutoTranslation(savedData.useAutoTranslation);
        showSuccess('Brouillon restauré');
      }
    }
  }, [isEdit, loadFromStorage, showSuccess]);

  // Auto-save draft
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage({ ...formData, selectedLanguage, useAutoTranslation, lastSaved: new Date().toISOString() });
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData, selectedLanguage, useAutoTranslation, saveToStorage]);

  const handleChange = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const handleBilingualChange = useCallback((field, language, value) => {
    setFormData(prev => ({ ...prev, [field]: { ...prev[field], [language]: value } }));
  }, []);

  const generateSlug = (title) => title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-');

  const handleTitleChange = useCallback((language, value) => {
    setFormData(prev => ({
      ...prev,
      title: { ...prev.title, [language]: value },
      slug: { ...prev.slug, [language]: generateSlug(value) }
    }));
  }, []);

  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  }, []);

  const addMetric = useCallback(() => {
    if (newMetric.label.trim() && newMetric.value.trim()) {
      setFormData(prev => ({ ...prev, caseStudy: { ...prev.caseStudy, metrics: [...prev.caseStudy.metrics, { ...newMetric }] } }));
      setNewMetric({ label: '', value: '', description: '' });
    }
  }, [newMetric]);

  const removeMetric = useCallback((index) => {
    setFormData(prev => ({ ...prev, caseStudy: { ...prev.caseStudy, metrics: prev.caseStudy.metrics.filter((_, i) => i !== index) } }));
  }, []);

  const addPrerequisite = useCallback(() => {
    if (newPrerequisite.trim() && !formData.tutorial.prerequisites.includes(newPrerequisite.trim())) {
      setFormData(prev => ({ ...prev, tutorial: { ...prev.tutorial, prerequisites: [...prev.tutorial.prerequisites, newPrerequisite.trim()] } }));
      setNewPrerequisite('');
    }
  }, [newPrerequisite, formData.tutorial.prerequisites]);

  const removePrerequisite = useCallback((p) => {
    setFormData(prev => ({ ...prev, tutorial: { ...prev.tutorial, prerequisites: prev.tutorial.prerequisites.filter(x => x !== p) } }));
  }, []);

  const handleUploadFeaturedImage = useCallback(async (e) => {
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
          featuredImage: { url: imageUrl, cloudinaryId: imageData?.public_id, alt: prev.featuredImage?.alt || '', caption: prev.featuredImage?.caption || '' }
        }));
        showSuccess('Image uploadée avec succès');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [showSuccess, showError]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.title[selectedLanguage]?.trim()) { showError('Le titre est obligatoire'); return; }
    if (!formData.content[selectedLanguage]?.trim()) { showError('Le contenu est obligatoire'); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await adminService.updateBlog(id, formData);
        showSuccess('Blog mis à jour avec succès');
      } else {
        await adminService.createBlog(formData);
        clearStorage();
        showSuccess('Blog créé avec succès');
      }
      navigate('/admin/blog');
    } catch (error) {
      showError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }, [formData, selectedLanguage, isEdit, id, navigate, showSuccess, showError, clearStorage]);

  const resetForm = useCallback(() => {
    clearStorage();
    setFormData(initialFormData);
    showSuccess('Brouillon effacé');
  }, [clearStorage, showSuccess]);

  return {
    formData, setFormData, loading, fetchingBlog, isEdit,
    newTag, setNewTag, newMetric, setNewMetric, newPrerequisite, setNewPrerequisite,
    selectedLanguage, setSelectedLanguage, useAutoTranslation, setUseAutoTranslation,
    uploadingImage, fileInputRef, loadFromStorage,
    handleChange, handleBilingualChange, handleTitleChange,
    addTag, removeTag, addMetric, removeMetric, addPrerequisite, removePrerequisite,
    handleUploadFeaturedImage, handleSubmit, resetForm, navigate
  };
};

export const blogTypes = [
  { value: 'article', label: 'Article' },
  { value: 'etude-cas', label: 'Étude de cas' },
  { value: 'tutoriel', label: 'Tutoriel' },
  { value: 'actualite', label: 'Actualité' },
  { value: 'temoignage', label: 'Témoignage' }
];

export const blogCategories = [
  { value: 'strategie', label: 'Stratégie' },
  { value: 'technologie', label: 'Technologie' },
  { value: 'finance', label: 'Finance' },
  { value: 'ressources-humaines', label: 'Ressources Humaines' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Opérations' },
  { value: 'gouvernance', label: 'Gouvernance' }
];

export const difficultyLevels = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' }
];

