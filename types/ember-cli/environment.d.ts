import {Environment, LocationType} from "ember-cli";

/**
 * config/environment.js
 */
export interface EnvironmentConfig {
  environment?: Environment;
  modulePrefix?: string;
  podModulePrefix?: string;
  locationType?: LocationType;
  rootURL?: string;
  EmberENV?: {
    EXTEND_PROTOTYPES?: boolean | {
      Date?: boolean;
      String?: boolean;
      Function?: boolean;
    };
    FEATURES?: {
      [name: string]: boolean;
    }
    ENABLE_ALL_FEATURES?: boolean;
  }
  APP?: {
    [key: string]: any;
  }
}
