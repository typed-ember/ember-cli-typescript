'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: TypeScript blueprints', function() {
  setupTestHooks(this);

  it('uses blueprints from ember-cli-typescript-blueprints', function() {
    let args = ['helper', 'foo'];

    return emberNew()
      .then(() => emberGenerateDestroy(args, (file) => {
        const generated = file('app/helpers/foo.ts');
        expect(generated).to.contain('export function foo');
        expect(generated).to.contain('export default helper(foo)');
    }));
  });
});
