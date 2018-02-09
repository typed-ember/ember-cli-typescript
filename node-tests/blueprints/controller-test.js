'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: ember generate and destroy controller', function() {
  setupTestHooks(this);

  it('controller foo', function() {
    let args = ['controller', 'foo-bar'];

    // pass any additional command line options in the arguments array
    return emberNew()
      .then(() => emberGenerateDestroy(args, (file) => {
        const generated = file('app/controllers/foo-bar.ts');
        expect(generated).to.contain('class FooBar extends Controller');
        expect(generated).to.contain('interface Registry');
        expect(generated).to.contain("'foo-bar': FooBar");
    }));
  });
});
