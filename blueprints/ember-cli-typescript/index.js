'use strict';

const fs = require('fs');
const path = require('path');

const APP_DECLARATIONS = `
import Ember from 'ember';

declare global {
  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}
}

export {};
`;

module.exports = {
  APP_DECLARATIONS,

  description: 'Initialize files needed for typescript compilation',

  install(options) {
    if (options.project.isEmberCLIAddon()) {
      options.dummy = true;
    }

    return this._super.install.apply(this, arguments);
  },

  locals() {
    let inRepoAddons = (this.project.pkg['ember-addon'] || {}).paths || [];
    let hasMirage = 'ember-cli-mirage' in (this.project.pkg.devDependencies || {});
    let isAddon = this.project.isEmberCLIAddon();
    let includes = ['app', isAddon && 'addon', 'tests'].concat(inRepoAddons).filter(Boolean);

    // Mirage is already covered for addons because it's under `tests/`
    if (hasMirage && !isAddon) {
      includes.push('mirage');
    }

    return {
      includes: JSON.stringify(includes, null, 2).replace(/\n/g, '\n  '),
      pathsFor: dasherizedName => {
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
          let addonName = path.basename(addon);
          paths[addonName] = [`${addon}/addon`];
          paths[`${addonName}/*`] = [`${addon}/addon/*`];
          paths[`${appName}/*`].push(`${addon}/app/*`);
        }

        paths['*'] = ['types/*'];

        return JSON.stringify(paths, null, 2).replace(/\n/g, '\n    ');
      },
      baseDeclarations: dasherizedName => {
        const isDummyApp = dasherizedName === 'dummy';
        const useAppDeclarations = !(isAddon || isDummyApp);
        return useAppDeclarations ? APP_DECLARATIONS : '';
      },
    };
  },

  fileMapTokens(/*options*/) {
    // Return custom tokens to be replaced in your files.
    return {
      __app_name__(options) {
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

    return this.addPackagesToProject([
      { name: 'typescript', target: 'latest' },
      { name: '@types/ember', target: 'latest' },
      { name: '@types/ember-data', target: 'latest' },
      { name: '@types/rsvp', target: 'latest' },
      { name: '@types/ember-test-helpers', target: 'latest' },
      { name: '@types/ember-testing-helpers', target: 'latest' },
    ]);
  },

  _installPrecompilationHooks() {
    let pkgPath = `${this.project.root}/package.json`;
    let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    // Really `prepack` and `postpack` would be ideal, but yarn doesn't execute those when publishing
    this._addScript(pkg.scripts, 'prepublishOnly', 'ember ts:precompile');
    this._addScript(pkg.scripts, 'postpublish', 'ember ts:clean');

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  },

  _addScript(scripts, type, script) {
    if (scripts[type] && scripts[type] !== script) {
      this.ui.writeWarnLine(
        `Found a pre-existing \`${type}\` script in your package.json. ` +
          `By default, ember-cli-typescripts expects to run \`${script}\` in this hook.`
      );
      return;
    }

    scripts[type] = script;
  },
};
