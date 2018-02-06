/* eslint-env node */
'use strict';

const os = require('os');
const fs = require('fs');
const walkSync = require('walk-sync');
const Command = require('ember-cli/lib/models/command');
const compile = require('../utilities/compile');

module.exports = Command.extend({
  name: 'ts:precompile',
  works: 'insideProject',

  run() {
    let { project } = this;
    let outDir = `${os.tmpdir}/e-c-ts-precompile-${process.pid}`;
    let flags = ['--declaration'];

    return compile({ project, outDir, flags }).then(() => {
      let output = [];
      for (let declSource of walkSync(outDir, { globs: ['addon/**/*.d.ts'] })) {
        let declDest = declSource.replace(/^addon\//, '');
        let compiled = declSource.replace(/\.d\.ts$/, '.js');

        fs.copyFileSync(`${outDir}/${declSource}`, declDest);
        output.push(declDest);

        fs.copyFileSync(`${outDir}/${compiled}`, compiled);
        output.push(compiled);
      }
      fs.writeFileSync(`${project.root}/.ts-precompile-manifest`, JSON.stringify(output));
    });
  },
});
