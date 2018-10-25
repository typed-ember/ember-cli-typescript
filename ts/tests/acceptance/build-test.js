'use strict';

const co = require('co');
const SkeletonApp = require('../helpers/skeleton-app');
const chai = require('ember-cli-blueprint-test-helpers/chai');
const esprima = require('esprima');
const expect = chai.expect;

describe('Acceptance: build', function() {
  this.timeout(30 * 1000);

  beforeEach(function() {
    this.app = new SkeletonApp();
  });

  afterEach(function() {
    this.app.teardown();
  });

  it('builds and rebuilds files', co.wrap(function*() {
    this.app.writeFile('app/app.ts', `
      export function add(a: number, b: number) {
        return a + b;
      }
    `);

    let server = this.app.serve();

    yield server.waitForBuild();

    expectModuleBody(this.app, 'skeleton-app/app', `
      _exports.add = add;
      function add(a, b) {
        return a + b;
      }
    `);

    this.app.writeFile('app/app.ts', `
      export const foo: string = 'hello';
    `);

    yield server.waitForBuild();

    expectModuleBody(this.app, 'skeleton-app/app', `
      _exports.foo = void 0;
      var foo = 'hello';
      _exports.foo = foo;
    `);
  }));

  it('fails the build when noEmitOnError is set and an error is emitted', co.wrap(function*() {
    this.app.writeFile('app/app.ts', `import { foo } from 'nonexistent';`);

    yield expect(this.app.build()).to.be.rejectedWith(`Cannot find module 'nonexistent'`);
  }));

  it('serves a type error page when the build has failed', co.wrap(function*() {
    this.app.writeFile('app/index.html', 'plain index');
    this.app.writeFile('app/app.ts', `import { foo } from 'nonexistent';`);

    let server = this.app.serve();
    let output = yield server.waitForOutput('Typechecking failed');
    let response = yield server.request('/');

    expect(output).to.include(`Cannot find module 'nonexistent'`);
    expect(response.body).to.include(`Cannot find module 'nonexistent'`);
  }));
});

function extractModuleBody(script, moduleName) {
  let parsed = esprima.parseScript(script);
  let definition = parsed.body
    .filter(stmt => stmt.type === 'ExpressionStatement')
    .map(stmt => stmt.expression)
    .find(expr =>
        expr.type === 'CallExpression' &&
        expr.callee.type === 'Identifier' &&
        expr.callee.name === 'define' &&
        expr.arguments &&
        expr.arguments[0] &&
        expr.arguments[0].type === 'Literal' &&
        expr.arguments[0].value === moduleName);

  let moduleDef = definition.arguments[2].body;

  // Strip `'use strict'`
  moduleDef.body.shift();

  // Strip `__esModule` definition
  moduleDef.body.shift();

  return moduleDef;
}

function expectModuleBody(app, name, body) {
  let src = app.readFile('dist/assets/skeleton-app.js');
  let actual = extractModuleBody(src, name);
  let expected = esprima.parseScript(body);
  expect(actual.body).to.deep.equal(expected.body);
}
