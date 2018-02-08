/* eslint-env node */
'use strict';

const execa = require('execa');
const mkdirp = require('mkdirp');

module.exports = function compile(options) {
  // Ensure the output directory is created even if no files are generated
  mkdirp.sync(options.outDir);

  // argument sequence here is meaningful; don't apply prettier.
  // prettier-ignore
  let args = [
    '--outDir', options.outDir,
    '--rootDir', options.project.root,
    '--allowJs', 'false',
    '--noEmit', 'false'
  ];

  return execa('tsc', args.concat(options.flags));
};
