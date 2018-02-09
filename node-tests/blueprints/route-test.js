'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: ember generate and destroy route', function() {
  setupTestHooks(this);

  it('route just-like-home', function() {
    let args = ['route', 'just-like-home'];

    // pass any additional command line options in the arguments array
    return emberNew().then(() =>
      emberGenerateDestroy(args, file => {
        const generated = file('app/routes/just-like-home.ts');
        expect(generated).to.contain('class JustLikeHome extends Route');
      })
    );
  });
});
