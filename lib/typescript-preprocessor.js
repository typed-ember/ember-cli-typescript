const path = require('path');

const debug = require('debug')('ember-cli-typescript');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const ts = require('typescript');
const tsc = require('broccoli-typescript-compiler').typescript;

function readConfig(configFile) {
  const result = ts.readConfigFile(configFile, ts.sys.readFile);
  if (result.error) {
    const message = ts.flattenDiagnosticMessageText(result.error.messageText, '\n');
    throw new Error(message);
  }
  return result.config;
}

class TypeScriptPreprocessor {
  constructor(options) {
    debug('creating new instance with options ', options);
    this.name = 'ember-cli-typescript';
    this.ext = 'ts';
    this.options = JSON.parse(JSON.stringify(options));

    const tsconfig = readConfig(path.join('.', 'tsconfig.json'))

    // The `include` setting is meant for the IDE integration; broccoli manages
    // manages its own input files.
    tsconfig.include = ['**/*.ts'];

    // tsc needs to emit files on the broccoli pipeline, but not in the default
    // config. Otherwise its compiled `.js` files may be created inadvertently.
    tsconfig.compilerOptions.noEmit = false;
    delete tsconfig.compilerOptions.outDir;

    this.tsconfig = tsconfig;
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

    const ts = tsc(tsFiles, { tsconfig: this.tsconfig });

    // Put everything together.
    return new MergeTrees([js, ts], {
      overwrite: true,
      annotation: 'compiled TypeScript',
    });
  }
}

module.exports = TypeScriptPreprocessor;
