import Addon = require('./ember-addon');
import Registry = require("ember-cli-preprocess-registry");
import { Node as Tree } from 'broccoli';
import { Config, Environment } from 'ember-cli';

/**
 * EmberApp is the main class Ember CLI uses to manage the Broccoli trees
 * for your application. It is very tightly integrated with Broccoli and has
 * a `toTree()` method you can use to get the entire tree for your application.
 */
declare class EmberApp {
  constructor(defaults: Config, options?: Config);

  /**
   * Initializes the `tests` and `hinting` properties.
   */
  _initTestsAndHinting(options: {}): any;
  /**
   * Initializes the `project` property from `options.project` or the
   * closest Ember CLI project from the current working directory.
   */
  _initProject(options: {}): any;
  /**
   * Initializes the `options` property from the `options` parameter and
   * a set of default values from Ember CLI.
   */
  _initOptions(options: {}): any;
  /**
   * Resolves a path relative to the project's root
   */
  _resolveLocal(): any;
  _initVendorFiles(): any;
  /**
   * Returns the environment name
   */
  static env(): Environment;
  /**
   * Delegates to `broccoli-concat` with the `sourceMapConfig` option set to `options.sourcemaps`.
   */
  _concatFiles(tree: any, options: any): void;
  /**
   * Checks the result of `addon.isEnabled()` if it exists, defaults to `true` otherwise.
   */
  _addonEnabled(addon: Addon): boolean;
  _addonDisabledByBlacklist(addon: Addon): boolean;
  _addonDisabledByWhitelist(addon: Addon): boolean;
  /**
   * Returns whether an addon should be added to the project
   */
  shouldIncludeAddon(addon: Addon): boolean;
  /**
   * Calls the included hook on addons.
   */
  _notifyAddonIncluded(): any;
  /**
   * Calls the importTransforms hook on addons.
   */
  _importAddonTransforms(): any;
  /**
   * Loads and initializes addons for this project.
   * Calls initializeAddons on the Project.
   */
  initializeAddons(): any;
  /**
   * Returns a list of trees for a given type, returned by all addons.
   */
  addonTreesFor(type: string): any[];
  /**
   * Runs addon post-processing on a given tree and returns the processed tree.
   */
  addonPostprocessTree(type: string, tree: Tree): Tree;
  /**
   * Runs addon pre-processing on a given tree and returns the processed tree.
   */
  addonPreprocessTree(type: string, tree: Tree): Tree;
  /**
   * Runs addon lintTree hooks and returns a single tree containing all
   * their output.
   */
  addonLintTree(type: string, tree: Tree): Tree;
  /**
   * Imports legacy imports in this.vendorFiles
   */
  populateLegacyFiles(): any;
  /**
   * Returns the tree for app/index.html
   */
  index(): Tree;
  /**
   * Filters styles and templates from the `app` tree.
   */
  _filterAppTree(): Tree;
  _configReplacePatterns(): void;
  /**
   * Returns the tree for /tests/index.html
   */
  testIndex(): Tree;
  /**
   * Returns the tree for /public
   */
  publicTree(): Tree;
  _processedAppTree(): void;
  _processedSrcTree(): void;
  _processedTemplatesTree(): void;
  _podTemplatePatterns(): any[];
  _processedTestsTree(): void;
  _processedExternalTree(): void;
  _configTree(): void;
  _processedEmberCLITree(): void;
  _testAppConfigTree(): void;
  /**
   * Returns the tree for the app and its dependencies
   */
  appAndDependencies(): Tree;
  appTests(): any;
  /**
   * Runs the `app`, `tests` and `templates` trees through the chain of addons that produces lint trees.
   */
  lintTestsTrees(): any[];
  _addonInstalled(addonName: string): boolean;
  /**
   * Returns the tree for javascript files
   */
  javascript(): Tree;
  /**
   * Returns the tree for styles
   */
  styles(): Tree;
  /**
   * Returns the tree for test files
   */
  testFiles(): Tree;
  /**
   * Returns the tree for the additional assets which are not in
   * one of the default trees.
   */
  otherAssets(): Tree;
  dependencies(): {};
  /**
   * Imports an asset into the application.
   */
  import(asset: string, options?: {
    type?: string;
    using?: ReadonlyArray<{
      transformation?: 'amd',
      as?: string;
    }>;
    destDir?: string;
    prepend?: boolean;
    outputFile?: string;
  }): void;
  import(asset: {
    development?: string;
    production?: string;
  }): void;
  _import(assetPath: string, options: {}, directory: string, subdirectory: string, extension: string): any;
  _getAssetPath(asset: {}|string): string|undefined;
  /**
   * Returns an array of trees for this application
   */
  toArray(): Tree[];
  /**
   * Returns the merged tree for this application
   */
  toTree(additionalTrees?: Tree[]): Tree;
  toTree(...additionalTrees: Tree[]): Tree;
  /**
   * Returns the content for a specific type (section) for index.html.
   */
  contentFor(config: {}, match: RegExp, type: string): string;
  _contentForTestBodyFooter(content: any[]): any;
  _contentForHead(content: any[], config: {}): any;
  _contentForConfigModule(content: any[], config: {}): any;
  _contentForAppBoot(content: any[], config: {}): any;

  name: string;
  env: Environment;
  isProduction: boolean;
  registry: Registry;
  bowerDirectory: string;
  tests: boolean;
  hinting: boolean;
  options: object;
}

export = EmberApp;
