import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore build outputs and dependencies
  {
    ignores: [
      'dist/**',
      'dist-electron/**',
      'dist-electron-builder/**',
      'node_modules/**',
      '*.config.js',
    ],
  },
  
  // Base JavaScript recommended rules
  js.configs.recommended,
  
  // TypeScript configurations
  ...tseslint.configs.recommended,
  
  // React configurations for src/ directory
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: '19.2',
      },
    },
    rules: {
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh rules for HMR
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop types
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      
      // JSX A11y rules (accessibility)
      ...jsxA11y.configs.recommended.rules,
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  
  // Electron main process configurations for electron/ directory
  {
    files: ['electron/**/*.{ts,js}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Node.js/Electron specific rules
      'no-console': 'off', // Console is needed in Electron main process
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off', // Electron may need dynamic requires
    },
  },
  
  // Config files
  {
    files: ['*.config.{ts,js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  }
);
