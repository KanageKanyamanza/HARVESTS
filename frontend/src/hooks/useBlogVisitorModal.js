import { useState, useEffect, useCallback } from 'react';
import { blogApiService } from '../services/blogService';
import trackingService from '../services/trackingService';
import { useAuth } from './useAuth';

const useBlogVisitorModal = (blogId, blogTitle, blogSlug) => {
  const { user, isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturningVisitor, setIsReturningVisitor] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [hasShownModal, setHasShownModal] = useState(false);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);

  // Soumettre le formulaire
  const handleFormSubmit = useCallback(async (formData) => {
    try {
      const metrics = trackingService.getMetrics();
      
      await blogApiService.submitVisitorForm({
        ...formData,
        blogId,
        blogTitle,
        blogSlug,
        scrollDepth: metrics.scrollDepth,
        timeOnPage: metrics.timeOnPage
      });

      // Fermer le modal après soumission réussie
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      throw error;
    }
  }, [blogId, blogTitle, blogSlug]);

  // Vérifier si l'utilisateur est connecté et soumettre automatiquement
  const checkAuthenticatedUser = useCallback(async () => {
    if (isAuthenticated && user && blogId) {
      try {
        setIsAuthenticatedUser(true);
        setHasShownModal(true); // Marquer comme déjà traité pour éviter l'affichage du modal
        // Récupérer les informations de l'utilisateur
        const userData = {
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          country: user.country || user.address?.country || ''
        };

        // Soumettre automatiquement avec les données de l'utilisateur connecté (sans afficher le modal)
        await handleFormSubmit(userData);
      } catch (error) {
        console.error('Erreur lors de la soumission automatique:', error);
      }
    }
  }, [isAuthenticated, user, blogId, handleFormSubmit]);

  // Vérifier si le visiteur existe (pour les invités)
  const checkVisitor = useCallback(async () => {
    // Ne pas vérifier si l'utilisateur est connecté
    if (isAuthenticated) return;

    try {
      const response = await blogApiService.checkVisitorByIP();
      if (response.data.exists) {
        setIsReturningVisitor(true);
        setVisitorData(response.data.visitor);
        // Soumettre automatiquement pour les visiteurs de retour
        await handleFormSubmit({
          firstName: response.data.visitor.firstName,
          lastName: response.data.visitor.lastName,
          email: response.data.visitor.email,
          country: response.data.visitor.country
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du visiteur:', error);
    }
  }, [isAuthenticated, handleFormSubmit]);

  // Gérer le scroll (seulement pour les invités)
  useEffect(() => {
    // Ne pas gérer le scroll si l'utilisateur est connecté
    if (isAuthenticated) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      setScrollPercentage(percentage);

      // Ouvrir la modal à 10% de scroll (seulement pour nouveaux visiteurs invités)
      if (percentage >= 10 && !hasShownModal && !isReturningVisitor && !isAuthenticated) {
        setIsModalOpen(true);
        setHasShownModal(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShownModal, isReturningVisitor, isAuthenticated]);

  // Timer de 30 secondes (seulement pour les invités)
  useEffect(() => {
    // Ne pas afficher le timer si l'utilisateur est connecté
    if (isAuthenticated || hasShownModal || isReturningVisitor) return;

    const timer = setTimeout(() => {
      if (!hasShownModal && !isAuthenticated) {
        setIsModalOpen(true);
        setHasShownModal(true);
      }
    }, 30000); // 30 secondes

    return () => clearTimeout(timer);
  }, [hasShownModal, isReturningVisitor, isAuthenticated]);

  // Vérifier l'utilisateur connecté ou le visiteur au chargement
  useEffect(() => {
    if (isAuthenticated && user && blogId) {
      checkAuthenticatedUser();
    } else if (!isAuthenticated && blogId) {
      checkVisitor();
    }
  }, [isAuthenticated, user, blogId, checkAuthenticatedUser, checkVisitor]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    // Ne pas permettre de fermer pour les nouveaux visiteurs
    if (!isReturningVisitor) {
      return;
    }
    setIsModalOpen(false);
  }, [isReturningVisitor]);

  return {
    isModalOpen,
    isReturningVisitor,
    visitorData,
    scrollPercentage,
    hasShownModal,
    isAuthenticatedUser,
    openModal,
    closeModal,
    handleFormSubmit
  };
};

export default useBlogVisitorModal;

