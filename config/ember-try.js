const getChannelUrl = require('ember-source-channel-url');

module.exports = async function () {
  const ember5Deps = {
    '@ember/string': '^3.1.1',
    '@ember/test-helpers': '^3.2.0',
    'ember-cli-htmlbars': '^6.3.0',
    'ember-cli-babel': '^8.0.0',
    'ember-qunit': '^8.0.0',
    'ember-resolver': '^11.0.0',
    'ember-auto-import': '^2.3.0',
    'ember-cli-dependency-checker': null,
    'ember-maybe-import-regenerator': null,
    'ember-cli-app-version': null,
  };

  return {
    useYarn: true,
    command: 'yarn ci:test',
    scenarios: [
      {
        name: 'defaults',
        npm: {
          devDependencies: {},
        },
      },
      {
        name: 'typescript-release',
        npm: {
          devDependencies: {
            typescript: 'latest',
          },
        },
      },
      {
        name: 'typescript-beta',
        npm: {
          devDependencies: {
            typescript: 'next',
          },
        },
      },
      {
        name: 'ember-cli-release',
        npm: {
          devDependencies: {
            'ember-cli': 'latest',
            'ember-source': await getChannelUrl('release'),
            ...ember5Deps,
          },
        },
      },
      {
        name: 'ember-cli-beta',
        npm: {
          devDependencies: {
            'ember-cli': 'beta',
            'ember-source': await getChannelUrl('beta'),
            ...ember5Deps,
          },
        },
      },
    ],
  };
};
