'use strict';

const tmpdir = require('./utilities/tmpdir');
const mkdirp = require('mkdirp');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const symlinkOrCopy = require('symlink-or-copy');
const Plugin = require('broccoli-plugin');
const RSVP = require('rsvp');
const path = require('path');
const fs = require('fs');
const resolve = require('resolve');
const compile = require('./utilities/compile');

const debugCompiler = require('debug')('ember-cli-typescript:compiler');
const debugAutoresolve = require('debug')('ember-cli-typescript:autoresolve');

module.exports = class IncrementalTypescriptCompiler {
  constructor(app, project) {
    if (project._incrementalTsCompiler) {
      throw new Error(
        'Multiple IncrementalTypescriptCompiler instances may not be used with the same project.'
      );
    }

    project._incrementalTsCompiler = this;

    this.app = app;
    this.project = project;
    this.addons = this._discoverAddons(project, []);
    this.maxBuildCount = 1;
    this.autoresolveThreshold = 500;

    this._buildDeferred = RSVP.defer();
    this._isSynced = false;
    this._triggerDir = `${this.outDir()}/.rebuild`;
    this._pendingAutoresolve = null;
    this._didAutoresolve = false;
  }

  treeForHost() {
    let triggerTree = new Funnel(this._triggerDir, { destDir: 'app' });

    let appTree = new TypescriptOutput(this, {
      [`${this._relativeAppRoot()}/app`]: 'app',
    });

    let mirage = this._mirageDirectory();
    let mirageTree = mirage && new TypescriptOutput(this, {
      [mirage]: 'app/mirage',
    });

    let tree = new MergeTrees([triggerTree, mirageTree, appTree].filter(Boolean), { overwrite: true });
    return new Funnel(tree, { srcDir: 'app' });
  }

  // Returns any developing addons' app trees. Note that the host app itself is managed
  // by treeForHost() above, as it needs to be treated specially by the build to always
  // 'win' when the host and an addon have clashing files.
  treeForApp() {
    let addonAppTrees = this.addons.map(addon => {
      return new TypescriptOutput(this, {
        [`${this._relativeAddonRoot(addon)}/app`]: 'app',
      });
    });

    return new MergeTrees(addonAppTrees, { overwrite: true });
  }

  treeForAddons() {
    let paths = {};
    for (let addon of this.addons) {
      paths[`${this._relativeAddonRoot(addon)}/addon`] = addon.name;
    }
    return new TypescriptOutput(this, paths);
  }

  treeForTests() {
    let tree = new TypescriptOutput(this, { tests: 'tests' });
    return new Funnel(tree, { srcDir: 'tests' });
  }

  buildPromise() {
    return this._buildDeferred.promise;
  }

  outDir() {
    if (!this._outDir) {
      let outDir = path.join(tmpdir(), `e-c-ts-${process.pid}`);
      this._outDir = outDir;
      mkdirp.sync(outDir);
    }

    return this._outDir;
  }

  launch() {
    if (!fs.existsSync(`${this.project.root}/tsconfig.json`)) {
      this.project.ui.writeWarnLine('No tsconfig.json found; skipping TypeScript compilation.');
      return;
    }

    mkdirp.sync(this._triggerDir);
    this._touchRebuildTrigger();

    let project = this.project;
    let outDir = this.outDir();
    let flags = ['--watch'];
    let tsc = compile({ project, outDir, flags });

    tsc.stdout.on('data', data => {
      let text = data
        .toString()
        .trim()
        .replace(/\u001bc/g, '');

      if (text) {
        this.project.ui.writeLine(text);
      }

      if (data.indexOf('Starting incremental compilation') !== -1) {
        debugCompiler('tsc detected a file change');
        this.willRebuild();
        clearTimeout(this._pendingAutoresolve);
      }

      if (data.indexOf('Compilation complete') !== -1) {
        debugCompiler('rebuild completed');

        this.didSync();

        if (this._didAutoresolve) {
          this._touchRebuildTrigger();
          this.maxBuildCount++;
        }

        clearTimeout(this._pendingAutoresolve);
        this._didAutoresolve = false;
      }
    });

    tsc.stderr.on('data', data => {
      this.project.ui.writeError(data.toString().trim());
    });
  }

  willRebuild() {
    if (this._isSynced) {
      this._isSynced = false;
      this._buildDeferred = RSVP.defer();

      // Schedule a timer to automatically resolve if tsc doesn't pick up any file changes in a
      // short period. This may happen if a non-TS file changed, or if the tsc watcher is
      // drastically behind watchman. If the latter happens, we'll explicitly touch a file in the
      // broccoli output in order to ensure the changes are picked up.
      this._pendingAutoresolve = setTimeout(() => {
        debugAutoresolve('no tsc rebuild; autoresolving...');

        this.didSync();
        this._didAutoresolve = true;
      }, this.autoresolveThreshold);
    }
  }

  didSync() {
    this._isSynced = true;
    this._buildDeferred.resolve();
  }

  _mirageDirectory() {
    let mirage = this.project.addons.find(addon => addon.name === 'ember-cli-mirage');
    if (mirage) {
      // Be a little defensive, since we're using an internal Mirage API
      if (
        typeof mirage._shouldIncludeFiles !== 'function' ||
        typeof mirage.mirageDirectory !== 'string'
      ) {
        this.ui.writeWarnLine(
          `Couldn't determine whether to include Mirage files. This is likely a bug in ember-cli-typescript; ` +
            `please file an issue at https://github.com/typed-ember/ember-cli-typescript`
        );
        return;
      }

      if (mirage._shouldIncludeFiles()) {
        let source = mirage.mirageDirectory;
        if (source.indexOf(this.project.root) === 0) {
          source = source.substring(this.project.root.length + 1);
        }
        return source;
      }
    }
  }

  _touchRebuildTrigger() {
    debugAutoresolve('touching rebuild trigger.');
    fs.writeFileSync(`${this._triggerDir}/tsc-delayed-rebuild`, '', 'utf-8');
  }

  _discoverAddons(node, addons) {
    for (let addon of node.addons) {
      let devDeps = addon.pkg.devDependencies || {};
      let deps = addon.pkg.dependencies || {};
      if (
        ('ember-cli-typescript' in deps || 'ember-cli-typescript' in devDeps) &&
        addon.isDevelopingAddon()
      ) {
        addons.push(addon);
      }
      this._discoverAddons(addon, addons);
    }
    return addons;
  }

  _relativeAppRoot() {
    // This won't work for apps that have customized their root trees...
    if (this.app instanceof this.project.require('ember-cli/lib/broccoli/ember-addon')) {
      return 'tests/dummy';
    } else {
      return '.';
    }
  }

  _relativeAddonRoot(addon) {
    let addonRoot = addon.root;
    if (addonRoot.indexOf(this.project.root) !== 0) {
      let packagePath = resolve.sync(`${addon.pkg.name}/package.json`, {
        basedir: this.project.root,
      });
      addonRoot = path.dirname(packagePath);
    }

    return addonRoot.replace(this.project.root, '');
  }
};

class TypescriptOutput extends Plugin {
  constructor(compiler, paths) {
    super([]);
    this.compiler = compiler;
    this.paths = paths;
    this.buildCount = 0;
  }

  build() {
    this.buildCount++;

    // We use this to keep track of the build state between the various
    // Broccoli trees and tsc; when either tsc or broccoli notices a file
    // change, we immediately invalidate the previous build output.
    if (this.buildCount > this.compiler.maxBuildCount) {
      debugCompiler('broccoli detected a file change');
      this.compiler.maxBuildCount = this.buildCount;
      this.compiler.willRebuild();
    }

    debugCompiler('waiting for tsc output', this.paths);
    return this.compiler.buildPromise().then(() => {
      debugCompiler('tsc build complete', this.paths);
      for (let relativeSrc of Object.keys(this.paths)) {
        let src = `${this.compiler.outDir()}/${relativeSrc}`;
        let dest = `${this.outputPath}/${this.paths[relativeSrc]}`;
        if (fs.existsSync(src)) {
          let dir = path.dirname(dest);
          if (dir !== '.') {
            mkdirp.sync(dir);
          }

          symlinkOrCopy.sync(src, dest);
        } else {
          mkdirp.sync(dest);
        }
      }
    });
  }
}
