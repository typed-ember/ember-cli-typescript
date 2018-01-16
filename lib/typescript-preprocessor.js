// @ts-check
/* eslint-env node */

const fs = require('fs');
const path = require('path');

const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const { typescript } = require('broccoli-typescript-compiler');

const BroccoliDebug = require('broccoli-debug');

let tag = 0;

class TypeScriptPreprocessor {
  constructor(options) {
    this.name = 'ember-cli-typescript';
    this._tag = tag;
    this.ext = 'ts';
    this.ui = options.ui;

    // Update the config for how Broccoli handles the file system: no need for
    // includes, always emit, and let Broccoli manage any outDir.
    const config = fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), { encoding: 'utf8' });
    this.config = JSON.parse(config);
    this.config.compilerOptions.noEmit = false;
    this.config.compilerOptions.allowJs = false;
    delete this.config.compilerOptions.outDir;
    delete this.config.include;
  }

  toTree(inputNode /*, inputPath, outputPath*/) {
    // increment every time toTree is called so we have some idea what's going on here.
    this._tag = tag++;

    const debugTree = BroccoliDebug.buildDebugCallback('ember-cli-typescript');

    const js = funnel(inputNode, {
      exclude: ['**/*.ts'],
      annotation: 'JS files',
    });

    const uncompiledTs = debugTree(
      funnel(inputNode, {
        include: ['**/*.ts'],
        annotation: 'uncompiled TS files',
      }),
      `${this._tag}:uncompiled-ts`
    );

    const tsc = typescript(uncompiledTs, {
      throwOnError: this.config.compilerOptions.noEmitOnError,
      annotation: 'Compiled TS files',
      tsconfig: this.config,
    });
    tsc.setDiagnosticWriter(this.ui.writeWarnLine.bind(this.ui));

    const ts = debugTree(tsc, `${this._tag}:compiled-ts`);

    // Put everything together.
    return debugTree(
      mergeTrees([js, ts], {
        overwrite: true,
        annotation: 'merged JS & compiled TS',
      }),
      `${this._tag}:final`
    );
  }
}

module.exports = TypeScriptPreprocessor;
