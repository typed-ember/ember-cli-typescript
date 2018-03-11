import CoreObject = require('core-object');
import Project = require("./project");
import UI = require("console-ui");
import {EmberCliSettings} from "ember-cli/settings";
import RSVP from "rsvp";

declare namespace Command {
  interface CommandOptions extends EmberCliSettings {
    classic: boolean;
    dryRun: boolean;
    dummy: boolean;
    pod: boolean;
    podPath?: string;
    inRepoAddon?: boolean;
    verbose: boolean;
  }
}

/**
 * The base class for all CLI commands.
 */
declare class Command extends CoreObject {
  /**
   * The description of what this command does.
   */
  description: string;
  /**
   * Does this command work everywhere or just inside or outside of projects.
   */
  works: 'insideProject' | 'outsideProject' | 'everywhere';
  isWithinProject: boolean;
  /**
   * The name of the command.
   */
  name: string;
  /**
   * An array of aliases for the command
   */
  aliases: string[];
  /**
   * An array of available options for the command
   */
  availableOptions: Array<{
    name: string;
    type: any;
    default?: any;
    key?: string;
    required?: boolean;
    description?: string;
    aliases?: Array<string | object>;
  }>;
  /**
   * An array of anonymous options for the command
   */
  anonymousOptions: string[];
  /**
   * Registers options with command. This method provides the ability to extend or override command options.
   * Expects an object containing anonymousOptions or availableOptions, which it will then merge with
   * existing availableOptions before building the optionsAliases which are used to define shorthands.
   */
  registerOptions(options: {}): any;
  /**
   * Called when command is interrupted from outside, e.g. ctrl+C or process kill
   * Can be used to cleanup artifacts produced by command and control process exit code
   */
  onInterrupt(): RSVP.Promise<any>|undefined;
  /**
   * Looks up for the task and runs
   * It also keeps the reference for the current active task
   * Keeping reference for the current task allows to cleanup task on interruption
   */
  runTask(name: string, options: {}): RSVP.Promise<any>;
  /**
   * Hook for extending a command before it is run in the cli.run command.
   * Most common use case would be to extend availableOptions.
   */
  beforeRun(): RSVP.Promise<any>|null;
  validateAndRun(): RSVP.Promise<any>;
  /**
   * Reports if the given command has a command line option by a given name
   */
  hasOption(name: string): boolean;
  /**
   * Merges any options with duplicate keys in the availableOptions array.
   * Used primarily by registerOptions.
   */
  mergeDuplicateOption(key: string): {};
  /**
   * Normalizes option, filling in implicit values
   */
  normalizeOption(option: {}): {};
  /**
   * Assigns option
   */
  assignOption(option: {}, parsedOptions: {}, commandOptions: {}): boolean;
  /**
   * Validates option
   */
  validateOption(option: {}): boolean;
  /**
   * Parses alias for an option and adds it to optionsAliases
   */
  parseAlias(option: {}, alias: {}|string): {};
  assignAlias(option: any, alias: any): boolean;
  /**
   * Validates alias value
   */
  validateAlias(alias: {}): boolean;
  /**
   * Parses command arguments and processes
   */
  parseArgs(commandArgs: {}): {}|null;
  run(commandArgs: any): any;
  /**
   * Prints basic help for the command.
   */
  printBasicHelp(): any;
  /**
   * Prints detailed help for the command.
   */
  printDetailedHelp(): any;
  getJson(options: {}): {};

  project: Project;
  ui: UI;
}

export = Command;
