import CoreObject = require('core-object');
import {CommandOptions} from "./command";

declare namespace Task {
  interface TaskOptions extends CommandOptions {
    args: string[];
  }
}

declare class Task extends CoreObject {
  run(options: any): any;

  /**
   * Interrupt comamd with an exit code
   * Called when the process is interrupted from outside, e.g. CTRL+C or `process.kill()`
   *
   * @private
   * @method onInterrupt
   */
  onInterrupt(): never;
}

export = Task;
