import TestFrameworkDetector = require('../test-framework-detector');
import {BlueprintOptions} from "ember-cli/lib/models/blueprint";

export = TestFrameworkDetector.extend({
  description: 'Generates a service unit test.',
  locals: function(options: BlueprintOptions) {
    return {
      friendlyTestDescription: ['Unit', 'Service', options.entity.name].join(' | ')
    };
  },
});
