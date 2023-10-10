const getChannelUrl = require('ember-source-channel-url');

module.exports = {
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
        },
      },
    },
    {
      name: 'ember-cli-beta',
      npm: {
        devDependencies: {
          'ember-cli': 'beta',
          'ember-source': await getChannelUrl('beta'),
        },
      },
    },
  ],
};
