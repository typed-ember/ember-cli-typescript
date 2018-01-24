// @ts-check
/* eslint-env node */

const child_process = require('child_process');
const fs = require('fs');

const rimraf = require('rimraf');
const OUT_DIR = '.e-c-ts';

module.exports = (project) => {
  const Serve = project.require('ember-cli/lib/commands/serve');
  const Builder = project.require('ember-cli/lib/models/builder');
  const Watcher = project.require('ember-cli/lib/models/watcher');

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

  return Serve.extend({
    name: 'serve-ts',
    aliases: ['st'],
    works: 'insideProject',
    description:
      'Serve the app/addon with the TypeScript compiler in incremental mode. (Much faster!)',

    run(options) {
      this.project._isRunningServeTS = true;

      const builder = new Builder({
        ui: this.ui,
        outputPath: options.outputPath,
        project: this.project,
        environment: options.environment,
      });

      // We're ignoring this because TS doesn't have types for `Watcher`; this is
      // fine, though.
      // @ts-ignore
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
          silent: true,
          execArgv: [],
        }
      );
      this.tsc.stdout.on('data', data => {
        this.ui.write(data);
      });
      this.tsc.stderr.on('data', data => {
        this.ui.writeError(data);
      });

      return Serve.prototype.run.call(this, options);
    },

    onInterrupt() {
      return Serve.prototype.onInterrupt.apply(this, arguments).then(() => {
        if (this.tsc) {
          this.tsc.kill();
        }

        if (fs.existsSync(OUT_DIR)) {
          rimraf.sync(OUT_DIR);
        }
      });
    },
  });
};
