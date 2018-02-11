'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  description: 'Initialize files needed for typescript compilation',

  install(options) {
    if (options.project.isEmberCLIAddon()) {
      options.dummy = true;
    }

    return this._super.install.apply(this, arguments);
  },

  locals() {
    let inRepoAddons = (this.project.pkg['ember-addon'] || {}).paths || [];
    let isAddon = this.project.isEmberCLIAddon();
    let includes = [isAddon ? 'addon' : 'app', 'tests'].concat(inRepoAddons);

    return {
      includes: JSON.stringify(includes, null, 2).replace(/\n/g, '\n  '),
      pathsFor: dasherizedName => {
        let appName = isAddon ? 'dummy' : dasherizedName;
        let paths = {
          [`${appName}/tests/*`]: ['tests/*'],
        };

        if (isAddon) {
          paths[`${appName}/*`] = ['tests/dummy/app/*'];
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

        return JSON.stringify(paths, null, 2).replace(/\n/g, '\n    ');
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
