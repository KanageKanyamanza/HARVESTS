import React, { useState, useEffect } from 'react';
import { FiDownload, FiX, FiSmartphone, FiCheck } from 'react-icons/fi';

/**
 * Modal pour inviter l'utilisateur à installer la PWA
 */
const PWAInstallModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      // Vérifier si on est en mode standalone (app installée)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
        setIsInstalled(true);
        return;
      }

      // Vérifier si on est sur iOS
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(isIOSDevice);

      // Vérifier si l'app est déjà installée (pour iOS)
      if (isIOSDevice) {
        const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;
        if (isInStandaloneMode) {
          setIsInstalled(true);
          setIsStandalone(true);
          return;
        }
      }

      // Vérifier si l'utilisateur a déjà refusé l'installation
      const installDismissed = localStorage.getItem('pwa-install-dismissed');
      if (installDismissed) {
        const dismissedDate = new Date(installDismissed);
        const daysSinceDismissed = (new Date() - dismissedDate) / (1000 * 60 * 60 * 24);
        // Réafficher après 7 jours
        if (daysSinceDismissed < 7) {
          return;
        }
      }

      // Attendre un peu avant d'afficher le modal
      const timer = setTimeout(() => {
        if (!isInstalled && !isStandalone) {
          setShowModal(true);
        }
      }, 3000); // Afficher après 3 secondes

      return () => clearTimeout(timer);
    };

    // Écouter l'événement beforeinstallprompt (pour Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowModal(true);
    };

    // Écouter l'événement appinstalled (quand l'app est installée)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, isStandalone]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Afficher le prompt d'installation natif
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowModal(false);
      }
      
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Pour iOS, on affiche les instructions
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleDontShowAgain = () => {
    setShowModal(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    localStorage.setItem('pwa-install-never', 'true');
  };

  // Ne pas afficher si déjà installée ou si l'utilisateur a choisi de ne plus voir
  if (isInstalled || isStandalone || localStorage.getItem('pwa-install-never') === 'true') {
    return null;
  }

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-harvests-green rounded-full flex items-center justify-center mb-4">
            <FiSmartphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Installer HARVESTS
          </h2>
          <p className="text-gray-600">
            Installez l'application pour une expérience optimale et un accès rapide à vos produits locaux.
          </p>
        </div>

        {isIOS ? (
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              Pour installer HARVESTS sur iOS :
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Appuyez sur le bouton <strong>Partager</strong> <span className="text-lg">📤</span></li>
              <li>Sélectionnez <strong>"Sur l'écran d'accueil"</strong></li>
              <li>Appuyez sur <strong>"Ajouter"</strong></li>
            </ol>
          </div>
        ) : (
          <div className="mb-6">
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-harvests-green mr-2 mt-0.5 flex-shrink-0" />
                <span>Accès rapide depuis l'écran d'accueil</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-harvests-green mr-2 mt-0.5 flex-shrink-0" />
                <span>Fonctionnement hors ligne</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-harvests-green mr-2 mt-0.5 flex-shrink-0" />
                <span>Notifications push</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-harvests-green mr-2 mt-0.5 flex-shrink-0" />
                <span>Expérience optimisée</span>
              </li>
            </ul>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="w-full bg-harvests-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FiDownload className="w-5 h-5 mr-2" />
              Installer maintenant
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Plus tard
          </button>
          <button
            onClick={handleDontShowAgain}
            className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
          >
            Ne plus afficher
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallModal;

