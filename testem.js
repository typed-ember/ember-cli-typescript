/* eslint-env node */
module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  browser_args: {
    Chrome: {
      mode: 'ci',
      // prettier-disable -- args are useful to have in a sane order
      args: [
        '--disable-gpu',
        '--headless',
        '--remote-debugging-port=0',
        '--window-size=1440,900',
      ].concat(
        /*
          --no-sandbox is needed when running Chrome inside a container.
          See https://github.com/ember-cli/ember-cli-chai/pull/45/files.
        */
        process.env.TRAVIS ? '--no-sandbox' : []
      ),
    },
  },
};
