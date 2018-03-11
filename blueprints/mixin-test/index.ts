import TestFrameworkDetector = require('../test-framework-detector');
import {BlueprintOptions} from "ember-cli/lib/models/blueprint";

export = TestFrameworkDetector.extend({
  description: 'Generates a mixin unit test.',
  locals: function(options: BlueprintOptions) {
    return {
      projectName: options.inRepoAddon ? options.inRepoAddon : options.project.name(),
      friendlyTestName: ['Unit', 'Mixin', options.entity.name].join(' | ')
    };
  }
});
