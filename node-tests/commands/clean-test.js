'use strict';

const fs = require('fs-extra');
const walkSync = require('walk-sync');

const ember = require('ember-cli-blueprint-test-helpers/lib/helpers/ember');
const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;

const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;

describe('Acceptance: ts:clean command', function() {
  setupTestHooks(this);

  beforeEach(function() {
    return emberNew({ target: 'addon' }).then(() => ember(['generate', 'ember-cli-typescript']));
  });

  it('removes all generated files', function() {
    fs.ensureDirSync('tmp');
    fs.ensureDirSync('app');
    fs.ensureDirSync('addon');
    fs.writeFileSync('app/test-file.ts', `export const testString: string = 'app';\n`);
    fs.writeFileSync('addon/test-file.ts', `export const testString: string = 'addon';\n`);

    let before = walkSync(process.cwd());
    return ember(['ts:precompile'])
      .then(() => ember(['ts:clean']))
      .then(() => {
        let after = walkSync(process.cwd());
        expect(after).to.deep.equal(before);
      });
  });
});
