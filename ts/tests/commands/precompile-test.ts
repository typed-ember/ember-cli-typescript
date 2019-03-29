'use strict';

import * as fs from 'fs-extra';

import ember from 'ember-cli-blueprint-test-helpers/lib/helpers/ember';
import blueprintHelpers from 'ember-cli-blueprint-test-helpers/helpers';
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;

import * as chai from 'ember-cli-blueprint-test-helpers/chai';
const expect = chai.expect;
const file = chai.file;

describe('Acceptance: ts:precompile command', function() {
  setupTestHooks(this);

  beforeEach(function() {
    return emberNew({ target: 'addon' }).then(() => ember(['generate', 'ember-cli-typescript']));
  });

  it('generates .d.ts files from the addon tree', function() {
    fs.ensureDirSync('addon');
    fs.writeFileSync('addon/test-file.ts', `export const testString: string = 'hello';`);

    return ember(['ts:precompile'])
      .then(() => {
        let declaration = file('test-file.d.ts');
        expect(declaration).to.exist;
        expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);
      });
  });

  it('generates nothing from the app tree', function() {
    fs.ensureDirSync('app');
    fs.writeFileSync('app/test-file.ts', `export const testString: string = 'hello';`);

    return ember(['ts:precompile']).then(() => {
      let declaration = file('test-file.d.ts');
      expect(declaration).not.to.exist;
    });
  });

  describe('module unification', function() {
    it('generates .d.ts files from the src tree', function() {
      fs.ensureDirSync('src');
      fs.writeFileSync('src/test-file.ts', `export const testString: string = 'hello';`);

      let pkg = fs.readJsonSync('package.json');
      let tsconfig = fs.readJSONSync('tsconfig.json');
      tsconfig.include.push('src');
      tsconfig.compilerOptions.paths[`${pkg.name}/src/*`] = ['src/*'];
      fs.writeJSONSync('tsconfig.json', tsconfig);

      return ember(['ts:precompile'])
        .then(() => {
          let declaration = file('src/test-file.d.ts');
          expect(declaration).to.exist;
          expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);
        });
    });
  });

  describe('remapped addon-test-support', function() {
    it('generates .d.ts files in the mapped location', function() {
      fs.ensureDirSync('addon-test-support');
      fs.writeFileSync('addon-test-support/test-file.ts', `export const testString: string = 'hello';`);

      let pkg = fs.readJsonSync('package.json');
      let tsconfig = fs.readJSONSync('tsconfig.json');
      tsconfig.include.push('src');
      tsconfig.compilerOptions.paths[`${pkg.name}/*`] = ['addon-test-support/*'];
      fs.writeJSONSync('tsconfig.json', tsconfig);

      return ember(['ts:precompile'])
        .then(() => {
          let declaration = file('test-file.d.ts');
          expect(declaration).to.exist;
          expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);
        });
    });
  });
});
