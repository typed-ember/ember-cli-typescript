import Funnel = require('broccoli-funnel');
import MergeTrees = require('broccoli-merge-trees');
import Addon = require('ember-cli/lib/models/addon');
import EmberAddon = require("ember-cli/lib/broccoli/ember-addon");
import EmberApp = require("ember-cli/lib/broccoli/ember-app");
import Registry = require("ember-cli-preprocess-registry");

import IncrementalTypescriptCompiler from './lib/incremental-typescript-compiler';
import PrecompileCommand from './lib/commands/precompile';
import CleanCommand from './lib/commands/clean';
import { EmberCLIBabel } from "ember-cli-babel";

export = Addon.extend({
  name: 'ember-cli-typescript',
  compiler: null as IncrementalTypescriptCompiler | null,

  included(includer: EmberApp | EmberAddon) {
    this._super.included.apply(this, arguments);

    if (includer === this.app) {
      this.compiler = new IncrementalTypescriptCompiler(this.app, this.project);
      this.compiler.launch();
    }
  },

  includedCommands() {
    if (this.project.isEmberCLIAddon()) {
      return {
        'ts:precompile': PrecompileCommand,
        'ts:clean': CleanCommand,
      };
    }
  },

  shouldIncludeChildAddon(addon: Addon) {
    // For testing, we have dummy in-repo addons set up, but e-c-ts doesn't depend on them;
    // its dummy app does. Otherwise we'd have a circular dependency.
    return addon.name !== 'in-repo-a' && addon.name !== 'in-repo-b';
  },

  setupPreprocessorRegistry(type: 'self' | 'parent', registry: Registry) {
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

  treeForAddon() {
    if (this.compiler) {
      // We manually invoke Babel here rather than calling _super because we're returning
      // content on behalf of addons that aren't ember-cli-typescript, and the _super impl
      // would namespace all the files under our own name.
      let babel = this.project.addons.find(addon => addon.name === 'ember-cli-babel') as EmberCLIBabel;
      let tree = this.compiler.treeForAddons();
      return babel.transpileTree(tree);
    }
  },

  treeForTestSupport() {
    if (this.compiler) {
      let tree = this.compiler.treeForTests();
      return this._super.treeForTestSupport.call(this, tree);
    }
  }
});
