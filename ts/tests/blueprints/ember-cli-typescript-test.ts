'use strict';

import fs from 'fs-extra';
import path from 'path';
import helpers from 'ember-cli-blueprint-test-helpers/helpers';
import chaiHelpers from 'ember-cli-blueprint-test-helpers/chai';
import Blueprint from 'ember-cli/lib/models/blueprint';
import ts from 'typescript';

import { setupPublishedVersionStashing } from '../helpers/stash-published-version';
import ects from '../../blueprints/ember-cli-typescript/index';

const expect = chaiHelpers.expect;
const file = chaiHelpers.file;

describe('Acceptance: ember-cli-typescript generator', function () {
  setupPublishedVersionStashing(this);

  helpers.setupTestHooks(this, {
    disabledTasks: ['addon-install', 'bower-install'],
  });

  const originalTaskForFn = Blueprint.prototype.taskFor;

  beforeEach(function () {
    Blueprint.prototype.taskFor = function (taskName) {
      if (taskName === 'npm-install') {
        // Mock npm-install that only modifies package.json
        return {
          run: function (options: { packages: string[] }) {
            let pkgJson = fs.readJsonSync('package.json');
            options.packages.forEach(function (pkg) {
              let pkgName = pkg.match(/^(.*)@[^@]*$/);
              if (!pkgName) throw new Error(`Improperly-formatted package name: ${pkgName}`);
              pkgJson['devDependencies'][pkgName[1]] = '*';
            });
            fs.writeJsonSync('package.json', pkgJson);
          },
        };
      }
      return originalTaskForFn.call(this, taskName);
    };
  });

  afterEach(function () {
    Blueprint.prototype.taskFor = originalTaskForFn;
  });

  it('basic app', async () => {
    const args = ['ember-cli-typescript'];

    await helpers.emberNew();
    await helpers.emberGenerate(args);

    const pkg = file('package.json');
    expect(pkg).to.exist;

    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.scripts.prepack).to.be.undefined;
    expect(pkgJson.scripts.postpack).to.be.undefined;
    expect(pkgJson.devDependencies).to.include.all.keys('ember-data');
    expect(pkgJson.devDependencies).to.include.all.keys('@tsconfig/ember');
    expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-data');
    expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-data__adapter');
    expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-data__model');
    expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-data__serializer');
    expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-data__store');
    expect(pkgJson.devDependencies).to.include.all.keys('ember-qunit');
    expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-qunit', '@types/qunit');
    expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-mocha', '@types/mocha');

    const tsconfig = file('tsconfig.json');
    expect(tsconfig).to.exist;

    const tsconfigJson = ts.parseConfigFileTextToJson('tsconfig.json', tsconfig.content).config;
    expect(tsconfigJson.extends).to.equal('@tsconfig/ember/tsconfig.json');
    expect(tsconfigJson.compilerOptions.paths).to.deep.equal({
      'my-app/tests/*': ['tests/*'],
      'my-app/*': ['app/*'],
      '*': ['types/*'],
    });

    expect(tsconfigJson.include).to.deep.equal(['app/**/*', 'tests/**/*', 'types/**/*']);

    const projectTypes = file('types/my-app/index.d.ts');
    expect(projectTypes).to.exist;
    expect(projectTypes).to.include(ects.APP_DECLARATIONS);

    const environmentTypes = file('app/config/environment.d.ts');
    expect(environmentTypes).to.exist;

    const emberDataCatchallTypes = file('types/ember-data/types/registries/model.d.ts');
    expect(emberDataCatchallTypes).to.exist;
  });

  it('basic addon', async () => {
    const args = ['ember-cli-typescript'];

    await helpers.emberNew({ target: 'addon' });
    await helpers.emberGenerate(args);

    const pkg = file('package.json');
    expect(pkg).to.exist;

    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.scripts.prepack).to.equal('ember ts:precompile');
    expect(pkgJson.scripts.postpack).to.equal('ember ts:clean');
    expect(pkgJson.dependencies).to.include.all.keys('ember-cli-typescript');
    expect(pkgJson.devDependencies).to.not.include.all.keys('ember-cli-typescript');
    expect(pkgJson.devDependencies).to.not.have.any.keys('ember-data');
    expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-data');
    expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-data__adapter');
    expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-data__model');
    expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-data__serializer');
    expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-data__store');
    expect(pkgJson.devDependencies).to.include.all.keys('ember-qunit');
    expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-qunit', '@types/qunit');
    expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-mocha', '@types/mocha');

    const tsconfig = file('tsconfig.json');
    expect(tsconfig).to.exist;

    const tsconfigJson = ts.parseConfigFileTextToJson('tsconfig.json', tsconfig.content).config;
    expect(tsconfigJson.compilerOptions.paths).to.deep.equal({
      'dummy/tests/*': ['tests/*'],
      'dummy/*': ['tests/dummy/app/*', 'app/*'],
      'my-addon': ['addon'],
      'my-addon/*': ['addon/*'],
      'my-addon/test-support': ['addon-test-support'],
      'my-addon/test-support/*': ['addon-test-support/*'],
      '*': ['types/*'],
    });

    expect(tsconfigJson.include).to.deep.equal([
      'app/**/*',
      'addon/**/*',
      'tests/**/*',
      'types/**/*',
      'test-support/**/*',
      'addon-test-support/**/*',
    ]);

    const projectTypes = file('types/dummy/index.d.ts');
    expect(projectTypes).to.exist;
    expect(projectTypes).not.to.include(ects.APP_DECLARATIONS);

    const globalTypes = file('types/global.d.ts');
    expect(globalTypes).to.exist;
    expect(globalTypes).to.include("declare module 'my-addon/templates/*'").to.include(`
  import { TemplateFactory } from 'ember-cli-htmlbars';

  const tmpl: TemplateFactory;
  export default tmpl;
`);

    const environmentTypes = file('tests/dummy/app/config/environment.d.ts');
    expect(environmentTypes).to.exist;

    const emberDataCatchallTypes = file('types/ember-data/types/registries/model.d.ts');
    expect(emberDataCatchallTypes).not.to.exist;
  });

  it('moves from devDependencies to dependencies for addons', async function () {
    const args = ['ember-cli-typescript'];

    await helpers.emberNew({ target: 'addon' });
    await helpers.modifyPackages([
      {
        dev: true,
        name: 'ember-cli-typescript',
      },
    ]);
    await helpers.emberGenerate(args);

    const pkg = file('package.json');
    expect(pkg).to.exist;

    const pkgJson = JSON.parse(pkg.content);
    expect(pkgJson.devDependencies).to.not.have.any.keys('ember-cli-typescript');
    expect(pkgJson.dependencies).to.include.all.keys('ember-cli-typescript');
  });

  it('in-repo addons', async () => {
    const args = ['ember-cli-typescript'];

    await helpers.emberNew();

    const packagePath = path.resolve(process.cwd(), 'package.json');
    const contents = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
    contents['ember-addon'] = {
      paths: ['lib/my-addon-1', 'lib/my-addon-2'],
    };
    fs.writeFileSync(packagePath, JSON.stringify(contents, null, 2));

    await helpers.emberGenerate(args);

    const tsconfig = file('tsconfig.json');
    expect(tsconfig).to.exist;

    const json = ts.parseConfigFileTextToJson('tsconfig.json', tsconfig.content).config;
    expect(json.compilerOptions.paths).to.deep.equal({
      'my-app/tests/*': ['tests/*'],
      'my-app/*': ['app/*', 'lib/my-addon-1/app/*', 'lib/my-addon-2/app/*'],
      'my-addon-1': ['lib/my-addon-1/addon'],
      'my-addon-1/*': ['lib/my-addon-1/addon/*'],
      'my-addon-1/test-support': ['lib/my-addon-1/addon-test-support'],
      'my-addon-1/test-support/*': ['lib/my-addon-1/addon-test-support/*'],
      'my-addon-2': ['lib/my-addon-2/addon'],
      'my-addon-2/*': ['lib/my-addon-2/addon/*'],
      'my-addon-2/test-support': ['lib/my-addon-2/addon-test-support'],
      'my-addon-2/test-support/*': ['lib/my-addon-2/addon-test-support/*'],
      '*': ['types/*'],
    });

    expect(json.include).to.deep.equal([
      'app/**/*',
      'tests/**/*',
      'types/**/*',
      'lib/my-addon-1/**/*',
      'lib/my-addon-2/**/*',
    ]);

    const projectTypes = file('types/my-app/index.d.ts');
    expect(projectTypes).to.exist;
    expect(projectTypes).to.include(ects.APP_DECLARATIONS);

    const emberDataCatchallTypes = file('types/ember-data/types/registries/model.d.ts');
    expect(emberDataCatchallTypes).to.exist;
  });

  it('app with Mirage', async () => {
    const args = ['ember-cli-typescript'];

    await helpers.emberNew();

    const packagePath = path.resolve(process.cwd(), 'package.json');
    const contents = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
    contents.devDependencies['ember-cli-mirage'] = '*';
    fs.writeFileSync(packagePath, JSON.stringify(contents, null, 2));

    await helpers.emberGenerate(args);

    const tsconfig = file('tsconfig.json');
    expect(tsconfig).to.exist;

    const json = ts.parseConfigFileTextToJson('tsconfig.json', tsconfig.content).config;
    expect(json.compilerOptions.paths).to.deep.equal({
      'my-app/tests/*': ['tests/*'],
      'my-app/mirage/*': ['mirage/*'],
      'my-app/*': ['app/*'],
      '*': ['types/*'],
    });

    expect(json.include).to.deep.equal(['app/**/*', 'tests/**/*', 'types/**/*', 'mirage/**/*']);
  });

  it('addon with Mirage', async () => {
    const args = ['ember-cli-typescript'];

    await helpers.emberNew({ target: 'addon' });

    const packagePath = path.resolve(process.cwd(), 'package.json');
    const contents = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
    contents.devDependencies['ember-cli-mirage'] = '*';
    fs.writeFileSync(packagePath, JSON.stringify(contents, null, 2));

    await helpers.emberGenerate(args);

    const tsconfig = file('tsconfig.json');
    expect(tsconfig).to.exist;

    const json = ts.parseConfigFileTextToJson('tsconfig.json', tsconfig.content).config;
    expect(json.compilerOptions.paths).to.deep.equal({
      'dummy/tests/*': ['tests/*'],
      'dummy/mirage/*': ['tests/dummy/mirage/*'],
      'dummy/*': ['tests/dummy/app/*', 'app/*'],
      'my-addon': ['addon'],
      'my-addon/*': ['addon/*'],
      'my-addon/test-support': ['addon-test-support'],
      'my-addon/test-support/*': ['addon-test-support/*'],
      '*': ['types/*'],
    });

    expect(json.include).to.deep.equal([
      'app/**/*',
      'addon/**/*',
      'tests/**/*',
      'types/**/*',
      'test-support/**/*',
      'addon-test-support/**/*',
    ]);
  });

  describe('ember-mocha', function () {
    it('app with ember-cli-mocha', async () => {
      const args = ['ember-cli-typescript'];

      await helpers.emberNew();

      helpers.modifyPackages([
        { name: 'ember-cli-mocha', dev: true },
        { name: 'ember-qunit', delete: true },
      ]);

      await helpers.emberGenerate(args);

      const pkg = file('package.json');
      expect(pkg).to.exist;

      const pkgJson = JSON.parse(pkg.content);
      expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-mocha', '@types/mocha');
      expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-qunit', '@types/qunit');
    });

    it('app with ember-mocha', async () => {
      const args = ['ember-cli-typescript'];

      await helpers.emberNew();

      helpers.modifyPackages([
        { name: 'ember-mocha', dev: true },
        { name: 'ember-qunit', delete: true },
      ]);
      await helpers.emberGenerate(args);

      const pkg = file('package.json');
      expect(pkg).to.exist;

      const pkgJson = JSON.parse(pkg.content);
      expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-mocha', '@types/mocha');
      expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-qunit', '@types/qunit');
    });

    it('addon with ember-cli-mocha', async () => {
      const args = ['ember-cli-typescript'];

      await helpers.emberNew({ target: 'addon' });

      helpers.modifyPackages([
        { name: 'ember-cli-mocha', dev: true },
        { name: 'ember-qunit', delete: true },
      ]);

      await helpers.emberGenerate(args);

      const pkg = file('package.json');
      expect(pkg).to.exist;

      const pkgJson = JSON.parse(pkg.content);
      expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-mocha', '@types/mocha');
      expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-qunit', '@types/qunit');
    });

    it('addon with ember-mocha', async () => {
      const args = ['ember-cli-typescript'];

      await helpers.emberNew({ target: 'addon' });

      helpers.modifyPackages([
        { name: 'ember-mocha', dev: true },
        { name: 'ember-qunit', delete: true },
      ]);

      await helpers.emberGenerate(args);

      const pkg = file('package.json');
      expect(pkg).to.exist;

      const pkgJson = JSON.parse(pkg.content);
      expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-mocha', '@types/mocha');
      expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-qunit', '@types/qunit');
    });
  });
});
