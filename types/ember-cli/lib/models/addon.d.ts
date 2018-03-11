import EmberApp = require('../broccoli/ember-app');
import Project = require('./project');
import CoreObject = require('core-object');
import UI = require("console-ui");
import Command = require("./command");
import { Node as Tree } from 'broccoli';
import Registry = require("ember-cli-preprocess-registry");
import { Environment, TreeType } from 'ember-cli';
import {Package} from "ember-cli/package-json";

/**
 * Root class for an Addon. If your addon module exports an Object this
 * will be extended from this base class. If you export a constructor (function),
 * it will **not** extend from this class.
 */
declare class Addon extends CoreObject {
  /**
   * Initializes the addon.  If you override this method make sure and call `this._super.init && this._super.init.apply(this, arguments);` or your addon will not work.
   */
  init(parent: Project|Addon, project: Project): void;
  /**
   * Returns whether this is using a module unification format.
   */
  isModuleUnification?(): boolean;
  /**
   * Shorthand method for [broccoli-concat](https://github.com/ember-cli/broccoli-concat)
   */
  concatFiles(tree: Tree, options: {}): Tree;
  /**
   * Allows to mark the addon as developing, triggering live-reload in the project the addon is linked to.
   */
  isDevelopingAddon(): boolean;
  /**
   * Discovers all child addons of this addon and stores their names and
   * package.json contents in this.addonPackages as key-value pairs
   */
  discoverAddons(): void;
  /**
   * Invoke the specified method for each enabled addon.
   */
  eachAddonInvoke(methodName: string, args?: any[]): any[];
  /**
   * Returns a given type of tree (if present), merged with the
   * application tree. For each of the trees available using this
   * method, you can also use a direct method called `treeFor[Type]` (eg. `treeForApp`).
   */
  treeFor(name: TreeType): Tree;
  /**
   * Calculates a cacheKey for the given treeType. It is expected to return a
   * cache key allowing multiple builds of the same tree to simply return the
   * original tree (preventing duplicate work). If it returns null / undefined
   * the tree in question will opt out of this caching system.
   */
  cacheKeyForTree(treeType: string): string;
  /**
   * This method climbs up the hierarchy of addons
   * up to the host application.
   */
  _findHost?(): EmberApp;
  /**
   * This method is called when the addon is included in a build. You
   * would typically use this hook to perform additional imports
   */
  included(parent: EmberApp): void;
  /**
   * Imports an asset into this addon.
   */
  import(asset: {}|string, options?: {}): void;
  /**
   * Returns the tree for all app files
   */
  treeForApp(tree: Tree): Tree | undefined;
  /**
   * Returns the tree for all template files
   */
  treeForTemplates(tree: Tree): Tree | undefined;
  /**
   * Returns the tree for this addon's templates
   */
  treeForAddonTemplates(tree: Tree): Tree | undefined;
  /**
   * Returns a tree for this addon
   */
  treeForAddon(tree: Tree): Tree | undefined;
  /**
   * Returns the tree for all style files
   */
  treeForStyles(tree: Tree): Tree | undefined;
  /**
   * Returns the tree for all vendor files
   */
  treeForVendor(tree: Tree): Tree | undefined;
  /**
   * Returns the tree for all test support files
   */
  treeForTestSupport(tree: Tree): Tree | undefined;
  /**
   * Returns the tree for all public files
   */
  treeForPublic(tree: Tree): Tree | undefined;
  /**
   * Returns the tree for all test files namespaced to a given addon.
   */
  treeForAddonTestSupport(tree: Tree): Tree | undefined;
  /**
   * Runs the styles tree through preprocessors.
   */
  compileStyles(addonStylesTree?: Tree): Tree;
  /**
   * Looks in the addon/ and addon/templates trees to determine if template files
   * exists that need to be precompiled.
   */
  shouldCompileTemplates(): boolean;
  /**
   * Looks in the addon/ and addon/templates trees to determine if template files
   * exists in the pods format that need to be precompiled.
   */
  _shouldCompilePodTemplates(): boolean;
  /**
   * Runs the templates tree through preprocessors.
   */
  compileTemplates(tree: Tree): Tree;
  /**
   * Runs the addon tree through preprocessors.
   */
  compileAddon(tree: Tree): Tree;
  /**
   * Returns a tree with JSHhint output for all addon JS.
   */
  jshintAddonTree(): Tree;
  /**
   * Returns a tree containing the addon's js files
   */
  addonJsFiles(): Tree;
  /**
   * Preprocesses a javascript tree.
   */
  preprocessJs(): Tree;
  /**
   * Returns a tree with all javascript for this addon.
   */
  processedAddonJsFiles(the: Tree): Tree;
  /**
   * Returns the module name for this addon.
   */
  moduleName(): string;
  /**
   * Returns the path for addon blueprints.
   */
  blueprintsPath(): string;
  /**
   * Augments the applications configuration settings.
   */
  config(env: Environment, baseConfig: {}): {};
  dependencies(): { [name: string]: string; };
  isEnabled(): boolean;
  /**
   * Can be used to exclude addons from being added as a child addon.
   */
  shouldIncludeChildAddon(childAddon: Addon): boolean;
  /**
   * Allows the specification of custom addon commands.
   * Expects you to return an object whose key is the name of the command and value is the command instance..
   */
  includedCommands?(): { [name: string]: typeof Command } | undefined;
  /**
   * Allows addons to define a custom transfrom function that other addons and app can use when using `app.import`.
   */
  importTransforms?(): {};
  /**
   * Pre-process a tree
   */
  preprocessTree?(type: TreeType, tree: Tree): Tree;
  /**
   * Post-process a tree
   */
  postprocessTree?(type: TreeType, tree: Tree): Tree;
  /**
   * This hook allows you to make changes to the express server run by ember-cli.
   */
  serverMiddleware?(startOptions: {}): void;
  /**
   * This hook allows you to make changes to the express server run by testem.
   */
  testemMiddleware?(app: {}): void;
  /**
   * This hook is called before a build takes place.
   */
  preBuild?(result: {}): void;
  /**
   * This hook is called after a build is complete.
   */
  postBuild?(result: {}): void;
  /**
   * This hook is called after the build has been processed and the build files have been copied to the output directory
   */
  outputReady?(result: {}): void;
  /**
   * This hook is called when an error occurs during the preBuild, postBuild or outputReady hooks
   * for addons, or when the build fails
   */
  buildError?(error: Error): void;
  /**
   * Used to add preprocessors to the preprocessor registry. This is often used by addons like [ember-cli-htmlbars](https://github.com/ember-cli/ember-cli-htmlbars)
   * and [ember-cli-coffeescript](https://github.com/kimroen/ember-cli-coffeescript) to add a `template` or `js` preprocessor to the registry.
   */
  setupPreprocessorRegistry(type: 'self' | 'parent', registry: any): void;
  /**
   * Return value is merged into the **tests** tree. This lets you inject
   * linter output as test results.
   */
  lintTree?(treeType: string, tree: Tree): void;
  /**
   * Allow addons to implement contentFor method to add string output into the associated `{{content-for 'foo'}}` section in `index.html`
   */
  contentFor?(type: any, config: any, content: any): any;
  /**
   * Returns the absolute path for a given addon
   */
  resolvePath?(addon: string): string;
  /**
   * Returns the addon class for a given addon name.
   * If the Addon exports a function, that function is used
   * as constructor. If an Object is exported, a subclass of
   * `Addon` is returned with the exported hash merged into it.
   */
  static lookup(addon: string): Addon;

  root: string;
  name: string;
  app: EmberApp;
  parent: Project | EmberApp;
  project: Project;
  registry: Registry;
  ui: UI;
  pkg: Package;
  addons: ReadonlyArray<Addon>;
}

export = Addon;
