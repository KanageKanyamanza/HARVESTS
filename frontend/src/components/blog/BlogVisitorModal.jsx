import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../hooks/useAuth';

const BlogVisitorModal = ({
  isOpen,
  onClose,
  blogId,
  blogTitle,
  blogSlug,
  isReturningVisitor = false,
  visitorData = null,
  isAuthenticatedUser = false,
  onFormSubmit
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-remplir le formulaire si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user && isOpen) {
      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        country: user.country || user.address?.country || ''
      });
    } else if (isReturningVisitor && visitorData && isOpen) {
      setFormData({
        firstName: visitorData.firstName || '',
        lastName: visitorData.lastName || '',
        email: visitorData.email || '',
        country: visitorData.country || ''
      });
    }
  }, [isAuthenticated, user, isReturningVisitor, visitorData, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.country) {
      showError(t('blog.modal.validationError', 'Veuillez remplir tous les champs'));
      return;
    }

    setIsSubmitting(true);

    try {
      await onFormSubmit({
        ...formData,
        blogId,
        blogTitle,
        blogSlug
      });
      
      showSuccess(
        isReturningVisitor 
          ? t('blog.modal.welcomeBackSuccess', 'Bienvenue de retour !')
          : t('blog.modal.submitSuccess', 'Merci pour votre inscription !')
      );
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError(t('blog.modal.submitError', 'Une erreur est survenue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAuthenticatedUser
              ? t('blog.modal.welcomeTitle', 'Bienvenue !')
              : isReturningVisitor 
              ? t('blog.modal.welcomeBackTitle', 'Bon retour !')
              : t('blog.modal.title', 'Bienvenue !')
            }
          </h2>
          {(isReturningVisitor || isAuthenticatedUser) && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isAuthenticatedUser ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                {t('blog.modal.authenticatedMessage', {
                  firstName: user?.firstName || user?.name?.split(' ')[0] || 'Utilisateur',
                  defaultValue: `Bonjour ${user?.firstName || user?.name?.split(' ')[0] || 'Utilisateur'} !`
                })}
              </p>
              <p className="text-sm text-gray-500">
                {t('blog.modal.authenticatedInfo', 'Vos informations ont été enregistrées automatiquement.')}
              </p>
            </div>
          ) : isReturningVisitor ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                {t('blog.modal.welcomeBackMessage', {
                  firstName: visitorData?.firstName || 'Visiteur',
                  defaultValue: `Bon retour, ${visitorData?.firstName || 'Visiteur'} !`
                })}
              </p>
              <p className="text-sm text-gray-500">
                {t('blog.modal.returningVisitorInfo', 'Vous avez visité {count} articles', {
                  count: visitorData?.totalBlogsVisited || 0
                })}
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-6">
                {t('blog.modal.description', 'Remplissez ce formulaire pour continuer à lire nos articles et recevoir nos dernières actualités.')}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('blog.modal.firstName', 'Prénom')} *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('blog.modal.lastName', 'Nom')} *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('blog.modal.email', 'Email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('blog.modal.country', 'Pays')} *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? t('blog.modal.submitting', 'Envoi...')
                    : t('blog.modal.submit', 'Continuer')
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogVisitorModal;

