'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;
const modifyPackages = blueprintHelpers.modifyPackages;

const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;

const generateFakePackageManifest = require('../helpers/generate-fake-package-manifest');
const fixture = require('../helpers/fixture');

describe('Blueprint: helper-test', function() {
  setupTestHooks(this);

  describe('in app', function() {
    beforeEach(function() {
      return emberNew();
    });

    describe('with ember-cli-qunit<4.2.0', function() {
      beforeEach(function() {
        generateFakePackageManifest('ember-cli-qunit', '4.1.1');
      });

      it('helper-test foo/bar-baz', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz'], _file => {
          expect(_file('tests/integration/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/integration.ts'));
        });
      });

      it('helper-test foo/bar-baz --integration', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz', '--integration'], _file => {
          expect(_file('tests/integration/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/integration.ts'));
        });
      });
    });

    describe('with ember-cli-qunit@4.2.0', function() {
      beforeEach(function() {
        generateFakePackageManifest('ember-cli-qunit', '4.2.0');
      });

      it('helper-test foo/bar-baz', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz'], _file => {
          expect(_file('tests/integration/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/rfc232.ts'));
        });
      });

      it('helper-test foo/bar-baz --unit', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz', '--unit'], _file => {
          expect(_file('tests/unit/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/rfc232-unit.ts'));
        });
      });
    });

    describe('with ember-cli-mocha@0.11.0', function() {
      beforeEach(function() {
        modifyPackages([
          { name: 'ember-cli-qunit', delete: true },
          { name: 'ember-cli-mocha', dev: true }
        ]);
        generateFakePackageManifest('ember-cli-mocha', '0.11.0');
      });

      it('helper-test foo/bar-baz --integration', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz'], _file => {
          expect(_file('tests/integration/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/mocha.ts'));
        });
      });

      it('helper-test foo/bar-baz --unit', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz', '--unit'], _file => {
          expect(_file('tests/unit/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/mocha-unit.ts'));
        });
      });
    });

    describe('with ember-cli-mocha@0.12.0', function() {
      beforeEach(function() {
        modifyPackages([
          { name: 'ember-cli-qunit', delete: true },
          { name: 'ember-cli-mocha', dev: true }
        ]);
        generateFakePackageManifest('ember-cli-mocha', '0.12.0');
      });

      it('helper-test foo/bar-baz for mocha', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz'], _file => {
          expect(_file('tests/integration/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/mocha-0.12.ts'));
        });
      });

      it('helper-test foo/bar-baz for mocha --unit', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz', '--unit'], _file => {
          expect(_file('tests/unit/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/mocha-0.12-unit.ts'));
        });
      });
    });
  });

  describe('in addon', function() {
    beforeEach(function() {
      return emberNew({ target: 'addon' });
    });

    describe('with ember-cli-qunit<4.2.0', function() {
      beforeEach(function() {
        generateFakePackageManifest('ember-cli-qunit', '4.1.1');
      });

      it('helper-test foo/bar-baz', function() {
        return emberGenerateDestroy(['helper-test', 'foo/bar-baz'], _file => {
          expect(_file('tests/integration/helpers/foo/bar-baz-test.ts'))
            .to.equal(fixture('helper-test/integration.ts'));
        });
      });
    });
  });
});
