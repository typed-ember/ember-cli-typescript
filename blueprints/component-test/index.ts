import path = require('path');
import stringUtil = require('ember-cli-string-utils');
import isPackageMissing = require('ember-cli-is-package-missing');
import getPathOption = require('ember-cli-get-component-path-option');

import TestFrameworkDetector = require('../test-framework-detector');
import {FileMapVariables, BlueprintOptions} from "ember-cli/lib/models/blueprint";

declare module "ember-cli/lib/models/blueprint" {
  interface BlueprintOptions {
    testType?: 'integration' | 'unit';
  }
}

export = TestFrameworkDetector.extend({
  description: 'Generates a component integration or unit test.',

  availableOptions: [
    {
      name: 'test-type',
      type: ['integration', 'unit'],
      default: 'integration',
      aliases: [
        { 'i': 'integration' },
        { 'u': 'unit' },
        { 'integration': 'integration' },
        { 'unit': 'unit' }
      ]
    }
  ],

  fileMapTokens: function() {
    return {
      __testType__: function(options: FileMapVariables) {
        return options.locals.testType || 'integration';
      },
      __path__: function(options: FileMapVariables) {
        if (options.pod) {
          return path.join(options.podPath, options.locals.path, options.dasherizedModuleName);
        }
        return 'components';
      }
    };
  },
  locals: function(options: BlueprintOptions) {
    let dasherizedModuleName = stringUtil.dasherize(options.entity.name);
    let componentPathName = dasherizedModuleName;
    let testType = options.testType || 'integration';

    let friendlyTestDescription = [
      testType === 'unit' ? 'Unit' : 'Integration',
      'Component',
      dasherizedModuleName,
    ].join(' | ');

    if (options.pod && options.path !== 'components' && options.path !== '') {
      componentPathName = [options.path, dasherizedModuleName].filter(Boolean).join('/');
    }

    return {
      path: getPathOption(options),
      testType: testType,
      componentPathName: componentPathName,
      friendlyTestDescription: friendlyTestDescription
    };
  },
  afterInstall: function(options: BlueprintOptions) {
    if (!options.dryRun && options.testType === 'integration' && isPackageMissing(this, 'ember-cli-htmlbars-inline-precompile')) {
      return this.addPackagesToProject([
        { name: 'ember-cli-htmlbars-inline-precompile', target: '^0.3.1' }
      ]);
    }
  }
});
