const emailQueue = require('./emailQueueService');
const { info, error } = require('./logger');

class EmailMonitoringService {
  constructor() {
    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      totalRetries: 0,
      averageProcessingTime: 0,
      lastProcessedAt: null
    };
    
    this.startMonitoring();
  }

  // Démarrer le monitoring
  startMonitoring() {
    // Log du statut toutes les 5 minutes
    setInterval(() => {
      this.logQueueStatus();
    }, 5 * 60 * 1000);

    // Nettoyage des stats toutes les heures
    setInterval(() => {
      this.cleanupStats();
    }, 60 * 60 * 1000);

    info('📊 Service de monitoring des emails démarré');
  }

  // Logger le statut de la queue
  logQueueStatus() {
    const status = emailQueue.getQueueStatus();
    
    if (status.total > 0 || status.processing) {
      info('📧 Statut de la queue d\'emails:', {
        pending: status.pending,
        retrying: status.retrying,
        processing: status.processing,
        total: status.total
      });
    }
  }

  // Mettre à jour les statistiques
  updateStats(job) {
    if (job.status === 'completed') {
      this.stats.totalSent++;
      this.stats.lastProcessedAt = new Date();
    } else if (job.status === 'failed') {
      this.stats.totalFailed++;
    }
    
    if (job.retries > 0) {
      this.stats.totalRetries += job.retries;
    }
  }

  // Obtenir les statistiques
  getStats() {
    return {
      ...this.stats,
      queueStatus: emailQueue.getQueueStatus(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  // Nettoyer les statistiques
  cleanupStats() {
    // Garder seulement les stats des dernières 24h
    this.stats.lastCleanup = new Date();
    info('🧹 Nettoyage des statistiques d\'emails effectué');
  }

  // Alerte si trop d'emails en échec
  checkHealth() {
    const status = emailQueue.getQueueStatus();
    const failureRate = this.stats.totalFailed / (this.stats.totalSent + this.stats.totalFailed);
    
    if (failureRate > 0.5 && this.stats.totalSent + this.stats.totalFailed > 10) {
      error('🚨 Taux d\'échec d\'emails élevé:', {
        failureRate: Math.round(failureRate * 100) + '%',
        totalSent: this.stats.totalSent,
        totalFailed: this.stats.totalFailed
      });
    }
  }
}

// Instance singleton
const emailMonitoring = new EmailMonitoringService();

module.exports = emailMonitoring;
