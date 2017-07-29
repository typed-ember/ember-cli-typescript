/* eslint-env node */

let TsPreprocessor;
try {
  TsPreprocessor = require('./lib/typescript-preprocessor');
} catch (ex) {
  // Do nothing; we just won't have the plugin available. This means that if you
  // somehow end up in a state where it doesn't load, the preprocessor *will*
  // fail, but this is necessary because the preprocessor depends on packages
  // which aren't installed until the
}

module.exports = {
  name: 'ember-cli-typescript',

  setupPreprocessorRegistry(type, registry) {
    if (!TsPreprocessor) {
      this.ui.write(
        'Note: TypeScript preprocessor not available -- some dependencies not installed. ' +
          '(If this is during installation of the add-on, this is as expected. If it is ' +
          'while building, serving, or testing the application, this is an error.)'
      );
      return;
    }

    try {
      registry.add('js', new TsPreprocessor());
    } catch (ex) {
      this.ui.write(
        'Missing or invalid tsconfig.json, please fix or run `ember generate ember-cli-typescript`.'
      );
      this.ui.write('  ' + ex.toString());
    }
  },
};
