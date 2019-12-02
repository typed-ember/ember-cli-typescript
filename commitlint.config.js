/* eslint-env node */
'use strict';

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always', 288],
  },
};
