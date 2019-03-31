import co from 'co';
import SkeletonApp from '../helpers/skeleton-app';
import chai from 'ember-cli-blueprint-test-helpers/chai';
import * as esprima from 'esprima';
import psList from 'ps-list';
import { differenceBy as arrDifferenceBy } from 'lodash';
import {
  ExpressionStatement,
  Statement,
  ModuleDeclaration,
  CallExpression,
  Expression,
  ClassExpression,
  Literal,
} from 'estree';

const { expect } = chai;

describe('Acceptance: build', function() {
  this.timeout(30 * 1000);
  let app: SkeletonApp;
  beforeEach(function() {
    app = new SkeletonApp();
  });

  afterEach(function() {
    app.teardown();
  });

  let processesBefore: psList.ProcessDescriptor[];
  let processesAfter: psList.ProcessDescriptor[];

  function logLingeringProcesses() {
    const lingeringProcesses = arrDifferenceBy(
      processesBefore.map(p => p.pid),
      processesAfter.map(p => p.pid),
      'id'
    );
    console.log('Lingering Processes: ', JSON.stringify(lingeringProcesses, null, '  '));
  }

  before(async function() {
    processesBefore = await psList();
  });
  after(async function() {
    processesAfter = await psList();
    logLingeringProcesses();
  });

  it(
    'builds and rebuilds files',
    co.wrap(function*() {
      app.writeFile(
        'app/app.ts',
        `
      export function add(a: number, b: number) {
        return a + b;
      }
    `
      );

      let server = app.serve();

      yield server.waitForBuild();

      expectModuleBody(
        app,
        'skeleton-app/app',
        `
      _exports.add = add;
      function add(a, b) {
        return a + b;
      }
    `
      );

      app.writeFile(
        'app/app.ts',
        `
      export const foo: string = 'hello';
    `
      );

      yield server.waitForBuild();

      expectModuleBody(
        app,
        'skeleton-app/app',
        `
      _exports.foo = void 0;
      var foo = 'hello';
      _exports.foo = foo;
    `
      );
    })
  );

  it(
    'fails the build when noEmitOnError is set and an error is emitted',
    co.wrap(function*() {
      app.writeFile('app/app.ts', `import { foo } from 'nonexistent';`);

      yield expect(app.build()).to.be.rejectedWith(`Cannot find module 'nonexistent'`);
    })
  );

  it(
    'serves a type error page when the build has failed',
    co.wrap(function*() {
      app.writeFile('app/index.html', 'plain index');
      app.writeFile('app/app.ts', `import { foo } from 'nonexistent';`);

      let server = app.serve();
      let output = yield server.waitForOutput('Typechecking failed');
      let response = yield server.request('/');

      expect(output).to.include(`Cannot find module 'nonexistent'`);
      expect(response.body).to.include(`Cannot find module 'nonexistent'`);
    })
  );

  it(
    "doesn't block builds for file changes that don't result in a typecheck",
    co.wrap(function*() {
      let server = app.serve();

      yield server.waitForBuild();

      app.writeFile('app/some-template.hbs', '');

      yield server.waitForBuild();
    })
  );
});

function isExpressionStatement(stmt: Statement | ModuleDeclaration): stmt is ExpressionStatement {
  return stmt.type === 'ExpressionStatement';
}

function isSpecialCallExpression(
  expr: Expression
): expr is CallExpression & {
  arguments: [Literal, Expression, ClassExpression];
} {
  return (
    expr.type === 'CallExpression' &&
    expr.callee.type === 'Identifier' &&
    expr.callee.name === 'define' &&
    expr.arguments &&
    expr.arguments[0] &&
    expr.arguments[0].type === 'Literal'
  );
}

function extractModuleBody(script: string, moduleName: string) {
  let parsed = esprima.parseScript(script);
  let [definition] = parsed.body
    .filter(isExpressionStatement)
    .map(stmt => stmt.expression)
    .filter(isSpecialCallExpression)
    .filter(expr => expr.arguments[0].value === moduleName);
  if (!definition) throw new Error('Definition for call expression not found');
  let moduleDef = definition.arguments[2].body;

  // Strip `'use strict'`
  moduleDef.body.shift();

  // Strip `__esModule` definition
  moduleDef.body.shift();

  return moduleDef;
}

function expectModuleBody(app: SkeletonApp, name: string, body: string) {
  let src = app.readFile('dist/assets/skeleton-app.js');
  let actual = extractModuleBody(src, name);
  let expected = esprima.parseScript(body);
  expect(actual.body).to.deep.equal(expected.body);
}
