module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  plugins: ['ember', '@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'plugin:ember/recommended'],
  env: {
    browser: true,
  },
  rules: {
    "prettier/prettier": "error"
  },
  settings: {
    node: {
      // Honor both extensions when enforcing e.g. `node/no-missing-require`
      tryExtensions: ['.js', '.ts'],
    },
  },
  overrides: [
    // node files
    {
      files: [
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'register-ts-node.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
        'ts/**/*.js',
      ],
      excludedFiles: ['app/**', 'addon/**', 'tests/dummy/app/**'],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015,
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: Object.assign(
        {},
        require('eslint-plugin-node').configs.recommended.rules,
        {
          // add your custom rules and overrides for node files here
          'ember/avoid-leaking-state-in-ember-objects': 'off',
        }
      ),
    },

    // test files
    {
      files: ['tests/**/*.{js,ts}'],
      excludedFiles: ['tests/dummy/**/*.{js,ts}'],
      env: {
        embertest: true,
      },
    },

    // node test files
    {
      files: ['ts/tests/**/*.{js,ts}'],
      env: {
        mocha: true,
      },
      rules: {
        'node/no-unpublished-require': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
      },
    },

    // all TypeScript files
    {
      files: ['**/*.ts'],
      rules: {
        // These are covered by tsc
        'no-undef': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};
