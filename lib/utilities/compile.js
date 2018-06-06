/* eslint-env node */
'use strict';

const chokidar = require('chokidar');
const fs = require('fs-extra');
const escapeRegex = require('escape-string-regexp');
const debug = require('debug')('ember-cli-typescript:tsc:trace');

module.exports = function compile(project, tsOptions, callbacks) {
  // Ensure the output directory is created even if no files are generated
  fs.mkdirsSync(tsOptions.outDir);

  let fullOptions = Object.assign({
    rootDir: project.root,
    allowJs: false,
    noEmit: false,
    diagnostics: debug.enabled,
    extendedDiagnostics: debug.enabled
  }, tsOptions);

  let ts = project.require('typescript');
  let host = createWatchCompilerHost(ts, fullOptions, project, callbacks);

  return ts.createWatchProgram(host);
};

function createWatchCompilerHost(ts, options, project, callbacks) {
  let configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
  let createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;
  let host = ts.createWatchCompilerHost(
    configPath,
    options,
    buildWatchHooks(project, ts.sys, callbacks),
    createProgram,
    diagnosticCallback(callbacks.reportDiagnostic),
    diagnosticCallback(callbacks.reportWatchStatus)
  );

  let afterCreate = host.afterProgramCreate;
  host.afterProgramCreate = function() {
    afterCreate.apply(this, arguments);
    if (callbacks.buildComplete) {
      // Use nextTick to preserve ordering between the `buildComplete` callback
      // and the diagnostic hooks below
      process.nextTick(() => callbacks.buildComplete());
    }
  };

  if (debug.enabled) {
    host.trace = str => debug(str.trim());
  }

  return host;
}

function diagnosticCallback(callback) {
  if (callback) {
    // The initial callbacks may be synchronously invoked during instantiation of the
    // WatchProgram, which is annoying if those callbacks want to _reference_ it, so
    // we always force invocation to be asynchronous for consistency.
    return (diagnostic) => {
      process.nextTick(() => callback(diagnostic));
    };
  }
}

function buildWatchHooks(project, sys, callbacks) {
  let ignorePatterns = ['\\..*?', 'dist', 'tmp', 'node_modules'];

  return Object.assign({}, sys, {
    watchFile: null,
    watchDirectory(dir, callback) {
      if (!fs.existsSync(dir)) return;

      let watcher = chokidar.watch(dir, {
        ignored: buildIgnoreRegex(dir, ignorePatterns),
        ignoreInitial: true
      });

      watcher.on('all', (type, path) => {
        callback(path);

        if (path.endsWith('.ts') && callbacks.watchedFileChanged) {
          callbacks.watchedFileChanged();
        }
      });

      return watcher;
    }
  });
}

function buildIgnoreRegex(rootDir, patterns) {
  let base = escapeRegex(rootDir);
  let sep = `[/\\\\]`;
  return new RegExp(`^${base}${sep}(${patterns.join('|')})${sep}`);
}
