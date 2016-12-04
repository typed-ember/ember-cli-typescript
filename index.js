/* jshint node: true */

'use strict';
var path      = require('path');
var process = require('process');
var TsPreprocessor = require('./lib/typescript-preprocessor');

module.exports = {
  name: 'ember-cli-typescript',


  included: function(app) {
    this._super.included.apply(this, arguments);
    this.app = app;

  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  setupPreprocessorRegistry: function(type, registry) {
    try {
      var plugin = new TsPreprocessor({includeExtensions: ['.ts','.js']});
      registry.add('js', plugin);
    } catch ( ex ) {
      console.log( "Missing or invalid tsconfig.json, please fix or run `ember generate ember-cli-typescript`." );
      console.log( '  ' + ex.toString());
    }
  }

};
