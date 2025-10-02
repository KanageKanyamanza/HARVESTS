import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services';
import SocialLinks from '../../components/common/SocialLinks';
import logo from '../../assets/logo.png';
import authbg from '../../assets/images/authbg.png';

const EmailVerification = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  
  const [verificationStatus, setVerificationStatus] = useState('loading'); // 'loading', 'success', 'error', 'already-verified'
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [lastResendTime, setLastResendTime] = useState(0);
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);

  useEffect(() => {
    // Vérifier si la vérification a été faite via redirection du backend
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setVerificationStatus('success');
      setMessage('Votre email a été vérifié avec succès !');
      return;
    }

    // Si on a un token, déclencher automatiquement la vérification
    if (token && !hasAttemptedVerification) {
      setHasAttemptedVerification(true);
      verifyEmailToken(token);
    }
  }, [token, searchParams, hasAttemptedVerification]);

  const verifyEmailToken = async (tokenToVerify) => {
    setVerificationStatus('loading');
    setMessage('Vérification en cours...');

    try {
      await authService.verifyEmail(tokenToVerify);
      setVerificationStatus('success');
      setMessage('Votre email a été vérifié avec succès !');
    } catch (error) {
      console.error('Erreur de vérification:', error);
      setVerificationStatus('error');
      setMessage('Token de vérification invalide ou expiré.');
    }
  };


  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Veuillez entrer votre adresse email.');
      return;
    }

    // Protection contre les clics trop rapides (30 secondes minimum entre les envois)
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const minInterval = 30 * 1000; // 30 secondes

    if (timeSinceLastResend < minInterval && lastResendTime > 0) {
      const remainingTime = Math.ceil((minInterval - timeSinceLastResend) / 1000);
      setMessage(`⏳ Veuillez attendre ${remainingTime} seconde(s) avant de renvoyer l'email.`);
      return;
    }

    setIsResending(true);
    setMessage(''); // Effacer les messages précédents
    setLastResendTime(now);
    
    try {
      const response = await authService.resendVerification(email);
      
      if (response.data.status === 'success') {
        setMessage('✅ Un nouvel email de vérification a été envoyé ! Vérifiez votre boîte de réception.');
      }
    } catch (error) {
      console.error('Erreur lors du renvoi:', error);
      
      if (error.response?.status === 404) {
        setMessage('❌ Aucun compte trouvé avec cette adresse email.');
      } else if (error.response?.status === 400) {
        setMessage('❌ Cet email est déjà vérifié.');
      } else if (error.response?.status === 429) {
        setMessage('⏳ Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.');
      } else {
        setMessage('❌ Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
      case 'already-verified':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      case 'pending':
        return <Mail className="h-8 w-8 text-orange-600" />;
      default:
        return <Mail className="h-8 w-8 text-blue-600" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email vérifié !';
      case 'already-verified':
        return 'Email déjà vérifié';
      case 'error':
        return 'Erreur de vérification';
      case 'pending':
        return 'Vérification requise';
      default:
        return 'Vérification en cours...';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundImage: `url(${authbg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full flex overflow-hidden">
        {/* Section gauche - Logo et informations */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center text-white relative">
          <div className="relative z-10 text-center">
            <img 
              src={logo} 
              alt="Harvests Logo" 
              className="w-[400px] h-[190px] mx-auto mb-6 drop-shadow-lg"
            />
            <p className="text-green-700 text-lg mb-6">
              Agricultural Products Rural<br />
              Entrepreneurship Management System: AgriConnect Hub
            </p>
            
            {/* Réseaux sociaux */}
            <div className="mt-8">
              <SocialLinks 
                variant="glass" 
                size="md"
                className="justify-center"
              />
            </div>
          </div>
        </div>

        {/* Section droite - Contenu */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            {/* Header mobile */}
            <div className="lg:hidden text-center mb-8">
              <img 
                src={logo} 
                alt="Harvests Logo" 
                className="sm:w-[300px] sm:h-[140px] w-[200px] h-[90px] mx-auto mb-4"
              />
            </div>

            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                {getStatusTitle()}
              </h2>
            </div>

            {/* Icône de statut */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 flex items-center justify-center">
                {verificationStatus === 'loading' ? (
                  <Mail className="h-8 w-8 text-green-600" />
                ) : (
                  getStatusIcon()
                )}
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                verificationStatus === 'success' || verificationStatus === 'already-verified'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : verificationStatus === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* Actions selon le statut */}
            {verificationStatus === 'success' && (
              <div className="text-center">
                <Link
                  to="/login"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full transition-colors inline-block"
                >
                  Se connecter
                </Link>
              </div>
            )}

            {verificationStatus === 'already-verified' && (
              <div className="text-center">
                <Link
                  to="/login"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full transition-colors inline-block"
                >
                  Se connecter
                </Link>
              </div>
            )}


            {/* Section pour renvoyer l'email - toujours visible sauf si succès ou déjà vérifié */}
            {(verificationStatus === 'error' || verificationStatus === 'loading') && (
              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email pour renvoyer le lien de vérification :
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Votre adresse email"
                  />
                </div>
                
                <button
                  onClick={handleResendVerification}
                  disabled={isResending || !email}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="ml-2">Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renvoyer l'email de vérification
                    </>
                  )}
                </button>
              </div>
            )}

            {verificationStatus === 'loading' && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Vérification de votre email en cours...
                </p>
              </div>
            )}

            {/* Liens de navigation */}
            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 text-sm underline"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
