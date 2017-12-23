// @ts-check
/* eslint-env node */

const fs = require('fs');
const path = require('path');
const SilentError = require('silent-error');
const TsPreprocessor = require('./lib/typescript-preprocessor');
const ServeTS = require('./lib/serve-ts');
const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const mkdirp = require('mkdirp');

module.exports = {
  name: 'ember-cli-typescript',

  _isRunningServeTS() {
    return this.project._isRunningServeTS;
  },

  _inRepoAddons() {
    const pkg = this.project.pkg;
    if (!pkg || !pkg['ember-addon'] || !pkg['ember-addon'].paths) {
      return [];
    }

    return pkg['ember-addon'].paths;
  },

  includedCommands() {
    return {
      'serve-ts': ServeTS,
    };
  },

  treeForApp(tree) {
    if (!this._isRunningServeTS()) {
      return tree;
    }

    const roots = ['.', ...this._inRepoAddons()].map(root => path.join(root, 'app'));

    // funnel will fail if the directory doesn't exist
    roots.forEach(root => {
      mkdirp.sync(path.join('.e-c-ts', root));
    });

    const ts = funnel('.e-c-ts', {
      exclude: ['tests'],
      getDestinationPath(relativePath) {
        const prefix = roots.find(root => relativePath.startsWith(root));
        if (prefix) {
          // strip any app/ or lib/in-repo-addon/app/ prefix
          return relativePath.substr(prefix.length + 1);
        }

        return relativePath;
      },
    });

    return mergeTrees([tree, ts]);
  },

  treeForTestSupport(tree) {
    if (!this._isRunningServeTS()) {
      return tree;
    }

    const tests = path.join('.e-c-ts', 'tests');

    // funnel will fail if the directory doesn't exist
    mkdirp.sync(tests);

    const ts = funnel(tests);
    return tree ? mergeTrees([tree, ts]) : ts;
  },

  setupPreprocessorRegistry(type, registry) {
    if (!fs.existsSync(path.join(this.project.root, 'tsconfig.json'))) {
      // Do nothing; we just won't have the plugin available. This means that if you
      // somehow end up in a state where it doesn't load, the preprocessor *will*
      // fail, but this is necessary because the preprocessor depends on packages
      // which aren't installed until the default blueprint is run

      this.ui.writeInfoLine(
        'Skipping TypeScript preprocessing as there is no tsconfig.json. ' +
          '(If this is during installation of the add-on, this is as expected. If it is ' +
          'while building, serving, or testing the application, this is an error.)'
      );
      return;
    }

    if (type === 'self' || this._isRunningServeTS()) {
      // TODO: still need to compile TS addons
      return;
    }

    try {
      registry.add(
        'js',
        new TsPreprocessor({
          ui: this.ui,
        })
      );
    } catch (ex) {
      throw new SilentError(
        'Failed to instantiate TypeScript preprocessor, probably due to an invalid ' +
          `\`tsconfig.json\`. Please fix or run \`ember generate ember-cli-typescript\`.\n${ex}`
      );
    }
  },
};
