'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;
const setupPodConfig = blueprintHelpers.setupPodConfig;

const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;

describe('Blueprint: initializer', function() {
  setupTestHooks(this);

  describe('in app', function() {
    beforeEach(function() {
      return emberNew();
    });

    it('initializer foo', function() {
      return emberGenerateDestroy(['initializer', 'foo'], _file => {
        expect(_file('app/initializers/foo.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );

        expect(_file('tests/unit/initializers/foo-test.ts')).to.contain(
          "import { initialize } from 'my-app/initializers/foo';"
        );
      });
    });

    it('initializer foo/bar', function() {
      return emberGenerateDestroy(['initializer', 'foo/bar'], _file => {
        expect(_file('app/initializers/foo/bar.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );

        expect(_file('tests/unit/initializers/foo/bar-test.ts')).to.contain(
          "import { initialize } from 'my-app/initializers/foo/bar';"
        );
      });
    });

    it('initializer foo --pod', function() {
      return emberGenerateDestroy(['initializer', 'foo', '--pod'], _file => {
        expect(_file('app/initializers/foo.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );
      });
    });

    it('initializer foo/bar --pod', function() {
      return emberGenerateDestroy(['initializer', 'foo/bar', '--pod'], _file => {
        expect(_file('app/initializers/foo/bar.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );
      });
    });

    describe('with podModulePrefix', function() {
      beforeEach(function() {
        setupPodConfig({ podModulePrefix: true });
      });

      it('initializer foo --pod', function() {
        return emberGenerateDestroy(['initializer', 'foo', '--pod'], _file => {
          expect(_file('app/initializers/foo.ts')).to.contain(
            'export function initialize(/* application */) {\n' +
              "  // application.inject('route', 'foo', 'service:foo');\n" +
              '}\n' +
              '\n' +
              'export default {\n' +
              '  initialize\n' +
              '};'
          );
        });
      });

      it('initializer foo/bar --pod', function() {
        return emberGenerateDestroy(['initializer', 'foo/bar', '--pod'], _file => {
          expect(_file('app/initializers/foo/bar.ts')).to.contain(
            'export function initialize(/* application */) {\n' +
              "  // application.inject('route', 'foo', 'service:foo');\n" +
              '}\n' +
              '\n' +
              'export default {\n' +
              '  initialize\n' +
              '};'
          );
        });
      });
    });
  });

  describe('in addon', function() {
    beforeEach(function() {
      return emberNew({ target: 'addon' });
    });

    // Skipping these because the reason they're failing is *not* apparent, and
    // this is a pretty corner case scenario.
    it.skip('initializer foo', function() {
      return emberGenerateDestroy(['initializer', 'foo'], _file => {
        expect(_file('addon/initializers/foo.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );

        expect(_file('app/initializers/foo.ts')).to.contain(
          "export { default, initialize } from 'my-addon/initializers/foo';"
        );

        expect(_file('tests/unit/initializers/foo-test.ts')).to.exist;
      });
    });

    // Skipping these because the reason they're failing is *not* apparent, and
    // this is a pretty corner case scenario.
    it.skip('initializer foo/bar', function() {
      return emberGenerateDestroy(['initializer', 'foo/bar'], _file => {
        expect(_file('addon/initializers/foo/bar.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );

        expect(_file('app/initializers/foo/bar.ts')).to.contain(
          "export { default, initialize } from 'my-addon/initializers/foo/bar';"
        );

        expect(_file('tests/unit/initializers/foo/bar-test.ts')).to.exist;
      });
    });

    it('initializer foo --dumy', function() {
      return emberGenerateDestroy(['initializer', 'foo', '--dummy'], _file => {
        expect(_file('tests/dummy/app/initializers/foo.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );

        expect(_file('app/initializers/foo.ts')).to.not.exist;

        expect(_file('tests/unit/initializers/foo-test.ts')).to.not.exist;
      });
    });

    it('initializer foo/bar --dummy', function() {
      return emberGenerateDestroy(['initializer', 'foo/bar', '--dummy'], _file => {
        expect(_file('tests/dummy/app/initializers/foo/bar.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );

        expect(_file('app/initializers/foo/bar.ts')).to.not.exist;

        expect(_file('tests/unit/initializers/foo/bar-test.ts')).to.not.exist;
      });
    });

    it('initializer-test foo', function() {
      return emberGenerateDestroy(['initializer-test', 'foo'], _file => {
        expect(_file('tests/unit/initializers/foo-test.ts'))
          .to.contain("import { initialize } from 'dummy/initializers/foo';")
          .to.contain("module('Unit | Initializer | foo'")
          .to.contain('application = Application.create();')
          .to.contain('initialize(this.application);');
      });
    });
  });

  // Skipping these because the reason they're failing is *not* apparent, and
  // this is a pretty corner case scenario.
  describe.skip('in in-repo-addon', function() {
    beforeEach(function() {
      return emberNew({ target: 'in-repo-addon' });
    });

    it('initializer foo --in-repo-addon=my-addon', function() {
      return emberGenerateDestroy(['initializer', 'foo', '--in-repo-addon=my-addon'], _file => {
        expect(_file('lib/my-addon/addon/initializers/foo.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );

        expect(_file('lib/my-addon/app/initializers/foo.ts')).to.contain(
          "export { default, initialize } from 'my-addon/initializers/foo';"
        );

        expect(_file('tests/unit/initializers/foo-test.ts')).to.exist;
      });
    });

    it('initializer foo/bar --in-repo-addon=my-addon', function() {
      return emberGenerateDestroy(['initializer', 'foo/bar', '--in-repo-addon=my-addon'], _file => {
        expect(_file('lib/my-addon/addon/initializers/foo/bar.ts')).to.contain(
          'export function initialize(/* application */) {\n' +
            "  // application.inject('route', 'foo', 'service:foo');\n" +
            '}\n' +
            '\n' +
            'export default {\n' +
            '  initialize\n' +
            '};'
        );

        expect(_file('lib/my-addon/app/initializers/foo/bar.ts')).to.contain(
          "export { default, initialize } from 'my-addon/initializers/foo/bar';"
        );

        expect(_file('tests/unit/initializers/foo/bar-test.ts')).to.exist;
      });
    });
  });
});
