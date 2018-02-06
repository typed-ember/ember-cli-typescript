/* eslint-env node */

const path = require('path');
const stringify = require('json-stringify-pretty-compact');

module.exports = {
  description: 'Initialize files needed for typescript compilation',

  locals() {
    let inRepoAddons = (this.project.pkg['ember-addon'] || {}).paths || [];
    let isAddon = this.project.isEmberCLIAddon();

    return {
      additionalIncludes: [isAddon && 'addon', ...inRepoAddons].filter(Boolean),
      pathsFor: dasherizedName => {
        let appName = isAddon ? 'dummy' : dasherizedName;
        let paths = {
          [`${appName}/tests/*`]: ['tests/*'],
          [`${appName}/*`]: ['app/*'],
        };

        if (isAddon) {
          paths[dasherizedName] = ['addon'];
          paths[`${dasherizedName}/*`] = ['addon/*'];
          paths[`${appName}/*`].unshift('tests/dummy/app/*');
        }

        for (let addon of inRepoAddons) {
          let addonName = path.basename(addon);
          paths[addonName] = [`${addon}/addon`];
          paths[`${addonName}/*`] = [`${addon}/addon/*`];
          paths[`${appName}/*`].push(`${addon}/app/*`);
        }

        return stringify(paths).replace(/\n|$/g, '\n    ');
      },
    };
  },

  normalizeEntityName() {
    // Entity name is optional right now, creating this hook avoids an error.
  },

  afterInstall() {
    return this.addPackagesToProject([
      { name: 'typescript', target: 'latest' },
      { name: '@types/ember', target: 'latest' },
      { name: '@types/rsvp', target: 'latest' },
      { name: '@types/ember-testing-helpers', target: 'latest' },
    ]);
  },
};
