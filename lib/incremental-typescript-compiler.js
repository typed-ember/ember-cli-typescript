/* eslint-env node */

const execa = require('execa');
const os = require('os');
const mkdirp = require('mkdirp');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const symlinkOrCopy = require('symlink-or-copy');
const Plugin = require('broccoli-plugin');
const RSVP = require('rsvp');
const path = require('path');
const fs = require('fs');
const resolve = require('resolve');

module.exports = class IncrementalTypescriptCompiler {
  constructor(project) {
    if (project._incrementalTsCompiler) {
      throw new Error(
        'Multiple IncrementalTypescriptCompiler instances may not be used with the same project.'
      );
    }

    project._incrementalTsCompiler = this;

    this.project = project;
    this.addons = this._discoverAddons(project, []);
    this.maxBuildCount = 1;

    this._buildDeferred = RSVP.defer();
    this._isSynced = false;
  }

  treeForApp() {
    // This could be more efficient, but we can hopefully assume there won't be dozens
    // or hundreds of TS addons in dev mode all at once.
    let addonAppTrees = this.addons.map(addon => {
      return new TypescriptOutput(this, {
        [`${this._relativeAddonRoot(addon)}/app`]: 'app',
      });
    });

    let appTree = new TypescriptOutput(this, { app: 'app' });
    let tree = new MergeTrees([...addonAppTrees, appTree], { overwrite: true });

    return new Funnel(tree, { srcDir: 'app' });
  }

  treeForAddons() {
    let paths = {};
    for (let addon of this.addons) {
      paths[`${this._relativeAddonRoot(addon)}/addon`] = addon.name;
    }
    return new TypescriptOutput(this, paths);
  }

  treeForTests() {
    return new TypescriptOutput(this, { tests: 'tests' });
  }

  buildPromise() {
    return this._buildDeferred.promise;
  }

  outDir() {
    if (!this._outDir) {
      let outDir = path.join(os.tmpdir(), `e-c-ts-${process.pid}`);
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

    // argument sequence here is meaningful; don't apply prettier.
    // prettier-ignore
    let tsc = execa('tsc', [
      '--watch',
      '--outDir', this.outDir(),
      '--rootDir', this.project.root,
      '--allowJs', 'false',
      '--noEmit', 'false',
    ]);

    tsc.stdout.on('data', data => {
      this.project.ui.writeLine(data.toString().trim());

      if (data.indexOf('Starting incremental compilation') !== -1) {
        this.willRebuild();
      }

      if (data.indexOf('Compilation complete') !== -1) {
        this._buildDeferred.resolve();
        this._isSynced = true;
      }
    });

    tsc.stderr.on('data', data => {
      this.project.ui.writeErrorLine(data.toString().trim());
    });
  }

  willRebuild() {
    if (this._isSynced) {
      this._isSynced = false;
      this._buildDeferred = RSVP.defer();
    }
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
      this.compiler.maxBuildCount = this.buildCount;
      this.compiler.willRebuild();
    }

    return this.compiler.buildPromise().then(() => {
      for (let relativeSrc of Object.keys(this.paths)) {
        let src = `${this.compiler.outDir()}/${relativeSrc}`;
        let dest = `${this.outputPath}/${this.paths[relativeSrc]}`;
        if (fs.existsSync(src)) {
          symlinkOrCopy.sync(src, dest);
        } else {
          mkdirp.sync(dest);
        }
      }
    });
  }
}
