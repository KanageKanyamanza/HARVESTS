/**
 * Service de tracking pour les visites de blog
 */
class TrackingService {
  constructor() {
    this.visitId = null;
    this.startTime = null;
    this.maxScrollDepth = 0;
    this.updateInterval = null;
    this.isTracking = false;
    this.lastUpdateTime = null;
    this.debounceTimeout = null;
  }

  /**
   * Initialiser le tracking
   * @param {string} visitId - ID de la visite
   */
  initTracking(visitId) {
    this.visitId = visitId;
    this.startTime = Date.now();
    this.maxScrollDepth = 0;
    this.isTracking = true;
    this.lastUpdateTime = Date.now();

    // Écouter le scroll
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

    // Écouter la fermeture de la page
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
    window.addEventListener('pagehide', this.handlePageUnload.bind(this));
    window.addEventListener('popstate', this.handlePageUnload.bind(this));

    // Mise à jour périodique (toutes les 60 secondes)
    this.updateInterval = setInterval(() => {
      this.updateTracking();
    }, 60000);

    // Mise à jour initiale après 5 secondes
    setTimeout(() => {
      this.updateTracking();
    }, 5000);
  }

  /**
   * Arrêter le tracking
   */
  stopTracking() {
    this.isTracking = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    window.removeEventListener('scroll', this.handleScroll.bind(this));
    window.removeEventListener('beforeunload', this.handlePageUnload.bind(this));
    window.removeEventListener('pagehide', this.handlePageUnload.bind(this));
    window.removeEventListener('popstate', this.handlePageUnload.bind(this));

    // Envoyer la mise à jour finale
    this.updateTracking('leave');
  }

  /**
   * Gérer le scroll
   */
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

    if (scrollPercentage > this.maxScrollDepth) {
      this.maxScrollDepth = scrollPercentage;

      // Mettre à jour si changement significatif (10% ou plus)
      if (scrollPercentage % 10 === 0) {
        this.debouncedUpdate();
      }
    }
  }

  /**
   * Mise à jour avec debounce
   */
  debouncedUpdate() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.updateTracking();
    }, 2000); // Attendre 2 secondes avant d'envoyer
  }

  /**
   * Mettre à jour le tracking
   * @param {string} action - Action (update, leave, bounce)
   */
  async updateTracking(action = 'update') {
    if (!this.visitId || !this.isTracking) return;

    const timeOnPage = Math.floor((Date.now() - this.startTime) / 1000);

    try {
      const { blogApiService } = await import('./blogService');
      
      await blogApiService.trackVisit(this.visitId, {
        timeOnPage,
        scrollDepth: this.maxScrollDepth,
        action
      });

      this.lastUpdateTime = Date.now();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tracking:', error);
    }
  }

  /**
   * Gérer la fermeture de la page
   */
  handlePageUnload() {
    if (this.isTracking) {
      // Utiliser sendBeacon pour envoyer les données même si la page se ferme
      const timeOnPage = Math.floor((Date.now() - this.startTime) / 1000);
      
      const data = JSON.stringify({
        visitId: this.visitId,
        timeOnPage,
        scrollDepth: this.maxScrollDepth,
        action: 'leave'
      });

      // Essayer d'envoyer avec sendBeacon
      if (navigator.sendBeacon) {
        const { getConfig } = require('../config/production');
        const appConfig = getConfig();
        navigator.sendBeacon(
          `${appConfig.API_BASE_URL}/blogs/track`,
          new Blob([data], { type: 'application/json' })
        );
      } else {
        // Fallback : requête synchrone
        this.updateTracking('leave');
      }
    }
  }

  /**
   * Marquer comme rebond
   */
  markAsBounce() {
    this.updateTracking('bounce');
  }

  /**
   * Obtenir les métriques actuelles
   */
  getMetrics() {
    return {
      timeOnPage: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
      scrollDepth: this.maxScrollDepth,
      isTracking: this.isTracking
    };
  }
}

// Instance singleton
const trackingService = new TrackingService();

export default trackingService;

