'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: ember generate and destroy serializer', function() {
  setupTestHooks(this);

  it('serializer foo-bar', function() {
    let args = ['serializer', 'foo-bar'];

    // pass any additional command line options in the arguments array
    return emberNew().then(() =>
      emberGenerateDestroy(args, file => {
        const generated = file('app/serializers/foo-bar.ts');
        expect(generated).to.contain('export default class FooBar extends DS.JSONAPISerializer');
        expect(generated).to.contain('interface SerializerRegistry');
        expect(generated).to.contain("'foo-bar': FooBar");
      })
    );
  });
});
