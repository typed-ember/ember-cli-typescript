/* eslint-env node */
'use strict';

const mkdirp = require('mkdirp');
const ts = require('typescript');
const chokidar = require('chokidar');
const fs = require('fs-extra');

module.exports = function compile(project, tsOptions, callbacks) {
  // Ensure the output directory is created even if no files are generated
  mkdirp.sync(tsOptions.outDir);

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
    buildWatchHooks(ts.sys),
    createProgram,
    callbacks.reportDiagnostic,
    callbacks.reportWatchStatus
  );

  return ts.createWatchProgram(host);
};

function buildWatchHooks(sys) {
  let watchedFiles = new Map();

  return Object.assign({}, sys, {
    watchFile(file, callback) {
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
      let watcher = chokidar.watch(dir, { ignored });

      watcher.on('all', (type, path) => {
        path = path.replace(/\\/g, '/'); // Normalize Windows
        if (type === 'add') {
          callback(path);
        } else if (watchedFiles.has(path)) {
          watchedFiles.get(path)(path, type === 'change' ? 1 : 2);
        }
      });

      return watcher;
    }
  });
}
