import path = require('path');
import stringUtil = require('ember-cli-string-utils');
import TestFrameworkDetector = require('../test-framework-detector');
import {FileMapVariables, BlueprintOptions} from "ember-cli/lib/models/blueprint";

declare module "ember-cli/lib/models/blueprint" {
  interface BlueprintOptions {
    resetNamespace?: boolean;
  }
}

export = TestFrameworkDetector.extend({
  description: 'Generates a route unit test.',

  availableOptions: [
    {
      name: 'reset-namespace',
      type: Boolean
    }
  ],

  fileMapTokens: function() {
    return {
      __test__: function (options: FileMapVariables) {
        let moduleName = options.locals.moduleName;

        if (options.pod) {
          moduleName = 'route';
        }

        return `${moduleName}-test`;
      },
      __path__: function(options: FileMapVariables) {
        if (options.pod) {
          return path.join(options.podPath, options.locals.moduleName);
        }
        return 'routes';
      }
    };
  },

  locals: function(options: BlueprintOptions) {
    let moduleName = options.entity.name;

    if (options.resetNamespace) {
      moduleName = moduleName.split('/').pop()!;
    }

    return {
      friendlyTestDescription: ['Unit', 'Route', options.entity.name].join(' | '),
      moduleName: stringUtil.dasherize(moduleName)
    };
  },
});
