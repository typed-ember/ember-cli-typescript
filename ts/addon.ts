import semver from 'semver';
import { Remote } from 'stagehand';
import { connect } from 'stagehand/lib/adapters/child-process';
import { hasPlugin, addPlugin, AddPluginOptions } from 'ember-cli-babel-plugin-helpers';
import Addon from 'ember-cli/lib/models/addon';
import PreprocessRegistry from 'ember-cli-preprocess-registry';
import { addon } from './lib/utilities/ember-cli-entities';
import fork from './lib/utilities/fork';
import TypecheckWorker from './lib/typechecking/worker';
import TypecheckMiddleware from './lib/typechecking/middleware';
import { Application } from 'express';
import walkSync from 'walk-sync';
import fs from 'fs-extra';

export const ADDON_NAME = 'ember-cli-typescript';

export default addon({
  name: ADDON_NAME,

  included() {
    this._super.included.apply(this, arguments);

    this._checkDevelopment();
    this._checkAddonAppFiles();
    this._checkBabelVersion();

    // If we're a direct dependency of the host app, go ahead and start up the
    // typecheck worker so we don't wait until the end of the build to check
    if (this.parent === this.project) {
      this._getTypecheckWorker();
      this._checkInstallationLocation();
      this._checkEmberCLIVersion();
    }
  },

  includedCommands() {
    if (this.project.isEmberCLIAddon()) {
      return {
        'ts:precompile': require('./lib/commands/precompile').default,
        'ts:clean': require('./lib/commands/clean').default,
      };
    }
  },

  blueprintsPath() {
    return `${__dirname}/blueprints`;
  },

  serverMiddleware({ app, options }) {
    if (!options || !options.path) {
      this._addTypecheckMiddleware(app);
    }
  },

  testemMiddleware(app, options) {
    if (!options || !options.path) {
      this._addTypecheckMiddleware(app);
    }
  },

  async postBuild() {
    // This code makes the fundamental assumption that the TS compiler's fs watcher
    // will notice a file change before the full Broccoli build completes. Otherwise
    // the `getStatus` call here might report the status of the previous check. In
    // practice, though, building takes much longer than the time to trigger the
    // compiler's "hey, a file changed" hook, and once the typecheck has begun, the
    // `getStatus` call will block until it's complete.
    let worker = await this._getTypecheckWorker();
    let { failed } = await worker.getStatus();

    if (failed) {
      // The actual details of the errors will already have been printed
      // with nice highlighting and formatting separately.
      throw new Error('Typechecking failed');
    }
  },

  setupPreprocessorRegistry(type, registry) {
    if (type !== 'parent') return;

    // If we're acting on behalf of the root app, issue a warning if we detect
    // a situation where a .js file from an addon has the same name as a .ts
    // file in the app, as which file wins is nondeterministic.
    if (this.parent === this.project) {
      this._registerCollisionDetectionPreprocessor(registry);
    }

    // Normally this is the sort of logic that would live in `included()`, but
    // ember-cli-babel reads the configured extensions when setting up the
    // preprocessor registry, so we need to beat it to the punch.
    this._registerBabelExtension();

    // As of 3.7, TS supports the optional chaining and nullish coalescing proposals.
    // https://devblogs.microsoft.com/typescript/announcing-typescript-3-7-beta/
    // Since we can't necessarily know what version of TS an addon was developed with,
    // we unconditionally add the Babel plugins for both proposals.
    this._addBabelPluginIfNotPresent('@babel/plugin-proposal-optional-chaining');
    this._addBabelPluginIfNotPresent('@babel/plugin-proposal-nullish-coalescing-operator');

    // Needs to come after the class properties plugin (see tests/unit/build-test.ts -
    // "property initialization occurs in the right order")
    this._addBabelPluginIfNotPresent('@babel/plugin-transform-typescript', {
      after: ['@babel/plugin-proposal-class-properties'],
    });
  },

  shouldIncludeChildAddon(addon) {
    // For testing, we have dummy in-repo addons set up, but e-c-ts doesn't depend on them;
    // its dummy app does. Otherwise we'd have a circular dependency.
    return !['in-repo-a', 'in-repo-b'].includes(addon.name);
  },

  _registerCollisionDetectionPreprocessor(registry: PreprocessRegistry) {
    registry.add('js', {
      name: 'ember-cli-typescript-collision-check',
      toTree: (input, path) => {
        if (path !== '/') return input;

        let addon = this;
        let checked = false;
        let stew = require('broccoli-stew') as typeof import('broccoli-stew');

        return stew.afterBuild(input, function () {
          if (!checked) {
            checked = true;
            addon._checkForFileCollisions(this.inputPaths[0]);
          }
        });
      },
    });
  },

  _checkForFileCollisions(directory: string) {
    let walkSync = require('walk-sync') as typeof import('walk-sync');
    let files = new Set(walkSync(directory, ['**/*.{js,ts}']));

    let collisions = [];
    for (let file of files) {
      if (file.endsWith('.js') && files.has(file.replace(/\.js$/, '.ts'))) {
        collisions.push(file.replace(/\.js$/, '.{js,ts}'));
      }
    }

    if (collisions.length) {
      this.ui.writeWarnLine(
        'Detected collisions between .js and .ts files of the same name. ' +
          'This can result in nondeterministic build output; ' +
          'see https://git.io/JvIwo for more information.\n  - ' +
          collisions.join('\n  - ')
      );
    }
  },

  _checkBabelVersion() {
    let babel = this.parent.addons.find((addon) => addon.name === 'ember-cli-babel');
    let version = babel && babel.pkg.version;
    if (!babel || !(semver.gte(version!, '7.7.3') && semver.lt(version!, '8.0.0'))) {
      let versionString = babel ? `version ${babel.pkg.version}` : `no instance of ember-cli-babel`;
      this.ui.writeWarnLine(
        `ember-cli-typescript requires ember-cli-babel ^7.7.3, but you have ${versionString} installed; ` +
          'your TypeScript files may not be transpiled correctly.'
      );
    }
  },

  _checkEmberCLIVersion() {
    let cliPackage = this.project.require('ember-cli/package.json') as {
      version: string;
    };
    if (semver.lt(cliPackage.version, '3.5.0')) {
      this.ui.writeWarnLine(
        'ember-cli-typescript works best with ember-cli >= 3.5, which uses the system temporary directory ' +
          'by default rather than a project-local one, minimizing file system events the TypeScript ' +
          'compiler needs to keep track of.'
      );
    }
  },

  _checkDevelopment() {
    if (this.isDevelopingAddon() && !process.env.CI && __filename.endsWith('.js')) {
      this.ui.writeWarnLine(
        'ember-cli-typescript is in development but not being loaded from `.ts` sources — ' +
          'do you have compiled artifacts lingering in `/js`?'
      );
    }
  },

  _checkAddonAppFiles() {
    // Emit a warning for addons that are under active development...
    let isDevelopingAddon = !this.app && (this.parent as Addon).isDevelopingAddon();

    // ...and are at the root of the project (i.e. not in-repo)...
    let isRootAddon = this.parent.root === this.project.root;

    // ...and have .ts files in their `app` directory.
    let appDir = `${this.parent.root}/app`;
    if (isDevelopingAddon && isRootAddon && fs.existsSync(appDir)) {
      let tsFilesInApp = walkSync(appDir, { globs: ['**/*.ts'] });
      if (tsFilesInApp.length) {
        this.ui.writeWarnLine(
          `found .ts files in ${appDir}\n` +
            "ember-cli-typescript only compiles files in an addon's `addon` folder; " +
            'see https://github.com/typed-ember/ember-cli-typescript/issues/562'
        );
      }
    }
  },

  _checkInstallationLocation() {
    if (
      this.project.isEmberCLIAddon() &&
      this.project.pkg.devDependencies &&
      this.project.pkg.devDependencies[this.name]
    ) {
      this.ui.writeWarnLine(
        '`ember-cli-typescript` should be included in your `dependencies`, not `devDependencies`'
      );
    }
  },

  _getConfigurationTarget() {
    // If `this.app` isn't present, we know `this.parent` is an addon
    return this.app || (this.parent as Addon);
  },

  _registerBabelExtension() {
    let target = this._getConfigurationTarget();
    let options: Record<string, any> = target.options || (target.options = {});
    let babelAddonOptions: Record<string, any> =
      options['ember-cli-babel'] || (options['ember-cli-babel'] = {});
    let extensions: string[] =
      babelAddonOptions.extensions || (babelAddonOptions.extensions = ['js']);

    if (!extensions.includes('ts')) {
      extensions.push('ts');
    }
  },

  _addBabelPluginIfNotPresent(pluginName: string, pluginOptions?: AddPluginOptions) {
    let target = this._getConfigurationTarget();
    if (!hasPlugin(target, pluginName)) {
      addPlugin(target, require.resolve(pluginName), pluginOptions);
    }
  },

  _addTypecheckMiddleware(app: Application) {
    let workerPromise = this._getTypecheckWorker();
    let middleware = new TypecheckMiddleware(this.project, workerPromise);
    middleware.register(app);
  },

  _typecheckWorker: undefined as Promise<Remote<TypecheckWorker>> | undefined,

  _getTypecheckWorker() {
    if (!this._typecheckWorker) {
      this._typecheckWorker = this._forkTypecheckWorker();
    }

    return this._typecheckWorker;
  },

  async _forkTypecheckWorker() {
    let childProcess = fork(`${__dirname}/lib/typechecking/worker/launch`);
    let worker = await connect<TypecheckWorker>(childProcess);

    await worker.onTypecheck((status) => {
      for (let error of status.errors) {
        this.ui.writeLine(error);
      }
    });

    await worker.start(this.project.root);

    return worker;
  },
});
