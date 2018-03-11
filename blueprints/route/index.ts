import fs = require('fs');
import path = require('path');
import stringUtil = require('ember-cli-string-utils');
import EmberRouterGenerator = require('ember-router-generator');
import Blueprint = require("ember-cli/lib/models/blueprint");
import {FileMapVariables, BlueprintOptions} from "ember-cli/lib/models/blueprint";
import chalk, {Chalk} from 'chalk';

declare module "ember-cli/lib/models/blueprint" {
  interface BlueprintOptions {
    path?: string;
    skipRouter?: boolean;
    resetNamespace?: boolean;
  }
}

const RouteBlueprint = Blueprint.extend({
  description: 'Generates a route and a template, and registers the route with the router.',

  availableOptions: [
    {
      name: 'path',
      type: String,
      default: '',
    },
    {
      name: 'skip-router',
      type: Boolean,
      default: false,
    },
    {
      name: 'reset-namespace',
      type: Boolean,
    },
  ],

  fileMapTokens: function() {
    return {
      __name__: function(options: FileMapVariables) {
        if (options.pod) {
          return 'route';
        }
        return options.locals.moduleName;
      },
      __path__: function(options: FileMapVariables) {
        if (options.pod) {
          return path.join(options.podPath, options.locals.moduleName);
        }
        return 'routes';
      },
      __templatepath__: function(options: FileMapVariables) {
        if (options.pod) {
          return path.join(options.podPath, options.locals.moduleName);
        }
        return 'templates';
      },
      __templatename__: function(options: FileMapVariables) {
        if (options.pod) {
          return 'template';
        }
        return options.locals.moduleName;
      },
      __root__: function(options: FileMapVariables) {
        if (options.inRepoAddon) {
          return path.join('lib', options.inRepoAddon, 'addon');
        }

        if (options.inDummy) {
          return path.join('tests', 'dummy', 'app');
        }

        if (options.inAddon) {
          return 'addon';
        }

        return 'app';
      },
    };
  },

  locals: function(options: BlueprintOptions) {
    let moduleName = options.entity.name;

    if (options.resetNamespace) {
      moduleName = moduleName.split('/').pop()!;
    }

    return {
      moduleName: stringUtil.dasherize(moduleName),
    };
  },

  shouldEntityTouchRouter: function(name: string) {
    let isIndex = name === 'index';
    let isBasic = name === 'basic';
    let isApplication = name === 'application';

    return !isBasic && !isIndex && !isApplication;
  },

  shouldTouchRouter: function(name: string, options: BlueprintOptions) {
    let entityTouchesRouter = this.shouldEntityTouchRouter(name);
    let isDummy = !!options.dummy;
    let isAddon = !!options.project.isEmberCLIAddon();
    let isAddonDummyOrApp = isDummy === isAddon;

    return (
      entityTouchesRouter &&
      isAddonDummyOrApp &&
      !options.dryRun &&
      !options.inRepoAddon &&
      !options.skipRouter
    );
  },

  afterInstall: function(options: BlueprintOptions) {
    updateRouter.call(this, 'add', options);
  },

  afterUninstall: function(options: BlueprintOptions) {
    updateRouter.call(this, 'remove', options);
  },
});

function updateRouter(this: typeof RouteBlueprint.prototype, action: 'add' | 'remove', options: BlueprintOptions) {
  let entity = options.entity;
  let actionColorMap = {
    add: 'green' as 'green',
    remove: 'red' as 'red',
  };
  let color: keyof Chalk = actionColorMap[action] || 'gray';

  if (this.shouldTouchRouter(entity.name, options)) {
    writeRoute(action, entity.name, options);

    this.ui.writeLine('updating router');
    this._writeStatusToUI(chalk[color], action + ' route', entity.name);
  }
}

function findRouter(options: BlueprintOptions): string[] {
  let routerPathParts = [options.project.root];

  if (options.dummy && options.project.isEmberCLIAddon()) {
    routerPathParts = routerPathParts.concat(['tests', 'dummy', 'app', 'router.js']);
  } else {
    routerPathParts = routerPathParts.concat(['app', 'router.js']);
  }

  return routerPathParts;
}

function writeRoute(action: 'add' | 'remove', name: string, options: BlueprintOptions): void {
  let routerPath = path.join.apply(null, findRouter(options));
  let source = fs.readFileSync(routerPath, 'utf-8');

  let routes = new EmberRouterGenerator(source);
  let newRoutes = routes[action](name, options);

  fs.writeFileSync(routerPath, newRoutes.code());
}

export = RouteBlueprint;
