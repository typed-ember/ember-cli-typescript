'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: ember generate and destroy template', function() {
  setupTestHooks(this);

  it('template foo', function() {
    let args = ['template', 'foo'];

    // pass any additional command line options in the arguments array
    return emberNew()
      .then(() => emberGenerateDestroy(args, (file) => {
        expect(file('app/templates/foo.hbs')).to.equal('');
    }));
  });
});
