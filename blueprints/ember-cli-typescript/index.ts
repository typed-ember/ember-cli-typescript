import Blueprint = require("ember-cli/lib/models/blueprint");
import fs = require('fs');
import path = require('path');
import {FileMapVariables, BlueprintOptions} from "ember-cli/lib/models/blueprint";
import {Package} from "ember-cli";
import RSVP from "rsvp";
import updatePathsForAddon = require('../../lib/utilities/update-paths-for-addon');

const APP_DECLARATIONS = `
import Ember from 'ember';

declare global {
  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}
}

export {};
`;

export = Blueprint.extend({
  APP_DECLARATIONS,

  description: 'Initialize files needed for typescript compilation',

  install(options: BlueprintOptions): RSVP.Promise<any> {
    if (options.project.isEmberCLIAddon()) {
      options.dummy = true;
    }

    return this._super.install.apply(this, arguments);
  },

  locals() {
    let inRepoAddons = (this.project.pkg['ember-addon'] || {}).paths || [];
    let hasMirage = 'ember-cli-mirage' in (this.project.pkg.devDependencies || {});
    let isAddon = this.project.isEmberCLIAddon();
    let includes = ['app', isAddon && 'addon', 'tests', 'types'].concat(inRepoAddons).filter(Boolean);

    // Mirage is already covered for addons because it's under `tests/`
    if (hasMirage && !isAddon) {
      includes.push('mirage');
    }

    return {
      includes: JSON.stringify(includes, null, 2).replace(/\n/g, '\n  '),
      pathsFor: (dasherizedName: string) => {
        let appName = isAddon ? 'dummy' : dasherizedName;
        let paths = {
          [`${appName}/tests/*`]: ['tests/*'],
        };

        if (hasMirage) {
          paths[`${appName}/mirage/*`] = [`${isAddon ? 'tests/dummy/' : ''}mirage/*`];
        }

        if (isAddon) {
          paths[`${appName}/*`] = ['tests/dummy/app/*', 'app/*'];
        } else {
          paths[`${appName}/*`] = ['app/*'];
        }

        if (isAddon) {
          paths[dasherizedName] = ['addon'];
          paths[`${dasherizedName}/*`] = ['addon/*'];
        }

        for (let addon of inRepoAddons) {
          updatePathsForAddon(paths, path.basename(addon), appName);
        }

        paths['*'] = ['types/*'];

        return JSON.stringify(paths, null, 2).replace(/\n/g, '\n    ');
      },
      baseDeclarations: (dasherizedName: string) => {
        const isDummyApp = dasherizedName === 'dummy';
        const useAppDeclarations = !(isAddon || isDummyApp);
        return useAppDeclarations ? APP_DECLARATIONS : '';
      },
    };
  },

  fileMapTokens(/*options*/) {
    // Return custom tokens to be replaced in your files.
    return {
      __app_name__(options: FileMapVariables) {
        return options.inAddon ? 'dummy' : options.dasherizedModuleName;
      },
    };
  },

  normalizeEntityName() {
    // Entity name is optional right now, creating this hook avoids an error.
  },

  afterInstall() {
    if (this.project.isEmberCLIAddon()) {
      this._installPrecompilationHooks();
    }

    let packages = [
      { name: 'typescript', target: 'latest' },
      { name: '@types/ember', target: 'latest' },
      { name: '@types/rsvp', target: 'latest' },
      { name: '@types/ember-test-helpers', target: 'latest' },
      { name: '@types/ember-testing-helpers', target: 'latest' },
    ];

    if (this._has('ember-data')) {
      packages.push(
        { name: '@types/ember-data', target: 'latest' }
      );
    }

    if (this._has('ember-cli-qunit')) {
      packages = packages.concat([
        { name: '@types/ember-qunit', target: 'latest' },
        { name: '@types/qunit', target: 'latest' },
      ]);
    }

    if (this._has('ember-cli-mocha')) {
      packages = packages.concat([
        { name: '@types/ember-mocha', target: 'latest' },
        { name: '@types/mocha', target: 'latest' },
      ]);
    }

    return this.addPackagesToProject(packages);
  },

  files(): string[] {
    let files: string[] = this._super.files.apply(this, arguments);

    if (!this._has('ember-data')) {
      files = files.filter(file => file !== 'types/ember-data.d.ts');
    }

    return files;
  },

  _installPrecompilationHooks(): void {
    let pkgPath = `${this.project.root}/package.json`;
    let pkg: Package = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    // Really `prepack` and `postpack` would be ideal, but yarn doesn't execute those when publishing
    pkg.scripts = pkg.scripts || {};
    this._addScript(pkg.scripts, 'prepublishOnly', 'ember ts:precompile');
    this._addScript(pkg.scripts, 'postpublish', 'ember ts:clean');

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  },

  _addScript(scripts: {[k: string]: string}, type: string, script: string): void {
    if (scripts && scripts[type] && scripts[type] !== script) {
      this.ui.writeWarnLine(
        `Found a pre-existing \`${type}\` script in your package.json. ` +
          `By default, ember-cli-typescripts expects to run \`${script}\` in this hook.`
      );
      return;
    }

    scripts[type] = script;
  },

  _has(pkg: string): boolean {
    if (this.project) {
      return pkg in this.project.dependencies();
    }
    return false;
  },
});
