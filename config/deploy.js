/* eslint-env node */
'use strict';

module.exports = function(deployTarget) {
  let ENV = {
    build: {},
    git: {},
    // include other plugin configuration that applies to all deploy targets here
  };

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
    // configure other plugins for development deploy target here
  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    // configure other plugins for staging deploy target here
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    // configure other plugins for production deploy target here
  }

  const { GITHUB_ACTOR, GITHUB_TOKEN } = process.env;
  if (GITHUB_ACTOR && GITHUB_TOKEN) {
    ENV.git.repo = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/typed-ember/ember-cli-typescript.git`;
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
