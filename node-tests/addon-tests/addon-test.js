'use strict';
const expect = require('chai').expect;
const denodeify = require('denodeify');
const request = denodeify(require('request'));
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const esprima = require('esprima');

describe('ember-cli-addon-tests (slow)', function() {
  this.timeout(600000);

  let app;

  before(function() {
    app = new AddonTestApp();
    let appCreateOptions = {
      fixturesPath: 'node-tests/addon-tests/fixtures/'
    }
    return app.create('ts1', appCreateOptions)
      .then(() => {
        return app.run('npm', 'install');
      })
      .then(function() {
        return app.startServer();
      });
  });

  after(function() {
    return app.stopServer();
  });

  it('transpiles pre-existing typescript files', function() {
    return request('http://localhost:49741/assets/ts1.js')
      .then(response => {
        expect(response.statusCode).to.equal(200);

        let moduleBody = extractModuleBody(response.body, 'ts1/add');
        assertModuleBody(moduleBody, `
          "use strict";

          Object.defineProperty(exports, "__esModule", {
              value: true
          });
          exports.add = add;
          function add(a, b) {
              return a + b;
          }
        `);
      });
  });
});

function extractModuleBody(responseJs, moduleName) {
  let parsed = esprima.parseScript(responseJs);
  return parsed.body
    .filter((s) => {
      return s.type === 'ExpressionStatement';
    })
    .map((s) => s.expression)
    .filter((s) =>
        s.type === 'CallExpression' &&
        s.callee.type === 'Identifier' &&
        s.callee.name === 'define' &&
        s.arguments &&
        s.arguments[0] &&
        s.arguments[0].type === 'Literal' &&
        s.arguments[0].value === moduleName)
    .map((s) => s.arguments[2].body)[0];
}

function assertModuleBody(actualParsed, expectedJs) {
  let expectedParsed = esprima.parseScript(expectedJs);
  expect(actualParsed.body).to.deep.equal(expectedParsed.body);
}
