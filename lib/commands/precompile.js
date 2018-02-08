/* eslint-env node */
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const walkSync = require('walk-sync');
const mkdirp = require('mkdirp');
const SilentError = require('silent-error');
const Command = require('ember-cli/lib/models/command'); // eslint-disable-line node/no-unpublished-require
const compile = require('../utilities/compile');
const debug = require('debug')('ember-cli-typescript:precompile');

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
    let outDir = `${os.tmpdir}/e-c-ts-precompile-${process.pid}`;
    let flags = ['--declaration', '--sourceMap', 'false'];

    return compile({ project, outDir, flags }).then(() => {
      let output = [];
      for (let declSource of walkSync(outDir, { globs: ['**/*.d.ts'] })) {
        if (!this._isAddonFile(declSource)) {
          debug('skipping non-addon file %s', declSource);
          continue;
        }

        let declDest = declSource.replace(/^addon\//, '');
        let compiled = declSource.replace(/\.d\.ts$/, '.js');

        this._copyFile(output, `${outDir}/${declSource}`, declDest);
        this._copyFile(output, `${outDir}/${compiled}`, compiled);
      }

      mkdirp.sync(path.dirname(manifestPath));
      fs.writeFileSync(manifestPath, JSON.stringify(output.reverse()));
    });
  },

  _isAddonFile(source) {
    if (source.indexOf('app') === 0) {
      throw new SilentError(
        "Including .ts files in your addon's `app` directory is unsupported. " +
          'See <link to README or something>.'
      );
    }

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

    fs.copyFileSync(source, dest);
    output.push(dest);
  }
});

module.exports.PRECOMPILE_MANIFEST = PRECOMPILE_MANIFEST;
