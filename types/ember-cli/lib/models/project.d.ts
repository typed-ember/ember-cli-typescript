import Addon = require('./addon');
import UI = require("console-ui");
import {Environment, Package} from "ember-cli";
import {EnvironmentConfig} from "../../environment";

/**
 * The Project model is tied to your package.json. It is instantiated
 * by giving {{#crossLink "Project/closestSync:method"}}{{/crossLink}}
 * the path to your project.
 */
declare class Project {
  /**
   * Sets the name of the bower directory for this project
   */
  setupBowerDirectory(): any;
  /**
   * Returns the name from package.json.
   */
  name(): string;
  /**
   * Returns whether or not this is an Ember CLI project.
   * This checks whether ember-cli is listed in devDependencies.
   */
  isEmberCLIProject(): boolean;
  /**
   * Returns whether or not this is an Ember CLI addon.
   */
  isEmberCLIAddon(): boolean;
  /**
   * Returns whether this is using a module unification format.
   */
  isModuleUnification(): boolean;
  /**
   * Returns the path to the configuration.
   */
  configPath(): string;
  /**
   * Loads the configuration for this project and its addons.
   */
  config(env?: Environment): EnvironmentConfig;
  /**
   * Returns the targets of this project, or the default targets if not present.
   */
  targets: object;
  /**
   * Returns the addons configuration.
   */
  getAddonsConfig(env: string, appConfig: {}): {};
  /**
   * Returns whether or not the given file name is present in this project.
   */
  has(file: string): boolean;
  /**
   * Resolves the absolute path to a file synchronously
   */
  resolveSync(file: string): string;
  /**
   * Calls `require` on a given module from the context of the project. For
   * instance, an addon may want to require a class from the root project's
   * version of ember-cli.
   */
  require(file: string): {};
  /**
   * Returns the dependencies from a package.json
   */
  dependencies(pkg?: Package, excludeDevDeps?: boolean): {[name: string]: string; };
  /**
   * Returns the bower dependencies for this project.
   */
  bowerDependencies(bower?: string): {[name: string]: string; };
  /**
   * Provides the list of paths to consult for addons that may be provided
   * internally to this project. Used for middleware addons with built-in support.
   */
  supportedInternalAddonPaths(): any;
  /**
   * Discovers all addons for this project and stores their names and
   * package.json contents in this.addonPackages as key-value pairs
   */
  discoverAddons(): any;
  /**
   * Loads and initializes all addons for this project.
   */
  initializeAddons(): any;
  /**
   * Returns what commands are made available by addons by inspecting
   * `includedCommands` for every addon.
   */
  addonCommands(): {};
  /**
   * Execute a given callback for every addon command.
   * Example:
   */
  eachAddonCommand(callback: Function): any;
  /**
   * Path to the blueprints for this project.
   */
  localBlueprintLookupPath(): string;
  /**
   * Returns a list of paths (including addon paths) where blueprints will be looked up.
   */
  blueprintLookupPaths(): any[];
  /**
   * Returns a list of addon paths where blueprints will be looked up.
   */
  addonBlueprintLookupPaths(): any[];
  /**
   * Reloads package.json
   */
  reloadPkg(): {};
  /**
   * Re-initializes addons.
   */
  reloadAddons(): any;
  /**
   * Find an addon by its name
   */
  findAddonByName(name: string): Addon | undefined;
  /**
   * Generate test file contents.
   */
  generateTestFile(moduleName: string, tests: Object[]): string;
  /**
   * Returns a new project based on the first package.json that is found
   * in `pathName`.
   */
  static closestSync(pathName: string, _ui: UI): Project;
  /**
   * Returns a new project based on the first package.json that is found
   * in `pathName`, or the nullProject.
   */
  static projectOrnullProject(_ui: UI): Project;
  /**
   * Returns the project root based on the first package.json that is found
   */
  static getProjectRoot(): string;

  root: string;
  addons: ReadonlyArray<Addon>;
  pkg: Package;
  nodeModulesPath: string;
  bowerDirectory: string;
}

export = Project;
