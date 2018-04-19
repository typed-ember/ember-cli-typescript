/* eslint-env node */
'use strict';

const ts = require('typescript');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const debugWatcher = require('debug')('ember-cli-typescript:watcher');

module.exports = function compile(project, tsOptions, callbacks) {
  // Ensure the output directory is created even if no files are generated
  fs.mkdirsSync(tsOptions.outDir);

  let fullOptions = Object.assign({
    rootDir: project.root,
    allowJs: false,
    noEmit: false
  }, tsOptions);

  let configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
  let createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;
  let host = ts.createWatchCompilerHost(
    configPath,
    fullOptions,
    buildWatchHooks(ts.sys, callbacks),
    createProgram,
    diagnosticCallback(callbacks.reportDiagnostic),
    diagnosticCallback(callbacks.reportWatchStatus)
  );

  return ts.createWatchProgram(host);
};

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

function buildWatchHooks(sys, callbacks) {
  let watchedFiles = new Map();
  let fileChanged = (type, path) => {
    debugWatcher('file changed (%s) %s', type, path);
    if (callbacks.watchedFileChanged) {
      callbacks.watchedFileChanged();
    }
  };

  return Object.assign({}, sys, {
    watchFile(_file, callback) {
      // tsc is inconsistent about whether it provides relative or absolute paths
      let file = path.resolve(_file);

      debugWatcher('watchFile %s', file);
      watchedFiles.set(file, callback);

      return {
        close() {
          watchedFiles.delete(file);
        }
      };
    },

    watchDirectory(dir, callback) {
      if (!fs.existsSync(dir)) return;

      let ignored = /\/(\..*?|dist|node_modules|tmp)\//;
      let watcher = chokidar.watch(dir, { ignored, ignoreInitial: true });

      watcher.on('all', (type, path) => {
        if (type === 'add' && path.endsWith('.ts')) {
          fileChanged(type, path);
          callback(path);
        } else if (watchedFiles.has(path)) {
          fileChanged(type, path);
          watchedFiles.get(path)(path, type === 'change' ? 1 : 2);
        } else {
          debugWatcher('unknown file event %s %s', type, path);
        }
      });

      return watcher;
    }
  });
}
