/* eslint-env node */
'use strict';

const chokidar = require('chokidar');
const fs = require('fs-extra');
const escapeRegex = require('escape-string-regexp');
const path = require('path');

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
  let watchedFiles = new Map();

  return Object.assign({}, ts.sys, {
    watchFile(file, callback) {
      let key = path.resolve(file);
      if (!watchedFiles.has(key)) {
        debug(`watching file %s`, key);
        watchedFiles.set(key, []);
      }

      watchedFiles.get(key).push(callback);

      return {
        close() {
          let callbacks = watchedFiles.get(key);
          if (callbacks.length === 1) {
            debug(`unwatching file %s`, key);
            watchedFiles.delete(key);
          } else {
            callbacks.splice(callbacks.indexOf(callback), 1);
          }
        }
      };
    },

    watchDirectory(dir, callback) {
      if (!fs.existsSync(dir)) {
        debug(`skipping watch for nonexistent directory %s`, dir);
        return;
      }

      let ignored = buildIgnoreRegex(dir, ignorePatterns);
      let watcher = chokidar.watch(dir, { ignored, ignoreInitial: true });
      debug(`watching directory %s %o`, dir, { ignored });

      watcher.on('all', (type, rawPath) => {
        let resolvedPath = path.resolve(rawPath);

        if (watchedFiles.has(resolvedPath) && (type === 'change' || type === 'unlink')) {
          debug(`%s: watched path %s`, type, resolvedPath);
          let kind = type === 'change' ? ts.FileWatcherEventKind.Changed : ts.FileWatcherEventKind.Deleted;
          watchedFiles.get(resolvedPath).forEach(callback => callback(resolvedPath, kind));
        } else {
          debug(`%s: unwatched path %s (for directory watch on %s)`, type, resolvedPath, dir);
          callback(resolvedPath);
        }

        if (resolvedPath.endsWith('.ts') && callbacks.watchedFileChanged) {
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
