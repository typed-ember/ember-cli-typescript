import * as ts from 'typescript';
import fs = require('fs-extra');
import path = require('path');
import walkSync = require('walk-sync');
import mkdirp = require('mkdirp');
import Command = require('ember-cli/lib/models/command');
import Project = require("ember-cli/lib/models/project");

import tmpdir from '../utilities/tmpdir';
import compile from '../utilities/compile';

export const PRECOMPILE_MANIFEST = 'tmp/.ts-precompile-manifest';

declare module "ember-cli/lib/models/blueprint" {
  interface BlueprintOptions {
    manifestPath?: string;
  }
}

export default Command.extend({
  name: 'ts:precompile',
  works: 'insideProject',
  description:
    'Generates JS and declaration files from TypeScript sources in preparation for publishing.',

  availableOptions: [{ name: 'manifest-path', type: String, default: PRECOMPILE_MANIFEST }],

  run(options: any) {
    let manifestPath = options.manifestPath;
    let project: Project = this.project;
    let outDir = `${tmpdir()}/e-c-ts-precompile-${process.pid}`;

    // prettier-ignore
    let flags: ts.CompilerOptions = {
      declaration: true,
      sourceMap: false,
      inlineSourceMap: false,
      inlineSources: false
    };

    return compile({ project, outDir, flags }).then(() => {
      let output: string[] = [];
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
      fs.remove(outDir);
    });
  },

  _shouldCopy(source: string) {
    return this._isAppFile(source) || this._isAddonFile(source);
  },

  _isAppFile(source: string) {
    return source.indexOf('app') === 0;
  },

  _isAddonFile(source: string) {
    return source.indexOf('addon') === 0;
  },

  _copyFile(output: string[], source: string, dest: string) {
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
  },
});
