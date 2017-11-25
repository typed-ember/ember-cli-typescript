const child_process = require('child_process');
const Serve = require('ember-cli/lib/commands/serve');
const Builder = require('ember-cli/lib/models/builder');
const Watcher = require('ember-cli/lib/models/watcher');

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
    const tsc = child_process.fork('node_modules/typescript/bin/tsc', [
      '--watch',
      '--outDir', '.e-c-ts',
      '--allowJs', 'false',
      '--noEmit', 'false',
      '--sourceMap', 'false', // TODO: enable if sourcemaps=true
    ], {
      silent: true, // TODO: stdout is messy
      execArgv: []
    });

    // TODO: clean up child process

    return Serve.prototype.run.call(this, options);
  }
});
