import stringUtil = require('ember-cli-string-utils');
import useTestFrameworkDetector = require('../test-framework-detector');
import {BlueprintOptions} from "ember-cli/lib/models/blueprint";

export = useTestFrameworkDetector.extend({
  description: 'Generates a controller unit test.',
  locals: function(options: BlueprintOptions) {
    let dasherizedModuleName = stringUtil.dasherize(options.entity.name);
    let controllerPathName = dasherizedModuleName;
    return {
      controllerPathName: controllerPathName,
      friendlyTestDescription: ['Unit', 'Controller', dasherizedModuleName].join(' | ')
    };
  }
});
