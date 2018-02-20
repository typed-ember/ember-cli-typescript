/* eslint-env node */
'use strict';

const tmpdir = require('../utilities/tmpdir');
const fs = require('fs');
const path = require('path');
const walkSync = require('walk-sync');
const mkdirp = require('mkdirp');
const Command = require('ember-cli/lib/models/command'); // eslint-disable-line node/no-unpublished-require
const compile = require('../utilities/compile');

const PRECOMPILE_MANIFEST = 'tmp/.ts-precompile-manifest';

module.exports = Command.extend({
  name: 'ts:precompile',
  works: 'insideProject',
  description:
    'Generates JS and declaration files from TypeScript sources in preparation for publishing.',

  availableOptions: [{ name: 'manifest-path', type: String, default: PRECOMPILE_MANIFEST }],

  run(options) {
    let manifestPath = options.manifestPath;
    let project = this.project;
    let outDir = `${tmpdir()}/e-c-ts-precompile-${process.pid}`;
    let flags = ['--declaration', '--sourceMap', 'false'];

    return compile({ project, outDir, flags }).then(() => {
      let output = [];
      for (let declSource of walkSync(outDir, { globs: ['**/*.d.ts'] })) {
        if (this._shouldCopy(declSource)) {
          let compiled = declSource.replace(/\.d\.ts$/, '.js');
          this._copyFile(output, `${outDir}/${compiled}`, compiled);

          // We can only do anything meaningful with declarations for files in addon/
          if (this._isAddonFile(declSource)) {
            let declDest = declSource.replace(/^addon\//, '');
            this._copyFile(output, `${outDir}/${declSource}`, declDest);
          }
        }
      }

      mkdirp.sync(path.dirname(manifestPath));
      fs.writeFileSync(manifestPath, JSON.stringify(output.reverse()));
    });
  },

  _shouldCopy(source) {
    return this._isAppFile(source) || this._isAddonFile(source);
  },

  _isAppFile(source) {
    return source.indexOf('app') === 0;
  },

  _isAddonFile(source) {
    return source.indexOf('addon') === 0;
  },

  _copyFile(output, source, dest) {
    let segments = dest.split(/\/|\\/);

    // Make (and record the making of) any missing directories
    for (let i = 1; i < segments.length; i++) {
      let dir = segments.slice(0, i).join('/');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        output.push(`${dir}/`);
      }
    }

    fs.writeFileSync(dest, fs.readFileSync(source));
    output.push(dest);
  }
});

module.exports.PRECOMPILE_MANIFEST = PRECOMPILE_MANIFEST;
