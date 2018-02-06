/* eslint-env node */
'use strict';

const execa = require('execa');

module.exports = function compile({ project, outDir, flags = [] }) {
  // argument sequence here is meaningful; don't apply prettier.
  // prettier-ignore
  return execa('tsc', [
    '--outDir', outDir,
    '--rootDir', project.root,
    '--allowJs', 'false',
    '--noEmit', 'false',
    ...flags
  ]);
};
