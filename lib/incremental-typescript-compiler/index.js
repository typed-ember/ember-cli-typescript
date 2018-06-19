'use strict';

const tmpdir = require('../utilities/tmpdir');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const path = require('path');
const fs = require('fs-extra');
const resolve = require('resolve');
const compile = require('../utilities/compile');
const TypeGeneratorRegistry = require('../type-generation/registry');
const TypescriptOutput = require('./typescript-output-plugin');
const CompilerState = require('./compiler-state');

const debugTsc = require('debug')('ember-cli-typescript:tsc');

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
    this.state = new CompilerState();

    this._typeGeneratorRegistries = new Map();
    this._ts = project.require('typescript');
    this._watchProgram = null;
    this._compilerOptions = null;
  }

  treeForHost() {
    let appRoot = `${this._relativeAppRoot()}/app`;
    let srcRoot = `${this._relativeAppRoot()}/src`;

    let trees = {};
    if (fs.existsSync(appRoot)) {
      trees[appRoot] = 'app';
    }

    if (fs.existsSync(srcRoot)) {
      // MU apps currently include tests in production builds, and it's not yet clear
      // how those will be filtered out in the future. We may or may not wind up needing
      // to do that filtering here.
      trees[srcRoot] = 'app/src';
    }

    let appTree = new TypescriptOutput(this, trees);
    let mirage = this._mirageDirectory();
    let mirageTree = mirage && new TypescriptOutput(this, {
      [mirage]: 'app/mirage',
    });

    let tree = new MergeTrees([mirageTree, appTree].filter(Boolean), { overwrite: true });
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

    let tree = new MergeTrees(addonAppTrees, { overwrite: true });
    return new Funnel(tree, { srcDir: 'app', allowEmpty: true });
  }

  treeForAddons() {
    let paths = {};
    for (let addon of this.addons) {
      let absoluteRoot = this._addonRoot(addon);
      let relativeRoot = this._relativeAddonRoot(addon);

      if (fs.existsSync(`${absoluteRoot}/addon`)) {
        paths[`${relativeRoot}/addon`] = addon.name;
      }

      if (fs.existsSync(`${absoluteRoot}/src`)) {
        paths[`${relativeRoot}/src`] = `${addon.name}/src`;
      }
    }
    return new TypescriptOutput(this, paths);
  }

  treeForTests() {
    let tree = new TypescriptOutput(this, { tests: 'tests' });
    return new Funnel(tree, { srcDir: 'tests' });
  }

  treeForGeneratedTypes() {
    if (!this._generatedTypesTree) {
      let projectRegistry = this._typeGeneratorRegistryFor(this.project);
      let appDir = `${this._relativeAppRoot()}/app`;
      let trees = [];
      trees = trees.concat(projectRegistry.process('app', appDir));
      trees = trees.concat(projectRegistry.process('tests', 'tests', { exclude: ['dummy/**'] }));

      for (let addon of this.addons) {
        let addonRegistry = this._typeGeneratorRegistryFor(addon);
        trees = trees.concat(addonRegistry.process('app', 'app'));
        trees = trees.concat(addonRegistry.process('addon', 'addon'));
      }

      trees = trees.filter(Boolean);

      let merged = new MergeTrees(trees);
      if (trees.length) {
        let GeneratedTypesPlugin = require('../type-generation/generated-types-plugin');
        this._generatedTypesTree = new GeneratedTypesPlugin(merged, {
          destDir: path.resolve('types/generated')
        });
      } else {
        // If we have no generated types trees, use the empty merge as a no-op placeholder
        this._generatedTypesTree = merged;
      }
    }

    return this._generatedTypesTree;
  }

  buildPromise() {
    // Lazily launch the compiler so that we can be sure type generation has
    // completed before it starts for the first time.
    if (!this._watchProgram) {
      this.launch();
    }

    return this.state.buildDeferred.promise;
  }

  outDir() {
    if (!this._outDir) {
      let outDir = path.join(tmpdir(), `e-c-ts-${process.pid}`);
      this._outDir = outDir;
      fs.mkdirsSync(outDir);
    }

    return this._outDir;
  }

  launch() {
    if (!fs.existsSync(`${this.project.root}/tsconfig.json`)) {
      this.project.ui.writeWarnLine('No tsconfig.json found; skipping TypeScript compilation.');
      return;
    }

    let project = this.project;
    let outDir = this.outDir();

    this._watchProgram = compile(project, { outDir, watch: true }, {
      watchedFileChanged: () => this.state.tscDidStart(),
      buildComplete: () => this.state.tscDidEnd(),

      reportWatchStatus: (diagnostic) => {
        let text = diagnostic.messageText;
        debugTsc(text);
      },

      reportDiagnostic: (diagnostic) => {
        if (diagnostic.category !== 2) {
          let message = this._formatDiagnosticMessage(diagnostic);
          if (this._shouldFailOnTypeError()) {
            this.state.didError(message);
          } else {
            this.project.ui.write(message);
          }
        }
      }
    });

    // Prefetch the compiler options, because fetching them while reporting a diagnostic
    // can result in a diagnostic-reporting loop in certain states
    this._compilerOptions = this.getProgram().getCompilerOptions();
  }

  getProgram() {
    return this._watchProgram.getProgram();
  }

  _typeGeneratorRegistryFor(projectOrAddon) {
    let registry = this._typeGeneratorRegistries.get(projectOrAddon);
    if (!registry) {
      registry = new TypeGeneratorRegistry(projectOrAddon, this._generatedTypesDirectory(projectOrAddon));
      this._typeGeneratorRegistries.set(projectOrAddon, registry);
    }
    return registry;
  }

  _formatDiagnosticMessage(diagnostic) {
    return this._ts.formatDiagnostic(diagnostic, {
      getCanonicalFileName: path => path,
      getCurrentDirectory: this._ts.sys.getCurrentDirectory,
      getNewLine: () => this._ts.sys.newLine,
    });
  }

  _shouldFailOnTypeError() {
    return !!this._compilerOptions.noEmitOnError;
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

  _generatedTypesDirectory(projectOrAddon) {
    let projectRoot = this.project.root;
    let targetRoot = projectOrAddon.root;

    if (targetRoot.indexOf(projectRoot) === 0) {
      // Addon projects and in-repo addons have their generated types in the active project root
      return path.join(projectRoot, 'types', 'generated', this._relativeAddonRoot(projectOrAddon));
    } else {
      // Linked developing addons should have types generated in their own root
      return path.join(targetRoot, 'types', 'generated');
    }
  }

  _relativeAppRoot() {
    // This won't work for apps that have customized their root trees...
    if (this.app instanceof this.project.require('ember-cli/lib/broccoli/ember-addon')) {
      return 'tests/dummy';
    } else {
      return '.';
    }
  }

  _addonRoot(addon) {
    let addonRoot = addon.root;
    if (addonRoot.indexOf(this.project.root) !== 0) {
      let packagePath = resolve.sync(`${addon.pkg.name}/package.json`, {
        basedir: this.project.root,
      });
      addonRoot = path.dirname(packagePath);
    }
    return addonRoot;
  }

  _relativeAddonRoot(addon) {
    return this._addonRoot(addon).replace(this.project.root, '');
  }
};

