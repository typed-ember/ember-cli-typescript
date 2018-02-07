/* eslint-env node */
'use strict';

const execa = require('execa');
const mkdirp = require('mkdirp');

module.exports = function compile({ project, outDir, flags = [] }) {
  // Ensure the output directory is created even if no files are generated
  mkdirp.sync(outDir);

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
