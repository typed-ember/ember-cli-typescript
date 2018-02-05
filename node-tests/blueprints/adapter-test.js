'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: ember generate and destroy adapter', function() {
  setupTestHooks(this);

  it('adapter foo-bar', function() {
    let args = ['adapter', 'foo-bar'];

    // pass any additional command line options in the arguments array
    return emberNew().then(() =>
      emberGenerateDestroy(args, file => {
        const generated = file('app/adapters/foo-bar.ts');
        expect(generated).to.contain('export default class FooBar extends DS.JSONAPIAdapter');
        expect(generated).to.contain('interface AdapterRegistry');
        expect(generated).to.contain("'foo-bar': FooBar");
      })
    );
  });
});
