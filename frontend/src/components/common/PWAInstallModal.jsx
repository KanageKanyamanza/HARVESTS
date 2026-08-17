import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share, Check, Zap, WifiOff, Bell, Sparkles } from "lucide-react";

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

  const features = [
    { icon: Zap, label: "Accès rapide depuis l'écran d'accueil" },
    { icon: WifiOff, label: 'Fonctionnement hors ligne' },
    { icon: Bell, label: 'Notifications push' },
    { icon: Sparkles, label: 'Expérience optimisée' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Fonds décoratifs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] bg-emerald-100/50 rounded-full blur-[90px]" />
          <div className="absolute bottom-[-25%] right-[-20%] w-[60%] h-[55%] bg-amber-100/40 rounded-full blur-[90px]" />
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-5 sm:p-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-3">
              <div className="w-5 h-[2px] bg-emerald-600" />
              <span>Harvests</span>
              <div className="w-5 h-[2px] bg-emerald-600" />
            </div>

            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-[1000] text-gray-900 tracking-tight mb-1.5">
              Installer Harvests
            </h2>
            <p className="text-gray-500 font-medium text-xs max-w-xs mx-auto">
              Installez l'application pour une expérience optimale et un accès
              rapide à vos produits locaux.
            </p>
          </div>

          {isIOS ? (
            <div className="mb-4 bg-gray-50 border border-gray-100 rounded-xl p-3">
              <p className="text-sm font-bold text-gray-700 mb-2">
                Pour installer Harvests sur iOS :
              </p>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">1</span>
                  Appuyez sur le bouton <strong>Partager</strong> <Share className="inline w-4 h-4" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">2</span>
                  Sélectionnez <strong>« Sur l'écran d'accueil »</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">3</span>
                  Appuyez sur <strong>« Ajouter »</strong>
                </li>
              </ol>
            </div>
          ) : (
            <ul className="mb-4 grid grid-cols-1 gap-2">
              {features.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                  <Check className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2">
            {!isIOS && deferredPrompt && (
              <button
                type="button"
                onClick={handleInstall}
                className="w-full bg-emerald-600 text-white py-2.5 px-6 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
              >
                <Download className="w-4 h-4" />
                Installer maintenant
              </button>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full bg-gray-100 text-gray-700 py-2.5 px-6 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Plus tard
            </button>
            <button
              type="button"
              onClick={handleDontShowAgain}
              className="w-full text-gray-400 text-xs font-medium py-1 hover:text-gray-600 transition-colors"
            >
              Ne plus afficher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallModal;
