'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs-extra');
const walkSync = require('walk-sync');
const FSTree = require('fs-tree-diff');

module.exports = class GeneratedTypesPlugin extends Plugin {
  constructor(input, options) {
    super([input], options);
    this.destDir = options.destDir;
    this.lastTree = null;
  }

  build() {
    fs.ensureDirSync(this.destDir);

    let lastTree = this.lastTree;
    let nextTree = this.lastTree = FSTree.fromEntries(walkSync.entries(this.inputPaths[0]));

    if (!lastTree) {
      lastTree = FSTree.fromEntries(walkSync.entries(this.destDir));
    }

    this._applyPatch(lastTree, nextTree);
  }

  _applyPatch(fromTree, toTree) {
    fromTree.calculateAndApplyPatch(toTree, this.inputPaths[0], this.destDir, {
      change(inputPath, outputPath) {
        fs.copySync(inputPath, outputPath, { dereference: true });
      },

      create(inputPath, outputPath) {
        fs.copySync(inputPath, outputPath, { dereference: true });
      }
    });
  }
}
