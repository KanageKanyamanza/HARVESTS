import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

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
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-16 bg-white">
          {/* Fonds décoratifs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-rose-100/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-emerald-100/30 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-md w-full text-center">
            <div className="flex items-center justify-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest mb-6">
              <div className="w-6 h-[2px] bg-rose-500" />
              <span>Harvests</span>
              <div className="w-6 h-[2px] bg-rose-500" />
            </div>

            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 border border-rose-100 rounded-2xl mb-6 shadow-sm">
              <FiAlertTriangle className="w-7 h-7 text-rose-500" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-[1000] text-gray-900 tracking-tight mb-3">
              Oups, une erreur s'est produite
            </h1>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
              Nous avons rencontré un problème inattendu. Vous pouvez réessayer
              ou revenir à l'accueil.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
              >
                <FiRefreshCw className="h-4 w-4" />
                Réessayer
              </button>

              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FiHome className="h-4 w-4" />
                Accueil
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 text-left border-t border-gray-100 pt-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-2">
                  Détails du crash (développement uniquement)
                </h4>
                <pre className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl overflow-auto max-h-64 border border-rose-100 shadow-inner whitespace-pre-wrap">
                  <span className="font-bold block mb-1">{this.state.error.toString()}</span>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
