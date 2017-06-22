const fs = require('fs');
const path = require('path');

const debug = require('debug')('ember-cli-typescript');
const find = require('broccoli-stew').find;
const Funnel = require("broccoli-funnel");
const MergeTrees = require("broccoli-merge-trees");
const ts = require('typescript');
const tsc = require('broccoli-typescript-compiler').typescript;
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

function readConfig(configFile) {
  const result = ts.readConfigFile(configFile, ts.sys.readFile);
  if (result.error) {
    const message = ts.flattenDiagnosticMessageText(result.error.messageText, "\n");
    throw new Error(message);
  }
  return result.config;
}

/**
 * Return the paths which contain type information.
 */
function typePaths(config) {
  const cfgPaths = (config.compilerOptions && config.compilerOptions.paths) || {};

  const toTypePaths = paths => (splitPaths, key) => {
    // paths may end in a `/*`; keep everything before it
    const upToSlashStar = path => path.split("/\*")[0];

    // only store unique paths
    const notAlreadyStoredIn = storedPaths => path => !storedPaths.includes(path);

    const newPaths = paths[key]
      .map(upToSlashStar)
      .filter(notAlreadyStoredIn(splitPaths));

    return splitPaths.concat(newPaths);
  };

  const out = Object.keys(cfgPaths).reduce(toTypePaths(cfgPaths), []);
  debug("type paths", out);
  return out;
}

class TypeScriptPreprocessor {
  constructor(options) {
    debug('creating new instance with options ', options);
    this.name = 'ember-cli-typescript';
    this.ext = 'ts';
    this.options = JSON.parse(JSON.stringify(options));
  }

  toTree(inputNode, inputPath, outputPath) {
    const tsconfig = readConfig(path.join(".", "tsconfig.json"));

    // The `include` setting is meant for the IDE integration; broccoli manages
    // manages its own input files.
    tsconfig.include = ["**/*.ts"];

    // tsc needs to emit files on the broccoli pipeline, but not in the default
    // config. Otherwise its compiled `.js` files may be created inadvertently.
    tsconfig.compilerOptions.noEmit = false;
    delete tsconfig.compilerOptions.outDir;

    // Create a funnel with the type files used by the typescript compiler.
    // These will change infrequently (read: usually not at all) so grab each as
    // an *unwatched* directory, and return it at the proper location.
    const typeTrees = typePaths(tsconfig).map((typePath) => {
      const typeTree = new UnwatchedDir(typePath);
      return new Funnel(typeTree, { destDir: typePath });
    });

    const types = new MergeTrees(typeTrees);

    // Passthrough all the javascript files existing in the source/test folders.
    const passthrough = new Funnel(inputNode, {
      exclude: ["**/*.ts"],
      annotation: "TypeScript passthrough"
    });

    // Files to run through the typescript compiler.
    const filter = new MergeTrees([
      types,
      new Funnel(inputNode, {
        include: ["**/*.ts"],
        annotation: "TypeScript input"
      })
    ]);

    // Put everything together.
    return new MergeTrees([
      passthrough,
      tsc(filter, { tsconfig })
    ], {
      overwrite: true,
      annotation: "TypeScript passthrough + ouput"
    });
  }
}

module.exports = TypeScriptPreprocessor;
