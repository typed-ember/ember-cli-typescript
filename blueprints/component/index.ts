import path = require('path');
import stringUtil = require('ember-cli-string-utils');
import pathUtil = require('ember-cli-path-utils');
import validComponentName = require('ember-cli-valid-component-name');
import getPathOption = require('ember-cli-get-component-path-option');
import normalizeEntityName = require('ember-cli-normalize-entity-name');
import Blueprint = require("ember-cli/lib/models/blueprint");
import {FileMapVariables, BlueprintOptions} from "ember-cli/lib/models/blueprint";

declare module "ember-cli/lib/models/blueprint" {
  interface BlueprintOptions {
    path?: string;
  }
}

export = Blueprint.extend({
  description: 'Generates a component. Name must contain a hyphen.',

  availableOptions: [
    {
      name: 'path',
      type: String,
      default: 'components',
      aliases: [
        { 'no-path': '' }
      ]
    }
  ],

  fileMapTokens() {
    return {
      __path__: function(options: FileMapVariables) {
        if (options.pod) {
          return path.join(options.podPath, options.locals.path, options.dasherizedModuleName);
        }
        return 'components';
      },
      __templatepath__: function(options: FileMapVariables) {
        if (options.pod) {
          return path.join(options.podPath, options.locals.path, options.dasherizedModuleName);
        }
        return 'templates/components';
      },
      __templatename__: function(options: FileMapVariables) {
        if (options.pod) {
          return 'template';
        }
        return options.dasherizedModuleName;
      }
    };
  },

  normalizeEntityName(entityName: string) {
    entityName = normalizeEntityName(entityName);

    return validComponentName(entityName);
  },

  locals(options: BlueprintOptions) {
    let templatePath   = '';
    let importTemplate = '';
    let contents       = '';
    // if we're in an addon, build import statement
    if (options.project.isEmberCLIAddon() || options.inRepoAddon && !options.dummy) {
      if (options.pod) {
        templatePath   = './template';
      } else {
        templatePath   = pathUtil.getRelativeParentPath(options.entity.name) +
          'templates/components/' + stringUtil.dasherize(options.entity.name);
      }
      importTemplate   = '// @ts-ignore: Ignore import of compiled template\nimport layout from \'' + templatePath + '\';\n';
      contents         = '\n  layout = layout;';
    }

    return {
      importTemplate: importTemplate,
      contents: contents,
      path: getPathOption(options)
    };
  }
});
