'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: ember generate and destroy service', function() {
  setupTestHooks(this);

  it('service foo-bar', function() {
    let args = ['service', 'foo-bar'];

    // pass any additional command line options in the arguments array
    return emberNew().then(() =>
      emberGenerateDestroy(args, file => {
        const generated = file('app/services/foo-bar.ts');
        expect(generated).to.contain('class FooBar extends Service');
        expect(generated).to.contain('interface ServiceRegistry');
        expect(generated).to.contain("'foo-bar': FooBar");
      })
    );
  });
});
