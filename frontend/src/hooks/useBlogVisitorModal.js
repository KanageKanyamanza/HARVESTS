import { useState, useEffect, useCallback, useRef } from 'react';
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
  const hasCheckedRef = useRef(false);
  const currentBlogIdRef = useRef(null);

  // Soumettre le formulaire
  const handleFormSubmit = useCallback(async (formData) => {
    try {
      const metrics = trackingService.getMetrics();
      
      // S'assurer que tous les champs requis sont présents avec des valeurs par défaut
      const submitData = {
        firstName: formData.firstName || 'Utilisateur',
        lastName: formData.lastName || '',
        email: formData.email || '',
        country: formData.country || 'Unknown',
        blogId,
        blogTitle,
        blogSlug,
        scrollDepth: metrics.scrollDepth || 0,
        timeOnPage: metrics.timeOnPage || 0
      };

      // Validation finale avant envoi
      if (!submitData.firstName || !submitData.lastName || !submitData.email || !submitData.country) {
        console.error('Données incomplètes pour la soumission:', submitData);
        throw new Error('Tous les champs sont requis');
      }
      
      await blogApiService.submitVisitorForm(submitData);

      // Fermer le modal après soumission réussie
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      throw error;
    }
  }, [blogId, blogTitle, blogSlug]);

  // Vérifier si l'utilisateur est connecté et soumettre automatiquement
  const checkAuthenticatedUser = useCallback(async () => {
    if (!isAuthenticated || !user || !blogId || hasShownModal) return;
    
    try {
      setIsAuthenticatedUser(true);
      setHasShownModal(true); // Marquer comme déjà traité pour éviter l'affichage du modal
      // Récupérer les informations de l'utilisateur
      const userData = {
        firstName: user.firstName || user.name?.split(' ')[0] || 'Utilisateur',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        country: user.country || user.address?.country || 'Unknown'
      };

      // Vérifier que tous les champs requis sont présents
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.country) {
        console.warn('Données utilisateur incomplètes, impossible de soumettre automatiquement');
        return;
      }

      // Soumettre automatiquement avec les données de l'utilisateur connecté (sans afficher le modal)
      await handleFormSubmit(userData);
    } catch (error) {
      console.error('Erreur lors de la soumission automatique:', error);
    }
  }, [isAuthenticated, user, blogId, handleFormSubmit, hasShownModal]);

  // Vérifier si le visiteur existe (pour les invités)
  const checkVisitor = useCallback(async () => {
    // Ne pas vérifier si l'utilisateur est connecté ou si déjà traité
    if (isAuthenticated || hasShownModal) return;

    try {
      const response = await blogApiService.checkVisitorByIP();
      if (response.data.exists) {
        setIsReturningVisitor(true);
        setVisitorData(response.data.visitor);
        setHasShownModal(true); // Marquer comme déjà traité
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
  }, [isAuthenticated, handleFormSubmit, hasShownModal]);

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
    // Réinitialiser si le blogId change
    if (currentBlogIdRef.current !== blogId) {
      hasCheckedRef.current = false;
      currentBlogIdRef.current = blogId;
    }

    // Ne vérifier qu'une seule fois par blog
    if (hasCheckedRef.current || !blogId) return;

    if (isAuthenticated && user && blogId) {
      hasCheckedRef.current = true;
      checkAuthenticatedUser();
    } else if (!isAuthenticated && blogId) {
      hasCheckedRef.current = true;
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

