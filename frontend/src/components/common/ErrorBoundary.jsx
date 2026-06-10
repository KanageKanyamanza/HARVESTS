import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour afficher l'UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enregistrer l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Check for chunk load errors / dynamic import failures
    const errorStr = error ? error.toString() : '';
    const isChunkLoadError = 
      errorStr.includes('Failed to fetch dynamically imported module') ||
      errorStr.includes('ChunkLoadError') ||
      errorStr.includes('loading chunk') ||
      errorStr.includes('dynamically imported module') ||
      errorStr.includes('MIME type');

    if (isChunkLoadError) {
      const lastReload = sessionStorage.getItem('last-chunk-load-reload');
      const now = Date.now();
      
      // If we haven't reloaded due to a chunk load error in the last 15 seconds, reload the page
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('last-chunk-load-reload', now.toString());
        console.warn('Chunk load error detected. Reloading page to fetch the latest deployment version...', error);
        window.location.reload();
        return;
      }
    }

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Oups ! Une erreur s'est produite
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Nous avons rencontré un problème inattendu. Veuillez réessayer.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Recharger la page
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 text-left border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-bold text-red-600 mb-2">
                    Détails du Crash (Uniquement en Développement) :
                  </h4>
                  <pre className="text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto max-h-64 border border-red-100 shadow-inner whitespace-pre-wrap">
                    <span className="font-bold block mb-1">{this.state.error.toString()}</span>
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
