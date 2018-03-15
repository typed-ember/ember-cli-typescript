/* eslint-env node */
'use strict';

const mkdirp = require('mkdirp');
const ts = require('typescript');
const sane = require('sane');
const fs = require('fs-extra');

module.exports = function compile(project, tsOptions, callbacks) {
  // Ensure the output directory is created even if no files are generated
  mkdirp.sync(tsOptions.outDir);

  let fullOptions = Object.assign({
    rootDir: project.root,
    allowJs: false,
    noEmit: false
  }, tsOptions);

  let watchedFiles = new Map();
  let sys = Object.assign({}, ts.sys, {
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

      let watcher = new sane.WatchmanWatcher(dir, { ignored: 'tmp/**' });

      let invoke = (type, path) => {
        let fullPath = `${dir}/${path}`;
        if (type === 'add') {
          callback(path);
        } else if (watchedFiles.has(fullPath)) {
          watchedFiles.get(fullPath)(fullPath, type === 'change' ? 1 : 2);
        }
      };

      watcher.on('all', invoke);

      return watcher;
    }
  });

  let configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
  let createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;
  let host = ts.createWatchCompilerHost(configPath, fullOptions, sys, createProgram, callbacks.reportDiagnostic, callbacks.reportWatchStatus);

  return ts.createWatchProgram(host);
};
