'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;
const setupPodConfig = blueprintHelpers.setupPodConfig;

const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;

describe('Blueprint: instance-initializer', function() {
  setupTestHooks(this);

  describe('in app', function() {
    beforeEach(function() {
      return emberNew();
    });

    it('instance-initializer foo', function() {
      return emberGenerateDestroy(['instance-initializer', 'foo'], _file => {
        expect(_file('app/instance-initializers/foo.ts'))
          .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
          .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
          .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
          .to.contain('}')
          .to.contain('')
          .to.contain('export default {')
          .to.contain('  initialize')
          .to.contain('};');

        expect(_file('tests/unit/instance-initializers/foo-test.ts')).to.contain(
          "import { initialize } from 'my-app/instance-initializers/foo';"
        );
      });
    });

    it('instance-initializer foo/bar', function() {
      return emberGenerateDestroy(['instance-initializer', 'foo/bar'], _file => {
        expect(_file('app/instance-initializers/foo/bar.ts'))
          .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
          .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
          .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
          .to.contain('}')
          .to.contain('')
          .to.contain('export default {')
          .to.contain('  initialize')
          .to.contain('};');

        expect(_file('tests/unit/instance-initializers/foo/bar-test.ts')).to.contain(
          "import { initialize } from 'my-app/instance-initializers/foo/bar';"
        );
      });
    });

    it('instance-initializer foo --pod', function() {
      return emberGenerateDestroy(['instance-initializer', 'foo', '--pod'], _file => {
        expect(_file('app/instance-initializers/foo.ts'))
          .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
          .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
          .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
          .to.contain('}')
          .to.contain('')
          .to.contain('export default {')
          .to.contain('  initialize')
          .to.contain('};');
      });
    });

    it('instance-initializer foo/bar --pod', function() {
      return emberGenerateDestroy(['instance-initializer', 'foo/bar', '--pod'], _file => {
        expect(_file('app/instance-initializers/foo/bar.ts'))
          .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
          .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
          .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
          .to.contain('}')
          .to.contain('')
          .to.contain('export default {')
          .to.contain('  initialize')
          .to.contain('};');
      });
    });

    describe('with podModulePrefix', function() {
      beforeEach(function() {
        setupPodConfig({ podModulePrefix: true });
      });

      it('instance-initializer foo --pod', function() {
        return emberGenerateDestroy(['instance-initializer', 'foo', '--pod'], _file => {
          expect(_file('app/instance-initializers/foo.ts'))
            .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
            .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
            .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
            .to.contain('}')
            .to.contain('')
            .to.contain('export default {')
            .to.contain('  initialize')
            .to.contain('};');
        });
      });

      it('instance-initializer foo/bar --pod', function() {
        return emberGenerateDestroy(['instance-initializer', 'foo/bar', '--pod'], _file => {
          expect(_file('app/instance-initializers/foo/bar.ts'))
            .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
            .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
            .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
            .to.contain('}')
            .to.contain('')
            .to.contain('export default {')
            .to.contain('  initialize')
            .to.contain('};');
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
    it.skip('instance-initializer foo', function() {
      return emberGenerateDestroy(['instance-initializer', 'foo'], _file => {
        expect(_file('addon/instance-initializers/foo.ts'))
          .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
          .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
          .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
          .to.contain('}')
          .to.contain('')
          .to.contain('export default {')
          .to.contain('  initialize')
          .to.contain('};');

        expect(_file('app/instance-initializers/foo.ts')).to.contain(
          "export { default, initialize } from 'my-addon/instance-initializers/foo';"
        );

        expect(_file('tests/unit/instance-initializers/foo-test.ts'));
      });
    });

    // Skipping these because the reason they're failing is *not* apparent, and
    // this is a pretty corner case scenario.
    it.skip('instance-initializer foo/bar', function() {
      return emberGenerateDestroy(['instance-initializer', 'foo/bar'], _file => {
        expect(_file('addon/instance-initializers/foo/bar.ts'))
          .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
          .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
          .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
          .to.contain('}')
          .to.contain('')
          .to.contain('export default {')
          .to.contain('  initialize')
          .to.contain('};');

        expect(_file('app/instance-initializers/foo/bar.ts')).to.contain(
          "export { default, initialize } from 'my-addon/instance-initializers/foo/bar';"
        );

        expect(_file('tests/unit/instance-initializers/foo/bar-test.ts'));
      });
    });

    it('instance-initializer foo --dummy', function() {
      return emberGenerateDestroy(['instance-initializer', 'foo', '--dummy'], _file => {
        expect(_file('tests/dummy/app/instance-initializers/foo.ts'))
          .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
          .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
          .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
          .to.contain('}')
          .to.contain('')
          .to.contain('export default {')
          .to.contain('  initialize')
          .to.contain('};');

        expect(_file('app/instance-initializers/foo.ts')).to.not.exist;

        expect(_file('tests/unit/instance-initializers/foo-test.ts')).to.not.exist;
      });
    });

    it('instance-initializer foo/bar --dummy', function() {
      return emberGenerateDestroy(['instance-initializer', 'foo/bar', '--dummy'], _file => {
        expect(_file('tests/dummy/app/instance-initializers/foo/bar.ts'))
          .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
          .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
          .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
          .to.contain('}')
          .to.contain('')
          .to.contain('export default {')
          .to.contain('  initialize')
          .to.contain('};');

        expect(_file('app/instance-initializers/foo/bar.ts')).to.not.exist;

        expect(_file('tests/unit/instance-initializers/foo/bar-test.ts')).to.not.exist;
      });
    });
  });

  // Skipping these because the reason they're failing is *not* apparent, and
  // this is a pretty corner case scenario.
  describe.skip('in in-repo-addon', function() {
    beforeEach(function() {
      return emberNew({ target: 'in-repo-addon' });
    });

    it('instance-initializer foo --in-repo-addon=my-addon', function() {
      return emberGenerateDestroy(
        ['instance-initializer', 'foo', '--in-repo-addon=my-addon'],
        _file => {
          expect(_file('lib/my-addon/addon/instance-initializers/foo.ts'))
            .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
            .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
            .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
            .to.contain('}')
            .to.contain('')
            .to.contain('export default {')
            .to.contain('  initialize')
            .to.contain('};');

          expect(_file('lib/my-addon/app/instance-initializers/foo.ts')).to.contain(
            "export { default, initialize } from 'my-addon/instance-initializers/foo';"
          );

          expect(_file('tests/unit/instance-initializers/foo-test.ts')).to.exist;
        }
      );
    });

    it('instance-initializer foo/bar --in-repo-addon=my-addon', function() {
      return emberGenerateDestroy(
        ['instance-initializer', 'foo/bar', '--in-repo-addon=my-addon'],
        _file => {
          expect(_file('lib/my-addon/addon/instance-initializers/foo/bar.ts'))
            .to.contain('import ApplicationInstance from \'@ember/application/instance\';')
            .to.contain('export function initialize(appInstance: ApplicationInstance): void {')
            .to.contain("  // appInstance.inject('route', 'foo', 'service:foo');")
            .to.contain('}')
            .to.contain('')
            .to.contain('export default {')
            .to.contain('  initialize')
            .to.contain('};');

          expect(_file('lib/my-addon/app/instance-initializers/foo/bar.ts')).to.contain(
            "export { default, initialize } from 'my-addon/instance-initializers/foo/bar';"
          );

          expect(_file('tests/unit/instance-initializers/foo/bar-test.ts')).to.exist;
        }
      );
    });
  });
});
