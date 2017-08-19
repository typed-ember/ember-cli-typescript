/* eslint-env node */
const fs = require('fs');
const path = require('path');

const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const TypeScriptPlugin = require('broccoli-typescript-compiler').TypeScriptPlugin;

const BroccoliDebug = require('broccoli-debug');

let tag = 0;

class TypeScriptPreprocessor {
  constructor(options) {
    this.name = 'ember-cli-typescript';
    this._tag = tag++;
    this.ext = 'ts';
    this.ui = options.ui;

    // Update the config for how Broccoli handles the file system: no need for
    // includes, always emit, and let Broccoli manage any outDir.
    this.config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tsconfig.json')));
    this.config.compilerOptions.noEmit = false;
    this.config.compilerOptions.allowJs = false;
    delete this.config.compilerOptions.outDir;
    delete this.config.include;
  }

  toTree(inputNode, inputPath, outputPath) {
    const js = funnel(inputNode, {
      exclude: ['**/*.ts'],
      annotation: 'JS files',
    });

    const debugTree = BroccoliDebug.buildDebugCallback('ember-cli-typescript');

    const uncompiledTs = debugTree(
      funnel(inputNode, {
        include: ['**/*.ts'],
        annotation: 'uncompiled TS files',
      }),
      `${this._tag}`
    );

    const tsc = new TypeScriptPlugin(uncompiledTs, {
      throwOnError: this.config.compilerOptions.noEmitOnError,
      annotation: 'Compiled TS files',
      include: ['**/*'],
      tsconfig: this.config,
    });
    tsc.setDiagnosticWriter(this.ui.writeWarnLine.bind(this.ui));

    const ts = debugTree(
      tsc,
      `${this._tag}`
    );

    // Put everything together.
    return mergeTrees([js, ts], {
      overwrite: true,
      annotation: 'merged JS & compiled TS',
    });
  }
}

module.exports = TypeScriptPreprocessor;
