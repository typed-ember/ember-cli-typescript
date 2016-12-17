var tsc = require('broccoli-typescript-compiler').typescript;
var fs = require('fs');
var debug = require('debug')('ember-cli-typescript');
var ts = require('typescript');
var stew = require('broccoli-stew');
var find = stew.find;
var MergeTrees = require("broccoli-merge-trees");
var Funnel = require("broccoli-funnel");

function TypeScriptPreprocessor(options) {
  debug('creating new instance with options ', options);
  this.name = 'ember-cli-typescript';
  this.ext = 'ts';
  this.options = JSON.parse(JSON.stringify(options));
}

function readConfig(configFile) {
    var result = ts.readConfigFile(configFile, ts.sys.readFile);
    if (result.error) {
        var message = ts.flattenDiagnosticMessageText(result.error.messageText, "\n");
        throw new Error(message);
    }
    return result.config;
}

/**
 * Return the paths which contain type information.
 */
function typePaths(config) {
  var out = [
      "node_modules/@types",
  ];
  var paths = (config.compilerOptions && config.compilerOptions.paths) || {};
  Object.keys(paths).forEach( function eachEntry(k) {
    // paths may contain a /*, eliminate it
    paths[k].forEach(function eachPath(a) {
      var p = a.split("/\*")[0];
      if (out.indexOf(p) < 0) {
        out.push(p);
      }
    });
  });
  debug("type paths", out);
  return out;
}

TypeScriptPreprocessor.prototype.toTree = function(inputNode, inputPath, outputPath) {
  var config = readConfig("./tsconfig.json");
  // "include" setting is meant for the IDE integration,
  // broccoli manages its own input files.
  if (config.include) {
    delete config.include;
  }
  config.include = ["**/*"];

  // tsc needs to emit files on the broccoli pipeline, but not in the default config
  // otherwise it compiled .js files may be created inadvertently.
  config.compilerOptions.noEmit = false;
  if (config.compilerOptions.outDir) {
    delete config.compilerOptions.outDir;
  }

  /*
   * Create a funnel with the type files used by the typescript compiler.
   *
   */
  var types = find(process.cwd(), {
    include: typePaths(config).map(function(a) { return a + '/**/*'})
  });

  /*
   * Passthrough all the javascript files existing
   * in the source/test folders.
   */
  var passthrough = new Funnel(inputNode, {
    exclude: ["**/*.ts"],
    annotation: "TypeScript passthrough"
  });

  /*
   * Files to run through the typescript compiler.
   */
  var filter = new MergeTrees( [types, new Funnel(inputNode, {
    include: ["**/*.ts"],
    annotation: "TypeScript input"
  })]);

  /*
   * Put everything together.
   */
  return new MergeTrees([
    passthrough,
    tsc(filter, {tsconfig: config})
  ], {
    overwrite: true,
    annotation: "TypeScript passthrough + ouput"
  });

};


module.exports = TypeScriptPreprocessor;
