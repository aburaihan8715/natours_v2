import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Enables browser globals
        ...globals.node, // Enables Node.js globals like `process`, `__dirname`, etc.
      },
    },
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-console': 'warn', // Warns when console.log is used
      eqeqeq: 'error', // Enforces the use of strict equality (===)
      curly: ['error', 'all'], // Enforces consistent use of curly braces
      semi: ['error', 'always'], // Requires semicolons at the end of statements
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: 'req|res|next|val',
        },
      ],
    },
  },
];
