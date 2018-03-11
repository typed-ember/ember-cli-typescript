// Stolen from ember-data/lib/utilities
import stringUtil = require('ember-cli-string-utils');
import SilentError = require('silent-error');
import pathUtil = require('ember-cli-path-utils');
import existsSync = require('exists-sync');
import path = require('path');
import {BlueprintOptions} from "ember-cli/lib/models/blueprint";

export = function(type: string, baseClass: string, options: BlueprintOptions) {
  const entityName = options.entity.name;
  const isAddon = options.inRepoAddon || options.project.isEmberCLIAddon();
  let relativePath = pathUtil.getRelativePath(options.entity.name);

  if (options.pod && options.podPath) {
    relativePath = pathUtil.getRelativePath(options.podPath + options.entity.name);
  }

  const entityDirectory = type + 's';
  const applicationEntityPath = path.join(
    options.project.root,
    'app',
    entityDirectory,
    'application.js'
  );
  const hasApplicationEntity = existsSync(applicationEntityPath);
  if (!isAddon && !options.baseClass && entityName !== 'application' && hasApplicationEntity) {
    options.baseClass = 'application';
  }

  if (options.baseClass === entityName) {
    throw new SilentError(
      stringUtil.classify(type) +
        's cannot extend from themself. To resolve this, remove the `--base-class` option or change to a different base-class.'
    );
  }
  let importStatement = "import DS from 'ember-data';";

  if (options.baseClass) {
    baseClass = stringUtil.classify(options.baseClass.replace('/', '-'));
    baseClass = baseClass + stringUtil.classify(type);
    importStatement = 'import ' + baseClass + " from '" + relativePath + options.baseClass + "';";
  }

  return {
    importStatement: importStatement,
    baseClass: baseClass,
  };
};
