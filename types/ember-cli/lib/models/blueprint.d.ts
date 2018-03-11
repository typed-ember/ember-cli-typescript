import UI = require("console-ui");
import Project = require("./project");
import CoreObject = require("core-object");
import {EmberCliSettings} from "ember-cli";
import {TaskOptions} from './task';
import RSVP from "rsvp";

interface FileInfo {}
interface Files {}

declare namespace Blueprint {
  interface BlueprintOptions extends TaskOptions {
    target: string;
    entity: {
      name: string;
      options: {
        [name: string]: string;
      };
    }
    ui: UI;
    analytics: any;
    project: Project;
    settings: EmberCliSettings;
    testing?: boolean;
    taskOptions: TaskOptions;
    originBlueprintName: string;
  }

  interface FileMap {
    __name__: string;
    __path__: string;
    __root__: string;
    __test__: string;
  }

  interface CustomLocals {
    [name: string]: any;
  }

  interface Locals {
    dasherizedPackageName: string;
    classifiedPackageName: string;
    dasherizedModuleName: string;
    classifiedModuleName: string;
    camelizedModuleName: string;
    decamelizedModuleName: string;
    fileMap: FileMap;
    hasPathToken: boolean;
    targetFiles?: any;
    rawArgs?: any;
  }

  interface FileMapVariables {
    pod: boolean;
    podPath: string;
    hasPathToken: boolean;
    inAddon: boolean;
    inRepoAddon: any;
    inDummy: boolean;
    blueprintName: string;
    originBlueprintName: string;
    dasherizedModuleName: string;
    locals: CustomLocals;
  }
}

/**
 * A blueprint is a bundle of template files with optional install
 * logic.
 */
declare class Blueprint extends CoreObject {
  /**
   * Hook to specify the path to the blueprint's files. By default this is
   * `path.join(this.path, 'files)`.
   */
  filesPath(options: {}): string;
  /**
   * Used to retrieve files for blueprint.
   */
  files(): any[];
  srcPath(file: string): string;
  /**
   * Hook for normalizing entity name
   */
  normalizeEntityName(entityName: string): void;
  install(options: Blueprint.BlueprintOptions): RSVP.Promise<any>;
  uninstall(options: Blueprint.BlueprintOptions): RSVP.Promise<any>;
  /**
   * Hook for running operations before install.
   */
  beforeInstall(): RSVP.Promise<any>|null;
  /**
   * Hook for running operations after install.
   */
  afterInstall(): RSVP.Promise<any>|null;
  /**
   * Hook for running operations before uninstall.
   */
  beforeUninstall(): RSVP.Promise<any>|null;
  /**
   * Hook for running operations after uninstall.
   */
  afterUninstall(): RSVP.Promise<any>|null;
  /**
   * Hook for adding custom template variables.
   */
  locals(options: {}): {}|RSVP.Promise<any>|null;
  /**
   * Hook to add additional or override existing fileMap tokens.
   */
  fileMapTokens(): {
    [name: string]: (options: Blueprint.FileMapVariables) => string;
  };
  /**
   * Used to generate fileMap tokens for mapFile.
   */
  generateFileMap(fileMapVariables: {}): {};
  buildFileInfo(destPath: Function, templateVariables: {}, file: string): FileInfo;
  isUpdate(): boolean;
  processFiles(intoDir: string, templateVariables: {}): any;
  processFilesForUninstall(intoDir: string, templateVariables: {}): any;
  mapFile(file: string, locals: any): string;
  /**
   * Looks for a __root__ token in the files folder. Must be present for
   * the blueprint to support addon tokens. The `server`, `blueprints`, and `test`
   */
  supportsAddon(): boolean;
  /**
   * Used to add a package to the project's `package.json`.
   */
  addPackageToProject(packageName: string, target: string): RSVP.Promise<any>;
  /**
   * Used to add multiple packages to the project's `package.json`.
   */
  addPackagesToProject(packages: any[]): RSVP.Promise<any>;
  /**
   * Used to remove a package from the project's `package.json`.
   */
  removePackageFromProject(packageName: string): RSVP.Promise<any>;
  /**
   * Used to remove multiple packages from the project's `package.json`.
   */
  removePackagesFromProject(packages: any[]): RSVP.Promise<any>;
  /**
   * Used to add a package to the projects `bower.json`.
   */
  addBowerPackageToProject(localPackageName: string, target: string, installOptions: {}): RSVP.Promise<any>;
  /**
   * Used to add an array of packages to the projects `bower.json`.
   */
  addBowerPackagesToProject(packages: any[], installOptions: {}): RSVP.Promise<any>;
  /**
   * Used to add an addon to the project's `package.json` and run it's
   * `defaultBlueprint` if it provides one.
   */
  addAddonToProject(options: {}): RSVP.Promise<any>;
  /**
   * Used to add multiple addons to the project's `package.json` and run their
   * `defaultBlueprint` if they provide one.
   */
  addAddonsToProject(options: {}): RSVP.Promise<any>;
  /**
   * Used to retrieve a task with the given name. Passes the new task
   * the standard information available (like `ui`, `analytics`, `project`, etc).
   */
  taskFor(dasherizedName: any): any;
  /**
   * Inserts the given content into a file. If the `contentsToInsert` string is already
   * present in the current contents, the file will not be changed unless `force` option
   * is passed.
   */
  insertIntoFile(pathRelativeToProjectRoot: string, contentsToInsert: string, providedOptions: {}): RSVP.Promise<any>;
  /**
   * Used to retrieve a blueprint with the given name.
   */
  lookupBlueprint(dasherizedName: string): Blueprint;
  static lookup(name: string, options: {}): Blueprint;
  /**
   * Loads a blueprint from given path.
   */
  static load(blueprintPath: string): Blueprint;
  static list(options: {}): any[];
  /**
   * Files that are renamed when installed into the target directory.
   * This allows including files in the blueprint that would have an effect
   * on another process, such as a file named `.gitignore`.
   */
  static renamedFiles: any;
  static ignoredFiles: any;
  static ignoredUpdateFiles: any;
  static defaultLookupPaths: any;
  prepareConfirm(info: FileInfo): RSVP.Promise<any>;
  markIdenticalToBeSkipped(info: FileInfo): any;
  markToBeRemoved(info: FileInfo): any;
  gatherConfirmationMessages(collection: any[], info: FileInfo): any[];
  isFile(info: FileInfo): RSVP.Promise<any>;
  isIgnored(info: FileInfo): boolean;
  /**
   * Combines provided lookup paths with defaults and removes
   * duplicates.
   */
  generateLookupPaths(lookupPaths: any[]): any[];
  /**
   * Looks for a __path__ token in the files folder. Must be present for
   * the blueprint to support pod tokens.
   */
  hasPathToken(files: Files): boolean;
  isValidFile(fileInfo: {}): RSVP.Promise<any>;
  isFilePath(fileInfo: {}): RSVP.Promise<any>;
  dir(): any[];
  getDetailedHelpPath(thisPath: string): string;

  path: string;
  name: string;
  description: string;
  project: Project;
  ui: UI;
  dryRun: boolean;
  pod: boolean;
  availableOptions: Array<{
    name: string;
    type: any,
    aliases?: string[];
    default?: any;
  }>;
}

export = Blueprint;
