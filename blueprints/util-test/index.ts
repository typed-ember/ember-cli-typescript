import stringUtils = require('ember-cli-string-utils');
import TestFrameworkDetector = require('../test-framework-detector');
import {BlueprintOptions} from "ember-cli/lib/models/blueprint";

export = TestFrameworkDetector.extend({
  description: 'Generates a util unit test.',
  locals: function(options: BlueprintOptions) {
    return {
      friendlyTestName: ['Unit', 'Utility', options.entity.name].join(' | '),
      dasherizedModulePrefix: stringUtils.dasherize(options.project.config().modulePrefix!)
    };
  }
});
