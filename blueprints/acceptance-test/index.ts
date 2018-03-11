import path = require('path');
import pathUtil = require('ember-cli-path-utils');
import stringUtils = require('ember-cli-string-utils');
import existsSync = require('exists-sync');
import TestFrameworkDetector = require('../test-framework-detector');
import {BlueprintOptions} from "ember-cli/lib/models/blueprint";

export = TestFrameworkDetector.extend({
  description: 'Generates an acceptance test for a feature.',

  locals(options: BlueprintOptions) {
    let testFolderRoot = stringUtils.dasherize(options.project.name());

    if (options.project.isEmberCLIAddon()) {
      testFolderRoot = pathUtil.getRelativeParentPath(options.entity.name, -1, false);
    }

    let destroyAppExists = existsSync(
      path.join(this.project.root, '/tests/helpers/destroy-app.js')
    );

    let friendlyTestName = [
      'Acceptance',
      stringUtils.dasherize(options.entity.name).replace(/[-]/g, ' '),
    ].join(' | ');

    return {
      testFolderRoot: testFolderRoot,
      friendlyTestName,
      destroyAppExists: destroyAppExists,
    };
  }
});
