import semver from 'semver';
import { Remote } from 'stagehand';
import { connect } from 'stagehand/lib/adapters/child-process';
import Addon from 'ember-cli/lib/models/addon';
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

  serverMiddleware({ app }) {
    this._addTypecheckMiddleware(app);
  },

  testemMiddleware(app) {
    this._addTypecheckMiddleware(app);
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

  shouldIncludeChildAddon(addon) {
    // For testing, we have dummy in-repo addons set up, but e-c-ts doesn't depend on them;
    // its dummy app does. Otherwise we'd have a circular dependency.
    return !['in-repo-a', 'in-repo-b'].includes(addon.name);
  },

  _checkBabelVersion() {
    let babel = this.parent.addons.find(addon => addon.name === 'ember-cli-babel');
    let version = babel && babel.pkg.version;

    // TODO update this check and warning message once we have a Babel version to target
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

    await worker.onTypecheck(status => {
      for (let error of status.errors) {
        this.ui.writeLine(error);
      }
    });

    await worker.start(this.project.root);

    return worker;
  },
});
