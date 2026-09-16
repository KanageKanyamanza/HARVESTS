import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, process: 'readonly' },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // catch {} vide = "best-effort, ignorer l'échec" — motif répandu et
      // intentionnel dans ce projet (fallback silencieux sur valeur par
      // défaut). Les autres blocs vides restent interdits.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Sans ça, no-unused-vars ne reconnaît pas <Icon /> comme un usage de
      // la variable Icon (eslint-plugin-react n'était pas installé) — faux
      // positifs "defined but never used" sur toute variable/import utilisé
      // uniquement en JSX.
      'react/jsx-uses-vars': 'error',
      // Autorise les fichiers à exporter, à côté d'un composant, des
      // constantes/fonctions qui ne changent pas de référence entre rendus
      // (utilitaires de formatage, contexts + hooks + provider dans un même
      // fichier...) — un motif standard dans ce projet. Seul l'export d'une
      // valeur qui varie réellement casse le Fast Refresh et reste interdit.
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  {
    // Scripts Node exécutés en dehors du bundle Vite (build/CI helpers)
    files: ['scripts/**/*.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Service worker : contexte global différent du navigateur (clients, caches...)
    files: ['public/sw.js'],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
])
