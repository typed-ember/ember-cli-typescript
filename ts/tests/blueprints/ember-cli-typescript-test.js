'use strict';

const fs = require('fs-extra');
const path = require('path');
const helpers = require('ember-cli-blueprint-test-helpers/helpers');
const chaiHelpers = require('ember-cli-blueprint-test-helpers/chai');
const Blueprint = require('ember-cli/lib/models/blueprint');
const Project = require('ember-cli/lib/models/project');

const ects = require('../../blueprints/ember-cli-typescript');

const expect = chaiHelpers.expect;
const file = chaiHelpers.file;

describe('Acceptance: ember-cli-typescript generator', function() {
  helpers.setupTestHooks(this, { disabledTasks: ['addon-install', 'bower-install'] });

  const originalTaskForFn = Blueprint.prototype.taskFor;

  beforeEach(function() {
    Blueprint.prototype.taskFor = function(taskName) {
      if (taskName === 'npm-install') {
        // Mock npm-install that only modifies package.json
        return {
          run: function(options) {
            let pkgJson = fs.readJsonSync('package.json');
            options.packages.forEach(function(pkg) {
              let pkgName = pkg.match(/^(.*)@[^@]*$/);
              pkgJson['devDependencies'][pkgName[1]] = '*';
            });
            fs.writeJsonSync('package.json', pkgJson);
          }
        };
      }
      return originalTaskForFn.call(this, taskName);
    };
  });

  afterEach(function() {
    Blueprint.prototype.taskFor = originalTaskForFn;
  });

  it('basic app', function() {
    const args = ['ember-cli-typescript'];

    return helpers
      .emberNew()
      .then(() => helpers.emberGenerate(args))
      .then(() => {
        const pkg = file('package.json');
        expect(pkg).to.exist;

        const pkgJson = JSON.parse(pkg.content);
        expect(pkgJson.scripts.prepublishOnly).to.be.undefined;
        expect(pkgJson.scripts.postpublish).to.be.undefined;
        expect(pkgJson.devDependencies).to.include.all.keys('ember-cli-typescript-blueprints');
        expect(pkgJson.devDependencies).to.include.all.keys('ember-data');
        expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-data');
        expect(pkgJson.devDependencies).to.include.all.keys('ember-qunit');
        expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-qunit', '@types/qunit');
        expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-mocha', '@types/mocha');

        const tsconfig = file('tsconfig.json');
        expect(tsconfig).to.exist;

        const tsconfigJson = JSON.parse(tsconfig.content);
        expect(tsconfigJson.compilerOptions.paths).to.deep.equal({
          'my-app/tests/*': ['tests/*'],
          'my-app/*': ['app/*'],
          '*': ['types/*'],
        });

        expect(tsconfigJson.compilerOptions.inlineSourceMap).to.equal(true);
        expect(tsconfigJson.compilerOptions.inlineSources).to.equal(true);

        expect(tsconfigJson.include).to.deep.equal(['app/**/*', 'tests/**/*', 'types/**/*']);

        const projectTypes = file('types/my-app/index.d.ts');
        expect(projectTypes).to.exist;
        expect(projectTypes).to.include(ects.APP_DECLARATIONS);

        const environmentTypes = file('app/config/environment.d.ts');
        expect(environmentTypes).to.exist;

        const emberDataCatchallTypes = file('types/ember-data/types/registries/model.d.ts');
        expect(emberDataCatchallTypes).to.exist;
      });
  });

  it('basic addon', function() {
    const args = ['ember-cli-typescript'];

    return helpers
      .emberNew({ target: 'addon' })
      .then(() => helpers.emberGenerate(args))
      .then(() => {
        const pkg = file('package.json');
        expect(pkg).to.exist;

        const pkgJson = JSON.parse(pkg.content);
        expect(pkgJson.scripts.prepublishOnly).to.equal('ember ts:precompile');
        expect(pkgJson.scripts.postpublish).to.equal('ember ts:clean');
        expect(pkgJson.devDependencies).to.not.have.any.keys('ember-data');
        expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-data');
        expect(pkgJson.devDependencies).to.include.all.keys('ember-qunit');
        expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-qunit', '@types/qunit');
        expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-mocha', '@types/mocha');

        const tsconfig = file('tsconfig.json');
        expect(tsconfig).to.exist;

        const tsconfigJson = JSON.parse(tsconfig.content);
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

        const environmentTypes = file('tests/dummy/app/config/environment.d.ts');
        expect(environmentTypes).to.exist;

        const emberDataCatchallTypes = file('types/ember-data/types/registries/model.d.ts');
        expect(emberDataCatchallTypes).not.to.exist;
      });
  });

  describe('module unification', function() {
    const originalIsMU = Project.prototype.isModuleUnification;

    beforeEach(function() {
      Project.prototype.isModuleUnification = () => true;
    });

    afterEach(function() {
      Project.prototype.isModuleUnification = originalIsMU;
    });

    it('basic app', function() {
      const args = ['ember-cli-typescript'];

      return helpers
        .emberNew()
        .then(() => helpers.emberGenerate(args))
        .then(() => {
          const pkg = file('package.json');
          expect(pkg).to.exist;

          const pkgJson = JSON.parse(pkg.content);
          expect(pkgJson.scripts.prepublishOnly).to.be.undefined;
          expect(pkgJson.scripts.postpublish).to.be.undefined;
          expect(pkgJson.devDependencies).to.include.all.keys('ember-data');
          expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-data');
          expect(pkgJson.devDependencies).to.include.all.keys('ember-qunit');
          expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-qunit', '@types/qunit');
          expect(pkgJson.devDependencies).to.not.have.any.keys(
            '@types/ember-mocha',
            '@types/mocha'
          );

          const tsconfig = file('tsconfig.json');
          expect(tsconfig).to.exist;

          const tsconfigJson = JSON.parse(tsconfig.content);
          expect(tsconfigJson.compilerOptions.paths).to.deep.equal({
            'my-app/tests/*': ['tests/*'],
            'my-app/src/*': ['src/*'],
            '*': ['types/*'],
          });

          expect(tsconfigJson.compilerOptions.inlineSourceMap).to.equal(true);
          expect(tsconfigJson.compilerOptions.inlineSources).to.equal(true);

          expect(tsconfigJson.include).to.deep.equal(['src/**/*', 'tests/**/*', 'types/**/*']);

          const projectTypes = file('types/my-app/index.d.ts');
          expect(projectTypes).to.exist;
          expect(projectTypes).to.include(ects.APP_DECLARATIONS);

          const environmentTypes = file('config/environment.d.ts');
          expect(environmentTypes).to.exist;

          const emberDataCatchallTypes = file('types/ember-data/types/registries/model.d.ts');
          expect(emberDataCatchallTypes).to.exist;
        });
    });

    it('basic addon', function() {
      const args = ['ember-cli-typescript'];

      return helpers
        .emberNew({ target: 'addon' })
        .then(() => helpers.emberGenerate(args))
        .then(() => {
          const pkg = file('package.json');
          expect(pkg).to.exist;

          const pkgJson = JSON.parse(pkg.content);
          expect(pkgJson.scripts.prepublishOnly).to.equal('ember ts:precompile');
          expect(pkgJson.scripts.postpublish).to.equal('ember ts:clean');
          expect(pkgJson.devDependencies).to.not.have.any.keys('ember-data');
          expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-data');
          expect(pkgJson.devDependencies).to.include.all.keys('ember-qunit');
          expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-qunit', '@types/qunit');
          expect(pkgJson.devDependencies).to.not.have.any.keys(
            '@types/ember-mocha',
            '@types/mocha'
          );

          const tsconfig = file('tsconfig.json');
          expect(tsconfig).to.exist;

          const tsconfigJson = JSON.parse(tsconfig.content);
          expect(tsconfigJson.compilerOptions.paths).to.deep.equal({
            'dummy/tests/*': ['tests/*'],
            'dummy/src/*': ['tests/dummy/src/*'],
            'my-addon/src/*': ['src/*'],
            '*': ['types/*'],
          });

          expect(tsconfigJson.include).to.deep.equal(['src/**/*', 'tests/**/*', 'types/**/*']);

          const projectTypes = file('types/dummy/index.d.ts');
          expect(projectTypes).to.exist;
          expect(projectTypes).not.to.include(ects.APP_DECLARATIONS);

          const environmentTypes = file('tests/dummy/config/environment.d.ts');
          expect(environmentTypes).to.exist;

          const emberDataCatchallTypes = file('types/ember-data/types/registries/model.d.ts');
          expect(emberDataCatchallTypes).not.to.exist;
        });
    });
  });

  it('in-repo addons', function() {
    const args = ['ember-cli-typescript'];

    return helpers
      .emberNew()
      .then(() => {
        const packagePath = path.resolve(process.cwd(), 'package.json');
        const contents = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
        contents['ember-addon'] = {
          paths: ['lib/my-addon-1', 'lib/my-addon-2'],
        };
        fs.writeFileSync(packagePath, JSON.stringify(contents, null, 2));
      })
      .then(() => helpers.emberGenerate(args))
      .then(() => {
        const tsconfig = file('tsconfig.json');
        expect(tsconfig).to.exist;

        const json = JSON.parse(tsconfig.content);
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
  });

  it('app with Mirage', function() {
    const args = ['ember-cli-typescript'];

    return helpers
      .emberNew()
      .then(() => {
        const packagePath = path.resolve(process.cwd(), 'package.json');
        const contents = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
        contents.devDependencies['ember-cli-mirage'] = '*';
        fs.writeFileSync(packagePath, JSON.stringify(contents, null, 2));
      })
      .then(() => helpers.emberGenerate(args))
      .then(() => {
        const tsconfig = file('tsconfig.json');
        expect(tsconfig).to.exist;

        const json = JSON.parse(tsconfig.content);
        expect(json.compilerOptions.paths).to.deep.equal({
          'my-app/tests/*': ['tests/*'],
          'my-app/mirage/*': ['mirage/*'],
          'my-app/*': ['app/*'],
          '*': ['types/*'],
        });

        expect(json.include).to.deep.equal(['app/**/*', 'tests/**/*', 'types/**/*', 'mirage/**/*']);
      });
  });

  it('addon with Mirage', function() {
    const args = ['ember-cli-typescript'];

    return helpers
      .emberNew({ target: 'addon' })
      .then(() => {
        const packagePath = path.resolve(process.cwd(), 'package.json');
        const contents = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
        contents.devDependencies['ember-cli-mirage'] = '*';
        fs.writeFileSync(packagePath, JSON.stringify(contents, null, 2));
      })
      .then(() => helpers.emberGenerate(args))
      .then(() => {
        const tsconfig = file('tsconfig.json');
        expect(tsconfig).to.exist;

        const json = JSON.parse(tsconfig.content);
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
  });

  describe('ember-mocha', function() {
    it('app with ember-cli-mocha', function() {
      const args = ['ember-cli-typescript'];

      return helpers
        .emberNew()
        .then(() => helpers.modifyPackages([
          { name: 'ember-cli-mocha', dev: true },
          { name: 'ember-qunit', delete: true }
        ]))
        .then(() => helpers.emberGenerate(args))
        .then(() => {
          const pkg = file('package.json');
          expect(pkg).to.exist;

          const pkgJson = JSON.parse(pkg.content);
          expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-mocha', '@types/mocha');
          expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-qunit', '@types/qunit');
        });
    });

    it('app with ember-mocha', function() {
      const args = ['ember-cli-typescript'];

      return helpers
        .emberNew()
        .then(() => helpers.modifyPackages([
          { name: 'ember-mocha', dev: true },
          { name: 'ember-qunit', delete: true }
        ]))
        .then(() => helpers.emberGenerate(args))
        .then(() => {
          const pkg = file('package.json');
          expect(pkg).to.exist;

          const pkgJson = JSON.parse(pkg.content);
          expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-mocha', '@types/mocha');
          expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-qunit', '@types/qunit');
        });
    });

    it('addon with ember-cli-mocha', function() {
      const args = ['ember-cli-typescript'];

      return helpers
        .emberNew({ target: 'addon' })
        .then(() => helpers.modifyPackages([
          { name: 'ember-cli-mocha', dev: true },
          { name: 'ember-qunit', delete: true }
        ]))
        .then(() => helpers.emberGenerate(args))
        .then(() => {
          const pkg = file('package.json');
          expect(pkg).to.exist;

          const pkgJson = JSON.parse(pkg.content);
          expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-mocha', '@types/mocha');
          expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-qunit', '@types/qunit');
        });
    });

    it('addon with ember-mocha', function() {
      const args = ['ember-cli-typescript'];

      return helpers
        .emberNew({ target: 'addon' })
        .then(() => helpers.modifyPackages([
          { name: 'ember-mocha', dev: true },
          { name: 'ember-qunit', delete: true }
        ]))
        .then(() => helpers.emberGenerate(args))
        .then(() => {
          const pkg = file('package.json');
          expect(pkg).to.exist;

          const pkgJson = JSON.parse(pkg.content);
          expect(pkgJson.devDependencies).to.include.all.keys('@types/ember-mocha', '@types/mocha');
          expect(pkgJson.devDependencies).to.not.have.any.keys('@types/ember-qunit', '@types/qunit');
        });
    });
  });
});
