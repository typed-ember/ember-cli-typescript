import EmberApp = require("ember-cli/lib/broccoli/ember-app");
import Project = require("ember-cli/lib/models/project");
import { Node } from 'broccoli';
import {EmberCLIBabel} from "ember-cli-babel";

var app = new EmberApp({
  babel: {
    // enable "loose" mode
    loose: true,
    // don't transpile generator functions
    exclude: [
      'transform-regenerator',
    ],
    plugins: [
      'transform-object-rest-spread'
    ]
  }
});

var app = new EmberApp({
  'ember-cli-babel': {
    compileModules: false
  }
});

const defaults = {};

var app = new EmberApp(defaults, {
  babel: {
    plugins: ['transform-object-rest-spread']
  }
});

var app = new EmberApp(defaults, {
  'ember-cli-babel': {
    includePolyfill: true
  }
});

var app = new EmberApp(defaults, {
  babel: {
    sourceMaps: 'inline'
  }
});

declare const project: Project;
// find your babel addon (can use `this.findAddonByName('ember-cli-babel')` in ember-cli@2.14 and newer)
let babelAddon = project.addons.find(addon => addon.name === 'ember-cli-babel') as any as EmberCLIBabel;


// create the babel options to use elsewhere based on the config above
const config = {};
let options = babelAddon.buildBabelOptions(config);

// now you can pass these options off to babel or broccoli-babel-transpiler
require('babel-core').transform('something', options);

// invoke .transpileTree passing in the custom input tree
const someCustomTree: Node = 'src';
let transpiledCustomTree = babelAddon.transpileTree(someCustomTree);
