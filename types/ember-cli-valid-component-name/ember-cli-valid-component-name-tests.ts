import validComponentName = require("ember-cli-valid-component-name");

validComponentName('x-form'); //  'x-form'
validComponentName('form'); // SilentError
