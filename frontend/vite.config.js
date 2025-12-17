import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimisations de build pour réduire la taille
    // Utiliser esbuild (inclus par défaut, plus rapide que terser)
    minify: 'esbuild',
    // Esbuild supprime automatiquement les console.log en production
    esbuild: {
      drop: ['console', 'debugger'], // Supprimer console et debugger en production
    },
    rollupOptions: {
      output: {
        // Code splitting pour réduire la taille des bundles
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-icons', 'lucide-react'],
          'utils-vendor': ['axios', 'react-helmet-async']
        },
        // Optimiser les noms de fichiers
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Augmenter la limite de taille pour les warnings
    chunkSizeWarningLimit: 1000,
    // Source maps pour le debug (désactiver en production pour réduire la taille)
    sourcemap: false
  },
  // Optimisations CSS
  css: {
    devSourcemap: false
  }
})
