import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // 全局忽略配置 - 忽略所有打包目录和node_modules
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.cache/**', '**/coverage/**'],
  },

  // 基础 JavaScript 配置 - 适用于项目中所有JS/TS文件
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },

  // JavaScript 推荐规则
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },

  // TypeScript 配置 - 项目中的 TS 文件
  tseslint.configs.recommended,

  // TypeScript 特定配置 - 项目和子包中的TS文件
  {
    files: ['**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    ...tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      // 针对 TypeScript 的自定义规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // React 配置
  pluginReact.configs.flat.recommended,
  {
    files: ['**/*.{jsx,tsx}', 'packages/**/*.{jsx,tsx}'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // 针对 React 的自定义规则
      'react/react-in-jsx-scope': 'off', // React 17后不再需要引入React
    },
  },

  // 导入规则
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}', 'packages/**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: { import: pluginImport },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },

  // Prettier 集成
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}', 'packages/**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: { prettier: pluginPrettier },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'es5',
          printWidth: 100,
          tabWidth: 2,
          semi: true,
          bracketSpacing: true,
          arrowParens: 'avoid',
        },
      ],
    },
  },
]);
