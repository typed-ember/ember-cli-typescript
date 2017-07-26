/* eslint-env node */

const debug = require('debug')('ember-cli-typescript');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const tsc = require('broccoli-typescript-compiler').typescript;

class TypeScriptPreprocessor {
  constructor(options) {
    debug('creating new instance with options ', options);
    this.name = 'ember-cli-typescript';
    this.ext = 'ts';
    this.options = JSON.parse(JSON.stringify(options));
  }

  toTree(inputNode /* , inputPath, outputPath */) {
    const js = new Funnel(inputNode, {
      exclude: ['**/*.ts'],
      annotation: 'JS files',
    });

    const tsFiles = new Funnel(inputNode, {
      include: ['**/*.ts'],
      annotation: 'TS files',
    });

    const ts = tsc(tsFiles, {
      annotation: 'Compiled TS files',
      compilerOptions: {
        allowJs: false, // don't compile JS here; let Babel manage that
        noEmit: false, // we *must* emit for Broccoli to do its thing
      },
    });

    // Put everything together.
    return new MergeTrees([js, ts], {
      overwrite: true,
      annotation: 'compiled TypeScript',
    });
  }
}

module.exports = TypeScriptPreprocessor;
