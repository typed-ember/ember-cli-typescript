'use strict';

const fs = require('fs-extra');
const co = require('co');
const SkeletonApp = require('../helpers/skeleton-app');
const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;
const stripIndent = require('common-tags').stripIndent;
const walkSync = require('walk-sync');

describe('Acceptance: type generation', function() {
  this.timeout(30 * 1000);

  beforeEach(function() {
    this.app = new SkeletonApp();
    setupTypeGenerator(this.app);
  });

  afterEach(function() {
    this.app.teardown();
  });

  // it('creates a types/generated directory and populates it before typechecking', co.wrap(function*() {
  //   this.app.writeFile('app/foo.test', 'hello');
  //   this.app.writeFile('app/app.ts', stripIndent`
  //     import { content as foo } from './foo';
  //     console.log(foo);
  //   `);

  //   yield this.app.build();

  //   expect(this.app.readFile('types/generated/app/foo.d.ts')).to.equal(stripIndent`
  //     export declare const content: "hello";
  //   `);

  //   this.app.removeFile('app/foo.test');

  //   yield expect(this.app.build()).to.be.rejectedWith(`Cannot find module './foo'`);

  //   expect(walkSync(`${this.app.root}/types/generated`, { directories: false })).to.deep.equal([]);
  // }));

  it('updates generated types on rebuild', co.wrap(function*() {
    let server = this.app.serve();
    yield server.waitForBuild();
    expect(fs.existsSync(`${this.app.root}/types/generated/app/foo.d.ts`)).to.be.false;

    this.app.writeFile('app/foo.test', 'hello');
    yield server.waitForBuild();
    expect(this.app.readFile('types/generated/app/foo.d.ts')).to.equal(stripIndent`
      export declare const content: "hello";
    `);

    this.app.writeFile('app/foo.test', 'goodbye');
    yield server.waitForBuild();
    expect(this.app.readFile('types/generated/app/foo.d.ts')).to.equal(stripIndent`
      export declare const content: "goodbye";
    `);

    this.app.removeFile('app/foo.test');
    yield server.waitForBuild();
    expect(fs.existsSync(`${this.app.root}/types/generated/app/foo.d.ts`)).to.be.false;
  }));
});

function setupTypeGenerator(app) {
  app.updatePackageJSON((pkg) => {
    pkg['ember-addon'].paths.push('lib/test-type-generator');
  });

  app.writeFile('lib/test-type-generator/package.json', JSON.stringify({
    name: 'test-type-generator',
    keywords: ['ember-addon']
  }));

  app.writeFile('lib/test-type-generator/index.js', stripIndent`
    'use strict';
    const stew = require('broccoli-stew');

    module.exports = {
      name: 'test-type-generator',
      setupTypeGeneratorRegistry(type, registry) {
        registry.add({
          name: 'test-type-generator',
          toTree(type, tree) {
            tree = stew.find(tree, '**/*.test');
            tree = stew.rename(tree, '.test', '.d.ts');
            tree = stew.map(tree, (content) => {
              return 'export declare const content: ' + JSON.stringify(content) + ';';
            });
            return tree;
          }
        });
      }
    };
  `);
}
