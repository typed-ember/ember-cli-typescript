export { Package } from './package-json';
export { Config } from './config';
export { EnvironmentConfig } from './environment';
export { EmberCliSettings } from './settings';

export type Environment = 'development' | 'production' | 'test';

export type LocationType = 'auto' | 'history' | 'hash' | 'none';

export type TreeType = 'app' | 'addon' | 'addon-styles' | 'addon-templates' | 'addon-test-support' |
  'public' | 'styles' | 'templates' | 'test-support' | 'vendor';
