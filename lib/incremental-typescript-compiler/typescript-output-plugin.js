'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs-extra');
const path = require('path');
const symlinkOrCopy = require('symlink-or-copy');

/*
 * We don't insert the output of the TypeScript compiler directly into
 * the broccoli pipeline, as that would cause double rebuilds (once for
 * the change to the original .ts file, then another for the change to
 * the resulting .js file). Instead, we use this Broccoli plugin to
 * essentially provide a lightweight 'view' into the compiler output,
 * blocking the rebuild triggered by the original .ts file until the
 * corresponding .js file is ready.
 */
module.exports = class TypescriptOutput extends Plugin {
  constructor(compiler, paths) {
    // Ensure we always block on the generated type processing before building
    super([compiler.treeForGeneratedTypes()]);

    this.compiler = compiler;
    this.paths = paths;
  }

  build() {
    this.compiler.state.broccoliDidStart();

    return this.compiler
      .buildPromise()
      .then(() => {
        for (let relativeSrc of Object.keys(this.paths)) {
          let src = `${this.compiler.outDir()}/${relativeSrc}`;
          let dest = `${this.outputPath}/${this.paths[relativeSrc]}`;
          if (fs.existsSync(src)) {
            let dir = path.dirname(dest);
            if (dir !== '.') {
              fs.mkdirsSync(dir);
            }

            symlinkOrCopy.sync(src, dest);
          } else {
            fs.mkdirsSync(dest);
          }
        }
      })
      .finally(() => this.compiler.state.broccoliDidEnd());
  }
};
