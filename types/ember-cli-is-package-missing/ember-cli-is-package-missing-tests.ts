import isPackageMissing = require('ember-cli-is-package-missing');
import Blueprint = require("ember-cli/lib/models/blueprint");

declare const context: Blueprint;
if (isPackageMissing(context, 'sivakumar')) {
  // ...
}
