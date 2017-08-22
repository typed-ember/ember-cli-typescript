/* eslint-env node */

const fs = require('fs');
const path = require('path');
const SilentError = require('silent-error');
const TsPreprocessor = require('./lib/typescript-preprocessor');


module.exports = {
  name: 'ember-cli-typescript',

  setupPreprocessorRegistry(type, registry) {
    if (!fs.existsSync(path.join(this.project.root, 'tsconfig.json'))) {
      // Do nothing; we just won't have the plugin available. This means that if you
      // somehow end up in a state where it doesn't load, the preprocessor *will*
      // fail, but this is necessary because the preprocessor depends on packages
      // which aren't installed until the default blueprint is run

      this.ui.writeInfoLine(
        'Skipping TypeScript preprocessing as there is no tsconfig.json. ' +
        '(If this is during installation of the add-on, this is as expected. If it is ' +
        'while building, serving, or testing the application, this is an error.)'
      );
      return;
    }

    try {
      registry.add('js', new TsPreprocessor({
        ui: this.ui
      }));
    } catch (ex) {
      throw new SilentError(`Failed to instantiate TypeScript preprocessor, probably due to an invalid tsconfig.json. Please fix or run \`ember generate ember-cli-typescript\`.\n${ex}`);
    }
  },
};
