'use strict';

const fs = require('fs-extra');

const ember = require('ember-cli-blueprint-test-helpers/lib/helpers/ember');
const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;

const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;
const file = chai.file;

describe('Acceptance: ts:precompile command', function() {
  setupTestHooks(this);

  beforeEach(function() {
    return emberNew({ target: 'addon' }).then(() => ember(['generate', 'ember-cli-typescript']));
  });

  it('generates .js and .d.ts files from the addon tree', function() {
    fs.ensureDirSync('addon');
    fs.writeFileSync('addon/test-file.ts', `export const testString: string = 'hello';`);

    return ember(['ts:precompile'])
      .then(() => {
        let declaration = file('test-file.d.ts');
        expect(declaration).to.exist;
        expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);

        let transpiled = file('addon/test-file.js');
        expect(transpiled).to.exist;
        expect(transpiled.content.trim()).to.equal(`export const testString = 'hello';`);
      });
  });

  it('generates .js files only from the app tree', function() {
    fs.ensureDirSync('app');
    fs.writeFileSync('app/test-file.ts', `export const testString: string = 'hello';`);

    return ember(['ts:precompile']).then(() => {
      let declaration = file('test-file.d.ts');
      expect(declaration).not.to.exist;

      let transpiled = file('app/test-file.js');
      expect(transpiled).to.exist;
      expect(transpiled.content.trim()).to.equal(`export const testString = 'hello';`);
    });
  });

  it('copies generated addon type declarations', function() {
    fs.ensureDirSync('types/generated/addon');
    fs.writeFileSync('types/generated/addon/addon-file.d.ts', `export declare const testString: string;`);

    fs.ensureDirSync('types/generated/app');
    fs.writeFileSync('types/generated/app/app-file.d.ts', `export declare const testString: string;`);

    return ember(['ts:precompile']).then(() => {
      let addonDeclaration = file('addon-file.d.ts');
      expect(addonDeclaration).to.exist;
      expect(addonDeclaration.content.trim()).to.equal(`export declare const testString: string;`);

      let appDeclaration = file('app-file.d.ts');
      expect(appDeclaration).not.to.exist;
    });
  });

  describe('module unification', function() {
    it('generates .js and .d.ts files from the src tree', function() {
      fs.ensureDirSync('src');
      fs.writeFileSync('src/test-file.ts', `export const testString: string = 'hello';`);

      let tsconfig = fs.readJSONSync('tsconfig.json');
      tsconfig.include.push('src');
      fs.writeJSONSync('tsconfig.json', tsconfig);

      return ember(['ts:precompile'])
        .then(() => {
          let declaration = file('src/test-file.d.ts');
          expect(declaration).to.exist;
          expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);

          let transpiled = file('src/test-file.js');
          expect(transpiled).to.exist;
          expect(transpiled.content.trim()).to.equal(`export const testString = 'hello';`);
        });
    });

    it('copies generated src type declarations', function() {
      fs.ensureDirSync('types/generated/src');
      fs.writeFileSync('types/generated/src/addon-file.d.ts', `export declare const testString: string;`);

      return ember(['ts:precompile']).then(() => {
        let addonDeclaration = file('src/addon-file.d.ts');
        expect(addonDeclaration).to.exist;
        expect(addonDeclaration.content.trim()).to.equal(`export declare const testString: string;`);
      });
    });
  });
});
