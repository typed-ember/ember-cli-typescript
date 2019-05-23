'use strict';

// eslint-disable-next-line node/no-deprecated-api
if (!require.extensions['.ts']) {
  let options = { project: `${__dirname}/ts/tsconfig.json` };

  // If we're operating in the context of another project, which might happen
  // if someone has installed ember-cli-typescript from git, only perform
  // transpilation. In this case, we also overwrite the default ignore glob
  // (which ignores everything in `node_modules`) to instead ignore anything
  // that doesn't end with `.ts`.
  if (process.cwd() !== __dirname) {
    options.ignore = [/\.(?!ts$)\w+$/];
    options.transpileOnly = true;
  }

  // eslint-disable-next-line node/no-unpublished-require
  require('ts-node').register(options);
}
