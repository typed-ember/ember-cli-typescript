declare module 'ember-cli/lib/broccoli/ember-app' {
  import CoreObject from 'core-object';

  export default class EmberApp extends CoreObject {
    options?: Record<string, unknown>;
  }
}

declare module 'ember-cli/lib/models/addon' {
  import CoreObject, { ExtendOptions } from 'core-object';
  import UI from 'console-ui';
  import Project from 'ember-cli/lib/models/project';
  import Command from 'ember-cli/lib/models/command';
  import EmberApp from 'ember-cli/lib/broccoli/ember-app';

  export default class Addon extends CoreObject {
    name: string;
    root: string;
    app?: EmberApp;
    parent: Addon | Project;
    project: Project;
    addons: Addon[];
    ui: UI;
    options?: Record<string, unknown>;
    pkg: {
      name: string;
      version: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    blueprintsPath(): string;
    included(includer: EmberApp | Project): void;
    includedCommands(): Record<string, typeof Command | ExtendOptions<Command>> | void;
    shouldIncludeChildAddon(addon: Addon): boolean;
    isDevelopingAddon(): boolean;
    setupPreprocessorRegistry(type: 'self' | 'parent', registry: unknown): void;
  }
}

declare module 'ember-cli/lib/models/command' {
  import CoreObject from 'core-object';
  import Project from 'ember-cli/lib/models/project';

  export default class Command extends CoreObject {}
}

declare module 'ember-cli/lib/models/project' {
  import CoreObject from 'core-object';
  import UI from 'console-ui';
  import Addon from 'ember-cli/lib/models/addon';

  export default class Project extends CoreObject {
    ui: UI;
    root: string;
    addons: Addon[];

    name(): string;
    isEmberCLIAddon(): boolean;
    require(module: string): unknown;
  }
}
