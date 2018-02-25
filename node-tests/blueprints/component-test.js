'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: ember generate and destroy component', function() {
  setupTestHooks(this);

  it('component foo-bar', function() {
    let args = ['component', 'foo-bar'];

    // pass any additional command line options in the arguments array
    return emberNew()
      .then(() => emberGenerateDestroy(args, (file) => {
        expect(file('app/components/foo-bar.ts')).to.contain('export default class FooBar extends Component.extend');
    }));
  });

  it('addon component foo-bar', function() {
    let args = ['component', 'foo-bar'];

    return emberNew({ target: 'addon' })
      .then(() => emberGenerateDestroy(args, (file) => {
        expect(file('addon/components/foo-bar.ts'))
          .to.contain('// @ts-ignore: Ignore import of compiled template\nimport layout from \'../templates/components/foo-bar\';\n');
        expect(file('addon/components/foo-bar.ts'))
          .to.contain('layout = layout;');
    }));
  });
});
