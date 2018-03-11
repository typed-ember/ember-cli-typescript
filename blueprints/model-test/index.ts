import ModelBlueprint = require('../model');
import testInfo = require('ember-cli-test-info');
import TestFrameworkDetector = require('../test-framework-detector');
import {BlueprintOptions} from "ember-cli/lib/models/blueprint";

export = TestFrameworkDetector.extend({
  description: 'Generates a model unit test.',

  locals: function(options: BlueprintOptions) {
    var result = ModelBlueprint.prototype.locals.apply(this, arguments);

    result.friendlyTestDescription = testInfo.description(options.entity.name, "Unit", "Model");

    return result;
  }
});
