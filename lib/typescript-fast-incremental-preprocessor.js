/* eslint-env node */
const fs = require('fs');
const path = require('path');
const tmp = require('tmp')
const child_process = require('child_process');
const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const Plugin = require('broccoli-plugin');

class FastTypescriptWatcher extends Plugin {
  constructor(inputNode, options = {}) {
    super([ inputNode ], {
      annotation: options.annotation,
      needsCache: false,
      name: 'ember-cli-typescript-fast-watcher',
    });

    this.outputDir = options.outputDir;
    this.ui = options.ui;
  }

  build() {
    if (this.watcher) {
      return;
    }
    const inputDir = this.inputPaths[0];
    this.watcher = child_process.fork(
      require.resolve('typescript/bin/tsc'), [
        '--watch',
        '--project', inputDir,
        '--outDir', this.outputDir,
        '--noEmit', 'false'
      ], { silent: true }); // TODO: stdout is messy

    // TODO: clean up process
  }
}

function makeTempDir() {
  // TODO: the directory won't get monitored if it's in tmp/
  const dir = '.e-c-ts';

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  return tmp.dirSync({ dir, prefix: 'ember_cli_typescript' });
}

class TypeScriptFastIncrementalPreprocessor {
  constructor(options) {
    this.name = 'ember-cli-typescript';
    this.ui = options.ui;
  }

  toTree(inputNode, inputPath, outputPath) {
    const js = funnel(inputNode, {
      exclude: ['**/*.ts'],
      annotation: 'JS files',
    });

    // TODO: how to disable watching .ts files?
    const uncompiledTS = funnel(inputNode, {
      include: ['**/*.ts'],
      annotation: 'TS files'
    });

    const tsconfig = funnel('.', {
      files: [ 'tsconfig.json' ],
      annotation: 'tsconfig'
    });

    const temp = makeTempDir();
    // TODO: clean up temp dir

    const watcher = new FastTypescriptWatcher(mergeTrees([ uncompiledTS, tsconfig ]), {
      outputDir: temp.name,
      annotation: 'watch TS sources',
      ui: this.ui
    });

    const compiledTS = funnel(temp.name, {
      include: ['**/*.js'],
      annotation: 'compiled TS',
      destDir: outputPath + inputPath
    });

    return mergeTrees([ watcher, js, compiledTS ], {
      overwrite: true,
      annotation: 'merged JS & compiled TS',
    })
  }
}

module.exports = TypeScriptFastIncrementalPreprocessor;
