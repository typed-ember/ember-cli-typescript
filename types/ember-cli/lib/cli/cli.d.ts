import UI = require("console-ui");
import {Environment} from "ember-cli";
import RSVP from "rsvp";

declare class CLI {
  name: string;
  ui: UI;
  analytics: any;
  testing: boolean;
  disableDependencyChecker: boolean;
  root: any;
  npmPackage: any;
  instrumentation: any;
  run(environment: Environment): RSVP.Promise<any>;
  callHelp(options: any): RSVP.Promise<any>;
  logError(error: any): number;
}

export = CLI;
