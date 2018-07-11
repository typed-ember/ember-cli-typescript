/* eslint-env node */
'use strict';

const chokidar = require('chokidar');
const fs = require('fs-extra');
const escapeRegex = require('escape-string-regexp');
const path = require('path');
const glob = require('glob');

const trace = require('debug')('ember-cli-typescript:tsc:trace');
const debug = require('debug')('ember-cli-typescript:watcher');

module.exports = function compile(project, tsOptions, callbacks) {
  // Ensure the output directory is created even if no files are generated
  fs.mkdirsSync(tsOptions.outDir);

  let fullOptions = Object.assign({
    rootDir: project.root,
    allowJs: false,
    noEmit: false,
    diagnostics: trace.enabled,
    extendedDiagnostics: trace.enabled
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
    buildWatchHooks(project, ts, callbacks),
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

  if (trace.enabled) {
    host.trace = str => trace(str.trim());
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

function buildWatchHooks(project, ts, callbacks) {
  let ignorePatterns = ['\\..*?', 'dist', 'tmp', 'node_modules'];

  return Object.assign({}, ts.sys, {
    watchFile: null,
    watchDirectory(rawDir, callback) {
      if (!fs.existsSync(rawDir)) {
        debug(`skipping watch for nonexistent directory %s`, rawDir);
        return;
      }

      let dir = getCanonicalCapitalization(path.resolve(rawDir));
      let ignored = buildIgnoreDefs(dir, ignorePatterns);
      let watcher = chokidar.watch(dir, { ignored, ignoreInitial: true });
      debug(`watching directory %s %o`, dir, { ignored });

      watcher.on('all', (type, rawPath) => {
        let resolvedPath = path.resolve(rawPath);

        debug(`%s: %s (for directory watch on %s)`, type, resolvedPath, dir);
        callback(resolvedPath);

        if (resolvedPath.endsWith('.ts') && callbacks.watchedFileChanged) {
          callbacks.watchedFileChanged();
        }
      });

      return {
        close() {
          debug('closing watcher for %s', dir);
          watcher.close();
        }
      };
    }
  });
}

function buildIgnoreDefs(rootDir, patterns) {
  let base = escapeRegex(rootDir);
  let sep = `[/\\\\]`;
  return [
    '**/node_modules/**',
    new RegExp(`^${base}${sep}(${patterns.join('|')})${sep}`, 'i')
  ];
}

// On case-insensitive file systems, tsc will normalize paths to be all lowercase,
// but chokidar expects the paths it's given to watch to exactly match what it's
// delivered in fs events.
function getCanonicalCapitalization(rawPath) {
  let normalized = rawPath.replace(/\\/g, '/').replace(/^[a-z]:/i, '');
  return glob.sync(normalized, { nocase: true })[0];
}
