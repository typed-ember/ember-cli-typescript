'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerate = blueprintHelpers.emberGenerate;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;
const modifyPackages = blueprintHelpers.modifyPackages;

const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;

const SilentError = require('silent-error');

const generateFakePackageManifest = require('../helpers/generate-fake-package-manifest');
const fixture = require('../helpers/fixture');

describe('Acceptance: generate and destroy serializer blueprints', function() {
  setupTestHooks(this);

  beforeEach(function() {
    return emberNew().then(() => generateFakePackageManifest('ember-cli-qunit', '4.1.0'));
  });

  it('serializer', function() {
    let args = ['serializer', 'foo'];

    return emberGenerateDestroy(args, _file => {
      expect(_file('app/serializers/foo.ts'))
        .to.contain("import DS from 'ember-data';")
        .to.contain('export default class Foo extends DS.JSONAPISerializer.extend(');

      expect(_file('tests/unit/serializers/foo-test.ts')).to.equal(
        fixture('serializer-test/foo-default.ts')
      );
    });
  });

  // The index and body are identical as regards the import; why it's not
  // working here is *not* clear.
  it.skip('serializer extends application serializer if it exists', function() {
    let args = ['serializer', 'foo'];

    return emberGenerate(['serializer', 'application']).then(() =>
      emberGenerateDestroy(args, _file => {
        expect(_file('app/serializers/foo.ts'))
          .to.contain("import ApplicationSerializer from './application';")
          .to.contain('export default class Foo extends ApplicationSerializer.extend({');

        expect(_file('tests/unit/serializers/foo-test.ts')).to.equal(
          fixture('serializer-test/foo-default.ts')
        );
      })
    );
  });

  it('serializer with --base-class', function() {
    let args = ['serializer', 'foo', '--base-class=bar'];

    return emberGenerateDestroy(args, _file => {
      expect(_file('app/serializers/foo.ts'))
        .to.contain("import BarSerializer from './bar';")
        .to.contain('export default class Foo extends BarSerializer.extend({');

      expect(_file('tests/unit/serializers/foo-test.ts')).to.equal(
        fixture('serializer-test/foo-default.ts')
      );
    });
  });

  it('serializer throws when --base-class is same as name', function() {
    let args = ['serializer', 'foo', '--base-class=foo'];

    return expect(emberGenerate(args)).to.be.rejectedWith(
      SilentError,
      /Serializers cannot extend from themself/
    );
  });

  it('serializer when is named "application"', function() {
    let args = ['serializer', 'application'];

    return emberGenerateDestroy(args, _file => {
      expect(_file('app/serializers/application.ts'))
        .to.contain("import DS from 'ember-data';")
        .to.contain('export default class Application extends DS.JSONAPISerializer.extend({');

      expect(_file('tests/unit/serializers/application-test.ts')).to.equal(
        fixture('serializer-test/application-default.ts')
      );
    });
  });

  it('serializer-test', function() {
    let args = ['serializer-test', 'foo'];

    return emberGenerateDestroy(args, _file => {
      expect(_file('tests/unit/serializers/foo-test.ts')).to.equal(
        fixture('serializer-test/foo-default.ts')
      );
    });
  });

  describe('serializer-test with ember-cli-qunit@4.2.0', function() {
    beforeEach(function() {
      generateFakePackageManifest('ember-cli-qunit', '4.2.0');
    });

    it('serializer-test-test foo', function() {
      return emberGenerateDestroy(['serializer-test', 'foo'], _file => {
        expect(_file('tests/unit/serializers/foo-test.ts')).to.equal(
          fixture('serializer-test/rfc232.ts')
        );
      });
    });
  });

  describe('with ember-cli-mocha v0.12+', function() {
    beforeEach(function() {
      modifyPackages([
        { name: 'ember-cli-qunit', delete: true },
        { name: 'ember-cli-mocha', dev: true },
      ]);
      generateFakePackageManifest('ember-cli-mocha', '0.12.0');
    });

    it('serializer-test for mocha v0.12+', function() {
      let args = ['serializer-test', 'foo'];

      return emberGenerateDestroy(args, _file => {
        expect(_file('tests/unit/serializers/foo-test.ts')).to.equal(
          fixture('serializer-test/foo-mocha-0.12.ts')
        );
      });
    });
  });
});
