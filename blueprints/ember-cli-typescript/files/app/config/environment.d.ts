export default config;

/**
 * Type declarations for
 *    import config from './config/environment'
 *
 * For now these need to be managed by the developer
 * since different ember addons can materialize new entries.
 */
declare namespace config {
  var environment: any;
  var modulePrefix: string;
  var podModulePrefix: string;
  var locationType: string;
  var rootURL: string;
}
