import Addon = require('ember-cli/lib/models/addon');
import { Node as BroccoliTree } from 'broccoli';

type BabelPlugin = string | [string, any] | [any, any];

interface EmberCLIBabelConfig {
  /**
   Configuration options for babel-preset-env.
   See https://github.com/babel/babel-preset-env/tree/v1.6.1#options for details on these options.
   */
  babel?: {
    spec?: boolean;
    loose?: boolean;
    debug?: boolean;
    include?: string[];
    exclude?: string[];
    useBuiltIns?: boolean;
    sourceMaps?: boolean | "inline" | "both";
    plugins?: BabelPlugin[];
  };

  /**
   Configuration options for ember-cli-babel itself.
   */
  'ember-cli-babel'?: {
    includePolyfill?: boolean;
    compileModules?: boolean;
    disableDebugTooling?: boolean;
    disablePresetEnv?: boolean;
    disableEmberModulesAPIPolyfill?: boolean;
  };
}

declare module 'ember-cli/config' {
  interface Config extends EmberCLIBabelConfig {}
}

interface EmberCLIBabel extends Addon {
  name: 'ember-cli-babel';
  options: EmberCLIBabelConfig;

  /**
   Used to generate the options that will ultimately be passed to babel itself.
   */
  buildBabelOptions(config?: EmberCLIBabelConfig): object;

  /**
   Supports easier transpilation of non-standard input paths (e.g. to transpile
   a non-addon NPM dependency) while still leveraging the logic within
   ember-cli-babel for transpiling (e.g. targets, preset-env config, etc).
   */
  transpileTree(inputTree: BroccoliTree, config?: EmberCLIBabelConfig): BroccoliTree;

  /**
   Used to determine if a given plugin is required by the current target configuration.
   Does not take `includes` / `excludes` into account.

   See https://github.com/babel/babel-preset-env/blob/master/data/plugins.json for the list
   of known plugins.
   */
  isPluginRequired(pluginName: string): boolean;
}
