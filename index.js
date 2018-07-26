// @ts-check
'use strict';

const IncrementalTypescriptCompiler = require('./lib/incremental-typescript-compiler');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-cli-typescript',

  included(includer) {
    this._super.included.apply(this, arguments);

    if (includer === this.app) {
      this.compiler = new IncrementalTypescriptCompiler(this.app, this.project);
      this.compiler.launch();
    }
  },

  includedCommands() {
    if (this.project.isEmberCLIAddon()) {
      return {
        'ts:precompile': require('./lib/commands/precompile'),
        'ts:clean': require('./lib/commands/clean'),
      };
    }
  },

  shouldIncludeChildAddon(addon) {
    // For testing, we have dummy in-repo addons set up, but e-c-ts doesn't depend on them;
    // its dummy app does. Otherwise we'd have a circular dependency.
    return !['in-repo-a', 'in-repo-b', 'in-repo-c'].includes(addon.name);
  },

  setupPreprocessorRegistry(type, registry) {
    if (type !== 'parent') {
      return;
    }

    registry.add('js', {
      name: 'ember-cli-typescript',
      ext: 'ts',
      toTree: (original, inputPath, outputPath) => {
        if (!this.compiler || inputPath !== '/') {
          return original;
        }

        let ts = new Funnel(this.compiler.treeForHost(), { destDir: outputPath });
        return new MergeTrees([original, ts], { overwrite: true });
      },
    });
  },

  treeForApp() {
    if (this.compiler) {
      let tree = this.compiler.treeForApp();
      return this._super.treeForApp.call(this, tree);
    }
  },
  // We manually invoke Babel for treeForAddon, treeForTestSupport and treeForAddonTestSupport
  // rather than calling _super because we're returning content on behalf of addons that aren't
  // ember-cli-typescript, and the _super impl would namespace all the files under our own name.
  treeForAddon() {
    if (this.compiler) {
      let babel = this.project.addons.find(addon => addon.name === 'ember-cli-babel');
      let tree = this.compiler.treeForAddons();
      return babel.transpileTree(tree);
    }
  },

  treeForTestSupport() {
    let trees = [];
    if (this.compiler) {
      trees.push(this.compiler.treeForTests());
      trees.push(this.compiler.treeForTestSupport());
    }
    return this._super.treeForTestSupport.call(this, new MergeTrees(trees));
  },

  treeForAddonTestSupport() {
    if (this.compiler) {
      let babel = this.project.addons.find(addon => addon.name === 'ember-cli-babel');
      let tree = this.compiler.treeForAddonTestSupport();
      return babel.transpileTree(tree);
    }
  },
};
