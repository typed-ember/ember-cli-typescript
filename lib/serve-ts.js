// @ts-check
/* eslint-env node */

const child_process = require('child_process');
const fs = require('fs');

const appNodeModules = `${process.cwd()}/node_modules`;
const Serve = require(`${appNodeModules}/ember-cli/lib/commands/serve`);
const Builder = require(`${appNodeModules}/ember-cli/lib/models/builder`);
const Watcher = require(`${appNodeModules}/ember-cli/lib/models/watcher`);

const OUT_DIR = '.e-c-ts';

/**
 * Exclude .ts files from being watched
 */
function filterTS(name) {
  if (name.startsWith('.')) {
    // these files are filtered by default
    return false;
  }

  // typescript sources are watched by `tsc --watch` instead
  return !name.endsWith('.ts');
}

class WatcherNonTS extends Watcher {
  buildOptions() {
    let options = super.buildOptions();
    options.filter = filterTS;
    return options;
  }
}

module.exports = Serve.extend({
  name: 'serve-ts',
  aliases: [],

  run(options) {
    this.project._isRunningServeTS = true;

    const builder = new Builder({
      ui: this.ui,
      outputPath: options.outputPath,
      project: this.project,
      environment: options.environment,
    });

    const watcher = new WatcherNonTS({
      ui: this.ui,
      builder,
      analytics: this.analytics,
      options,
      serving: true,
    });

    options._builder = builder;
    options._watcher = watcher;

    // TODO: typescript might be installed globally?
    // argument sequence here is meaningful; don't apply prettier.
    // prettier-ignore
    this.tsc = child_process.fork(
      'node_modules/typescript/bin/tsc',
      [
        '--watch',
        '--outDir', OUT_DIR,
        '--allowJs', 'false',
        '--noEmit', 'false',
        '--sourceMap', 'false', // TODO: enable if sourcemaps=true
      ],
      {
        silent: true, // TODO: stdout is messy
        execArgv: [],
      }
    );

    return Serve.prototype.run.call(this, options);
  },

  onInterrupt() {
    if (this.tsc) {
      this.tsc.kill();
    }

    if (fs.existsSync(OUT_DIR)) {
      fs.rmdirSync(OUT_DIR);
    }
  },
});
