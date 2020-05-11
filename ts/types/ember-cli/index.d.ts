declare module 'ember-cli/lib/broccoli/ember-app' {
  import CoreObject from 'core-object';

  export default class EmberApp extends CoreObject {
    options: Record<string, unknown>;
  }
}

declare module 'ember-cli/lib/models/addon' {
  import CoreObject, { ExtendOptions } from 'core-object';
  import UI from 'console-ui';
  import { Application } from 'express';
  import Project from 'ember-cli/lib/models/project';
  import { TaskOptions } from 'ember-cli/lib/models/task';
  import Command from 'ember-cli/lib/models/command';
  import EmberApp from 'ember-cli/lib/broccoli/ember-app';
  import PreprocessRegistry from 'ember-cli-preprocess-registry';

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
    serverMiddleware(options: { app: Application; options?: TaskOptions }): void | Promise<void>;
    testemMiddleware(app: Application, options?: TaskOptions): void;
    setupPreprocessorRegistry(type: 'self' | 'parent', registry: PreprocessRegistry): void;
  }
}

declare module 'ember-cli/lib/models/blueprint' {
  class Blueprint {
    taskFor(taskName: string): void;
  }
  export = Blueprint;
}

declare module 'ember-cli/lib/models/task' {
  export interface TaskOptions {
    path?: string;
  }
}

declare module 'ember-cli/lib/models/command' {
  import CoreObject from 'core-object';
  import UI from 'console-ui';
  import Project from 'ember-cli/lib/models/project';

  interface CommandOption {
    name: string;
    type: unknown;
    description?: string;
    required?: boolean;
    default?: unknown;
    aliases?: string[];
  }

  export default class Command extends CoreObject {
    name: string;
    works: 'insideProject' | 'outsideProject' | 'everywhere';
    description: string;
    availableOptions: CommandOption[];
    anonymousOptions: string[];

    ui: UI;
    project: Project;

    run(options: {}): void | Promise<unknown>;
  }
}

declare module 'ember-cli/lib/models/project' {
  import CoreObject from 'core-object';
  import UI from 'console-ui';
  import Addon from 'ember-cli/lib/models/addon';

  export default class Project extends CoreObject {
    ui: UI;
    root: string;
    addons: Addon[];
    pkg: {
      name: string;
      version: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    name(): string;
    isEmberCLIAddon(): boolean;
    require(module: string): unknown;
  }
}
