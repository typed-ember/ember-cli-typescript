'use strict';

const fs = require('fs');
const path = require('path');

const APP_DECLARATIONS = `import Ember from 'ember';

declare global {
  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}
}

export {};`;

/**
 * @param {string} projectName
 * @param {'classic' | 'pods'} layout
 */
function buildTemplateDeclarations(projectName, layout) {
  const comment = '// Types for compiled templates';
  const moduleBody = `
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
`;
  switch (layout) {
    case 'classic':
      return `${comment}
declare module '${projectName}/templates/*' {${moduleBody}}`;
    case 'pods':
      return `${comment}
declare module '${projectName}/*/template' {${moduleBody}}`;
    default:
      throw new Error(`Unexpected project layout type: "${layout}"`);
  }
}

const { ADDON_NAME } = require('../../addon');

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
    let includes = ['app', isAddon && 'addon'].filter(Boolean);
    const isPods = this.pod;

    includes = includes.concat(['tests', 'types']).concat(inRepoAddons);

    if (isAddon) {
      includes.push('test-support', 'addon-test-support');
    }
    // Mirage is already covered for addons because it's under `tests/`
    if (hasMirage && !isAddon) {
      includes.push('mirage');
    }

    return {
      includes: JSON.stringify(
        includes.map((include) => `${include}/**/*`),
        null,
        2
      ).replace(/\n/g, '\n  '),
      pathsFor: (dasherizedName) => {
        // We need to wait to use this module until `ember-cli-typescript-blueprints` has been installed
        let updatePathsForAddon = require('ember-cli-typescript-blueprints/lib/utilities/update-paths-for-addon');
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
          paths[`${dasherizedName}/test-support`] = ['addon-test-support'];
          paths[`${dasherizedName}/test-support/*`] = ['addon-test-support/*'];
        }

        for (let addon of inRepoAddons) {
          updatePathsForAddon(paths, path.basename(addon), appName);
        }

        paths['*'] = ['types/*'];

        return JSON.stringify(paths, null, 2).replace(/\n/g, '\n    ');
      },
      indexDeclarations: (dasherizedName) => {
        const isDummyApp = dasherizedName === 'dummy';
        const useAppDeclarations = !(isAddon || isDummyApp);
        return useAppDeclarations ? APP_DECLARATIONS : '';
      },
      globalDeclarations: (dasherizedName) => {
        /** @type {'classic' | 'pods'} */
        let projectLayout;
        if (isPods) projectLayout = 'pods';
        else projectLayout = 'classic';
        return buildTemplateDeclarations(dasherizedName, projectLayout);
      },
    };
  },

  fileMapTokens(/*options*/) {
    // Return custom tokens to be replaced in your files.
    return {
      __app_name__(options) {
        return options.inAddon ? 'dummy' : options.dasherizedModuleName;
      },

      __config_root__(options) {
        return options.inAddon ? 'tests/dummy/app' : 'app';
      },
    };
  },

  normalizeEntityName() {
    // Entity name is optional right now, creating this hook avoids an error.
  },

  beforeInstall() {
    if (this.project.isEmberCLIAddon()) {
      this._transformAddonPackage();
    }

    let packages = [
      'typescript',
      'ember-cli-typescript-blueprints',
      '@types/ember-resolver',
      '@types/ember__object',
      '@types/ember__service',
      '@types/ember__controller',
      '@types/ember__string',
      '@types/ember__template',
      '@types/ember__polyfills',
      '@types/ember__utils',
      '@types/ember__runloop',
      '@types/ember__debug',
      '@types/ember__engine',
      '@types/ember__application',
      '@types/ember__test',
      '@types/ember__array',
      '@types/ember__error',
      '@types/ember__component',
      '@types/ember__routing',
      '@types/rsvp',
      '@types/htmlbars-inline-precompile',
    ];

    if (this._has('@ember/jquery')) {
      packages.push('@types/jquery');
    }

    if (this._has('ember-data')) {
      packages.push('@types/ember-data');
    }

    if (this._has('ember-cli-qunit') || this._has('ember-qunit')) {
      packages.push('@types/ember-qunit');
      packages.push('@types/qunit');
    }

    if (this._has('ember-cli-mocha') || this._has('ember-mocha')) {
      packages.push('@types/ember-mocha');
      packages.push('@types/mocha');
    }

    return this.addPackagesToProject(
      packages.map((name) => {
        return { name, target: 'latest' };
      })
    );
  },

  filesPath() {
    return `${__dirname}/../../../blueprint-files/ember-cli-typescript`;
  },

  files() {
    let files = this._super.files.apply(this, arguments);

    if (!this._has('ember-data')) {
      files = files.filter((file) => file !== 'types/ember-data/types/registries/model.d.ts');
    }

    return files;
  },

  _transformAddonPackage() {
    const pkgPath = `${this.project.root}/package.json`;

    let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    // As of https://github.com/yarnpkg/yarn/pull/5712 yarn runs `prepack` and `postpack` when publishing
    this._addScript(pkg.scripts, 'prepack', 'ember ts:precompile');
    this._addScript(pkg.scripts, 'postpack', 'ember ts:clean');

    // avoid being placed in devDependencies
    if (pkg.devDependencies[ADDON_NAME]) {
      pkg.dependencies[ADDON_NAME] = pkg.devDependencies[ADDON_NAME];
      delete pkg.devDependencies[ADDON_NAME];
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  },

  _addScript(scripts, type, script) {
    if (scripts[type] && scripts[type] !== script) {
      this.ui.writeWarnLine(
        `Found a pre-existing \`${type}\` script in your package.json. ` +
          `By default, ember-cli-typescript expects to run \`${script}\` in this hook.`
      );
      return;
    }

    scripts[type] = script;
  },

  _has(pkg) {
    if (this.project) {
      return pkg in this.project.dependencies();
    }
  },
};
