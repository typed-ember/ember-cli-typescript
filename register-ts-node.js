'use strict';

// eslint-disable-next-line node/no-deprecated-api
if (!require.extensions['.ts']) {
  // eslint-disable-next-line node/no-unpublished-require
  require('ts-node').register({
    project: `${__dirname}/ts/tsconfig.json`
  });
}
