// @ts-check
'use strict';

const IncrementalTypescriptCompiler = require('./lib/incremental-typescript-compiler');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const stew = require('broccoli-stew');

module.exports = {
  name: 'ember-cli-typescript',

  init() {
    this._super.init.apply(this, arguments);

    // If we're a direct dependency of the app, we cheat and add our instance of the blueprints
    // addon to the project, as only top-level addons contribute blueprints.
    // This won't be necessary in 2.x if we shift to adding the blueprints addon as a host
    // dependency on install.
    if (this.project.addons.includes(this)) {
      this.project.addons.push(this.addons.find(addon => addon.name === 'ember-cli-typescript-blueprints'));
    }
  },

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

  // We manually invoke Babel for treeForAddon and treeForAddonTestSupport
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
    return this._super.treeForTestSupport.call(this,
      stew.mv(new MergeTrees(trees), 'test-support/*', '/')
    );
  },

  treeForAddonTestSupport() {
    if (this.compiler) {
      let babel = this.project.addons.find(addon => addon.name === 'ember-cli-babel');
      let tree = this.compiler.treeForAddonTestSupport();
      return babel.transpileTree(tree);
    }
  },
};
