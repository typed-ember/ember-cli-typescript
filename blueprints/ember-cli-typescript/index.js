/* eslint-env node */

const fs = require('fs');
const path = require('path');
const stringify = require('json-stringify-pretty-compact');

module.exports = {
  description: 'Initialize files needed for typescript compilation',

  locals() {
    let inRepoAddons = (this.project.pkg['ember-addon'] || {}).paths || [];
    let isAddon = this.project.isEmberCLIAddon();
    let includes = [isAddon ? 'addon' : 'app', 'tests', ...inRepoAddons];

    return {
      includes: JSON.stringify(includes, null, 2).replace(/\n/g, '\n  '),
      pathsFor: dasherizedName => {
        let appName = isAddon ? 'dummy' : dasherizedName;
        let paths = {
          [`${appName}/tests/*`]: ['tests/*'],
        };

        if (!isAddon) {
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
        }

        return stringify(paths).replace(/\n/g, '\n    ');
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
      { name: '@types/rsvp', target: 'latest' },
      { name: '@types/ember-testing-helpers', target: 'latest' },
    ]);
  },

  _installPrecompilationHooks() {
    let pkgPath = `${this.project.root}/package.json`;
    let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    this._addScript(pkg.scripts, 'prepack', 'ember ts:precompile');
    this._addScript(pkg.scripts, 'postpack', 'ember ts:clean');
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
