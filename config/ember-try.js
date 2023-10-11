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
  const ember5Env = {
    EMBER_OPTIONAL_FEATURES: JSON.stringify({
      'application-template-wrapper': false,
      'default-async-observers': true,
      'template-only-glimmer-components': true,
      'jquery-integration': false,
    }),
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
        env: { ...ember5Env },
        npm: {
          ember: { edition: 'octane' },
          devDependencies: {
            'ember-cli': 'latest',
            'ember-source': await getChannelUrl('release'),
            ...ember5Deps,
          },
        },
      },
      {
        name: 'ember-cli-beta',
        env: { ...ember5Env },
        npm: {
          ember: { edition: 'octane' },
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
