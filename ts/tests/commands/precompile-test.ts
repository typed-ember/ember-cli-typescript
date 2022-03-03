import * as fs from 'fs-extra';
import * as path from 'path';
import { hook } from 'capture-console';
import ember from 'ember-cli-blueprint-test-helpers/lib/helpers/ember';
import blueprintHelpers from 'ember-cli-blueprint-test-helpers/helpers';
import ts from 'typescript';
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;

import * as chai from 'ember-cli-blueprint-test-helpers/chai';
const expect = chai.expect;
const file = chai.file;

describe('Acceptance: ts:precompile command', function () {
  setupTestHooks(this);

  beforeEach(async () => {
    await emberNew({ target: 'addon' });
    await ember(['generate', 'ember-cli-typescript']);
  });

  it('generates .d.ts files from the addon tree', async () => {
    fs.ensureDirSync('addon');
    fs.writeFileSync('addon/test-file.ts', `export const testString: string = 'hello';`);

    await ember(['ts:precompile']);

    let declaration = file('test-file.d.ts');
    expect(declaration).to.exist;
    expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);
  });

  it('generates nothing from the app tree', async () => {
    fs.ensureDirSync('app');
    fs.writeFileSync('app/test-file.ts', `export const testString: string = 'hello';`);

    await ember(['ts:precompile']);

    let declaration = file('test-file.d.ts');
    expect(declaration).not.to.exist;
  });

  it('emits errors to the console when precompilation fails', async () => {
    fs.ensureDirSync('app');
    fs.writeFileSync('app/test-file.ts', `export const testString: string = {};`);

    let output = '';
    let unhookStdout = hook(process.stdout, { quiet: true }, (chunk) => (output += chunk));
    let unhookStderr = hook(process.stderr, { quiet: true }, (chunk) => (output += chunk));
    try {
      await ember(['ts:precompile']);
      expect.fail('Precompilation should have failed');
    } catch {
      expect(output).to.include(`Type '{}' is not assignable to type 'string'.`);
    } finally {
      unhookStdout();
      unhookStderr();
    }
  });

  describe('custom project layout', function () {
    it('generates .d.ts files from the specified source tree', async () => {
      fs.ensureDirSync('src');
      fs.writeFileSync('src/test-file.ts', `export const testString: string = 'hello';`);

      let pkg = fs.readJsonSync('package.json');
      let tsconfig = ts.readConfigFile('tsconfig.json', ts.sys.readFile).config;
      tsconfig.tsconfig.include.push('src');
      tsconfig.compilerOptions.paths[`${pkg.name}/src/*`] = ['src/*'];
      fs.writeJSONSync('tsconfig.json', tsconfig);

      await ember(['ts:precompile']);

      let declaration = file('src/test-file.d.ts');
      expect(declaration).to.exist;
      expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);
    });
  });

  describe('remapped addon-test-support', function () {
    it('generates .d.ts files in the mapped location', async () => {
      fs.ensureDirSync('addon-test-support');
      fs.writeFileSync(
        'addon-test-support/test-file.ts',
        `export const testString: string = 'hello';`
      );

      let pkg = fs.readJsonSync('package.json');
      let tsconfig = ts.readConfigFile('tsconfig.json', ts.sys.readFile).config;
      tsconfig.include.push('src');
      tsconfig.compilerOptions.paths[`${pkg.name}/*`] = ['addon-test-support/*'];
      fs.writeJSONSync('tsconfig.json', tsconfig);

      await ember(['ts:precompile']);

      let declaration = file('test-file.d.ts');
      expect(declaration).to.exist;
      expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);
    });
  });

  it('generates .d.ts files when addon and package names do not match', function () {
    fs.ensureDirSync('addon-test-support');
    fs.writeFileSync(
      'addon-test-support/test-file.ts',
      `export const testString: string = 'hello';`
    );
    fs.writeFileSync('index.js', `module.exports = { name: 'my-addon' };`);

    const pkg = fs.readJSONSync('package.json');
    pkg.name = '@foo/my-addon'; // addon `name` is `my-addon`
    fs.writeJSONSync('package.json', pkg);

    // CAUTION! HACKY CODE AHEAD!
    // The ember blueprint helper stays in the same node process, so require
    // keeps any previously read files cached. We need to clear out these
    // caches so it picks up the changes properly.
    delete require.cache[path.join(process.cwd(), 'index.js')];
    delete require.cache[path.join(process.cwd(), 'package.json')];

    return ember(['ts:precompile']).then(() => {
      const declaration = file('test-support/test-file.d.ts');
      expect(declaration).to.exist;
      expect(declaration.content.trim()).to.equal(`export declare const testString: string;`);
    });
  });

  it('generates .d.ts files for components when addon and moduleName do not match', function () {
    fs.ensureDirSync('addon/components');
    fs.writeFileSync(
      'addon/components/my-component.ts',
      `export const testString: string = 'hello';`
    );
    fs.ensureDirSync('addon-test-support');
    fs.writeFileSync(
      'addon-test-support/test-file.ts',
      `export const anotherTestString: string = 'hello';`
    );
    fs.writeFileSync(
      'index.js',
      `module.exports = { name: '@foo/my-addon', moduleName() { return 'my-addon'; } };`
    );

    const pkg = fs.readJSONSync('package.json');
    pkg.name = '@foo/my-addon'; // addon `moduleName()` is `my-addon`
    fs.writeJSONSync('package.json', pkg);

    // CAUTION! HACKY CODE AHEAD!
    // The ember blueprint helper stays in the same node process, so require
    // keeps any previously read files cached. We need to clear out these
    // caches so it picks up the changes properly.
    delete require.cache[path.join(process.cwd(), 'index.js')];
    delete require.cache[path.join(process.cwd(), 'package.json')];

    return ember(['ts:precompile']).then(() => {
      const componentDecl = file('components/my-component.d.ts');
      expect(componentDecl).to.exist;
      expect(componentDecl.content.trim()).to.equal(`export declare const testString: string;`);

      const testSupportDecl = file('test-support/test-file.d.ts');
      expect(testSupportDecl).to.exist;
      expect(testSupportDecl.content.trim()).to.equal(
        `export declare const anotherTestString: string;`
      );
    });
  });
});
