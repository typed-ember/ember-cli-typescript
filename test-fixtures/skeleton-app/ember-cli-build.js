'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  return new EmberApp(defaults, {}).toTree();
};
