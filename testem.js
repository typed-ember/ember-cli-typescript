module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  reporter: 'xunit',
  report_file: 'ember-tests.xml',
  xunit_exclude_stack: true, // we *probably* want this on to keep the xunit file clean
  xunit_intermediate_output: true,
  launch_in_ci: ['Chrome', 'Firefox'],
  launch_in_dev: ['Chrome'],
  browser_start_timeout: 60000,
  browser_args: {
    Firefox: { ci: ['-headless', '--window-size=1440,900'] },
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
        (process.env.TRAVIS || process.env.CI) ? '--no-sandbox' : []
      ),
    },
  },
};
