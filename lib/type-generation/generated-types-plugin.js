'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs-extra');
const path = require('path');
const walkSync = require('walk-sync');
const FSTree = require('fs-tree-diff');

module.exports = class GeneratedTypesPlugin extends Plugin {
  constructor(inputNodes, options) {
    super(inputNodes, options);
    this.root = options.root;
    this.typesDir = options.typesDir;
    this.lastTrees = null;
  }

  build() {
    fs.ensureDirSync(this.typesDir);

    let lastTrees = this.lastTrees;
    let nextTrees = this.lastTrees = this.inputPaths.map(inputPath => {
      return FSTree.fromEntries(walkSync.entries(inputPath));
    });

    if (lastTrees) {
      // If we know the previous output, just apply a diff
      for (let i = 0, len = this.inputPaths.length; i < len; i++) {
        this._applyPatch(lastTrees[i], nextTrees[i], this.inputPaths[i]);
      }
    } else {
      // If we don't know the previous output, do a full copy
      for (let inputPath of this.inputPaths) {
        fs.copySync(inputPath, this.typesDir, { dereference: true });
      }
    }

    this._pruneEmptyDirs();
  }

  _applyPatch(fromTree, toTree, fromDir) {
    fromTree.calculateAndApplyPatch(toTree, fromDir, this.typesDir, {
      mkdir(inputPath, outputPath) {
        fs.ensureDirSync(outputPath);
      },

      rmdir(inputPath, outputPath) {
        if (!fs.readdirSync(outputPath).length) {
          fs.rmdirSync(outputPath);
        }
      },

      change(inputPath, outputPath) {
        fs.copySync(inputPath, outputPath, { dereference: true });
      },

      create(inputPath, outputPath) {
        fs.copySync(inputPath, outputPath, { dereference: true });
      }
    });
  }

  _pruneEmptyDirs() {
    let dir = this.typesDir;
    while (fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
      dir = path.dirname(dir);

      if (this.root.indexOf(dir) === 0) {
        return;
      }
    }
  }
}
