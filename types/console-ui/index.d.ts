import inquirer = require('inquirer');

type WriteLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

/**
 * The UI provides the CLI with a unified mechanism for providing output and
 * requesting input from the user. This becomes useful when wanting to adjust
 * logLevels, or mock input/output for tests.
 */
declare class UI {
  constructor(options: {
    inputStream?: NodeJS.ReadStream,
    outputStream?: NodeJS.WriteStream,
    errorStream?: NodeJS.WriteStream,
    writeLevel?: WriteLevel;
    ci?: boolean;
  });

  /**
   * Unified mechanism to write a string to the console.
   * Optionally include a writeLevel, this is used to decide if the specific
   * logging mechanism should or should not be printed.
   */
  write(data: string, writeLevel?: WriteLevel): void;
  /**
   * Unified mechanism to write a string and new line to the console.
   * Optionally include a writeLevel, this is used to decide if the specific
   * logging mechanism should or should not be printed.
   */
  writeLine(data: string, writeLevel?: WriteLevel): void;
  /**
   * Helper method to write a string with the DEBUG writeLevel and gray chalk
   */
  writeDebugLine(data: string): void;
  /**
   * Helper method to write a string with the INFO writeLevel and cyan chalk
   */
  writeInfoLine(data: string): void;
  /**
   * Helper method to write a string with the WARNING writeLevel and yellow chalk.
   * Optionally include a test. If falsy, the warning will be printed. By default, warnings
   * will be prepended with WARNING text when printed.
   */
  writeWarnLine(data: string, test?: boolean, prepend?: boolean): void;
  /**
   * Helper method to write a string with the WARNING writeLevel and yellow chalk.
   * Optionally include a test. If falsy, the deprecation will be printed. By default deprecations
   * will be prepended with DEPRECATION text when printed.
   */
  writeDeprecateLine(data: string, test: boolean, prepend?: boolean): void;
  /**
   * Utility method to prepend a line with a flag-like string (i.e., WARNING).
   */
  prependLine(prependData: string, data: string, prepend: boolean): void;
  /**
   * Unified mechanism to an Error to the console.
   * This will occure at a writeLevel of ERROR
   */
  writeError(error: Error): void;
  /**
   * Sets the write level for the UI. Valid write levels are 'DEBUG', 'INFO',
   * 'WARNING', and 'ERROR'.
   */
  setWriteLevel(level: WriteLevel): void;
  /**
   * Launch the prompt interface (inquiry session) with (Array of Questions || Question)
   */
  prompt(questions: inquirer.Questions, callback?: (answer: inquirer.Answers) => void): Promise<inquirer.Answers>;
  WRITE_LEVELS: {};
  /**
   * Whether or not the specified write level should be printed by this UI.
   */
  writeLevelVisible(writeLevel: string): boolean;

  startProgress(data: string): void;
  stopProgress(): void;
}

export = UI;
