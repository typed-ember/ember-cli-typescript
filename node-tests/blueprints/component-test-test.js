'use strict';

const fs = require('fs');

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;
const modifyPackages = blueprintHelpers.modifyPackages;

const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;

const generateFakePackageManifest = require('../helpers/generate-fake-package-manifest');
const fixture = require('../helpers/fixture');

describe('Blueprint: component-test', function() {
  setupTestHooks(this);

  describe('in app', function() {
    beforeEach(function() {
      return emberNew().then(() => generateFakePackageManifest('ember-cli-qunit', '4.1.0'));
    });

    it('component-test x-foo', function() {
      return emberGenerateDestroy(['component-test', 'x-foo'], _file => {
        expect(_file('tests/integration/components/x-foo-test.ts')).to.equal(
          fixture('component-test/default.ts')
        );
      });
    });

    it('component-test x-foo --unit', function() {
      return emberGenerateDestroy(['component-test', 'x-foo', '--unit'], _file => {
        expect(_file('tests/unit/components/x-foo-test.ts')).to.equal(
          fixture('component-test/unit.ts')
        );
      });
    });

    describe('with --pod', function() {
      it('component-test x-foo', function() {
        return emberGenerateDestroy(['--pod', 'component-test', 'x-foo'], _file => {
          expect(_file('tests/integration/components/x-foo/component-test.ts')).to.equal(
            fixture('component-test/default.ts')
          );
        });
      });
    });

    describe('with ember-cli-qunit@4.2.0', function() {
      beforeEach(function() {
        generateFakePackageManifest('ember-cli-qunit', '4.2.0');
      });

      it('component-test x-foo', function() {
        return emberGenerateDestroy(['component-test', 'x-foo'], _file => {
          expect(_file('tests/integration/components/x-foo-test.ts')).to.equal(
            fixture('component-test/rfc232.ts')
          );
        });
      });

      it('component-test x-foo --unit', function() {
        return emberGenerateDestroy(['component-test', 'x-foo', '--unit'], _file => {
          expect(_file('tests/unit/components/x-foo-test.ts')).to.equal(
            fixture('component-test/rfc232-unit.ts')
          );
        });
      });
    });

    describe('with ember-cli-mocha@0.11.0', function() {
      beforeEach(function() {
        modifyPackages([
          { name: 'ember-cli-qunit', delete: true },
          { name: 'ember-cli-mocha', dev: true },
        ]);
        generateFakePackageManifest('ember-cli-mocha', '0.11.0');
      });

      it('component-test x-foo', function() {
        return emberGenerateDestroy(['component-test', 'x-foo'], _file => {
          expect(_file('tests/integration/components/x-foo-test.ts')).to.equal(
            fixture('component-test/mocha.ts')
          );
        });
      });

      it('component-test x-foo --unit', function() {
        return emberGenerateDestroy(['component-test', 'x-foo', '--unit'], _file => {
          expect(_file('tests/unit/components/x-foo-test.ts')).to.equal(
            fixture('component-test/mocha-unit.ts')
          );
        });
      });
    });

    describe('with ember-cli-mocha@0.12.0', function() {
      beforeEach(function() {
        modifyPackages([
          { name: 'ember-cli-qunit', delete: true },
          { name: 'ember-cli-mocha', dev: true },
        ]);
        generateFakePackageManifest('ember-cli-mocha', '0.12.0');
      });

      it('component-test x-foo', function() {
        return emberGenerateDestroy(['component-test', 'x-foo'], _file => {
          expect(_file('tests/integration/components/x-foo-test.ts')).to.equal(
            fixture('component-test/mocha-0.12.ts')
          );
        });
      });

      it('component-test x-foo --unit', function() {
        return emberGenerateDestroy(['component-test', 'x-foo', '--unit'], _file => {
          expect(_file('tests/unit/components/x-foo-test.ts')).to.equal(
            fixture('component-test/mocha-0.12-unit.ts')
          );
        });
      });
    });
  });

  describe('in addon', function() {
    beforeEach(function() {
      return emberNew({ target: 'addon' }).then(() =>
        generateFakePackageManifest('ember-cli-qunit', '4.1.0')
      );
    });

    it('component-test x-foo', function() {
      return emberGenerateDestroy(['component-test', 'x-foo'], _file => {
        expect(_file('tests/integration/components/x-foo-test.ts')).to.equal(
          fixture('component-test/default.ts')
        );

        expect(_file('app/component-test/x-foo.ts')).to.not.exist;
      });
    });

    it('component-test x-foo --unit', function() {
      return emberGenerateDestroy(['component-test', 'x-foo', '--unit'], _file => {
        expect(_file('tests/unit/components/x-foo-test.ts')).to.equal(
          fixture('component-test/unit.ts')
        );

        expect(_file('app/component-test/x-foo.ts')).to.not.exist;
      });
    });

    it('component-test x-foo --dummy', function() {
      return emberGenerateDestroy(['component-test', 'x-foo', '--dummy'], _file => {
        expect(_file('tests/integration/components/x-foo-test.ts')).to.equal(
          fixture('component-test/default.ts')
        );

        expect(_file('app/component-test/x-foo.ts')).to.not.exist;
      });
    });
  });

  describe('in in-repo-addon', function() {
    beforeEach(function() {
      return emberNew({ target: 'in-repo-addon' }).then(() =>
        generateFakePackageManifest('ember-cli-qunit', '4.1.0')
      );
    });

    it('component-test x-foo --in-repo-addon=my-addon', function() {
      return emberGenerateDestroy(
        ['component-test', 'x-foo', '--in-repo-addon=my-addon'],
        _file => {
          expect(_file('tests/integration/components/x-foo-test.ts')).to.equal(
            fixture('component-test/default.ts')
          );
        }
      );
    });

    it('component-test x-foo --in-repo-addon=my-addon --unit', function() {
      return emberGenerateDestroy(
        ['component-test', 'x-foo', '--in-repo-addon=my-addon', '--unit'],
        _file => {
          expect(_file('tests/unit/components/x-foo-test.ts')).to.equal(
            fixture('component-test/unit.ts')
          );
        }
      );
    });
  });
});
