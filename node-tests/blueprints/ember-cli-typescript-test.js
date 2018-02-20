'use strict';

const fs = require('fs');
const path = require('path');
const helpers = require('ember-cli-blueprint-test-helpers/helpers');
const chaiHelpers = require('ember-cli-blueprint-test-helpers/chai');

const ects = require('../../blueprints/ember-cli-typescript');

const expect = chaiHelpers.expect;
const file = chaiHelpers.file;

describe('Acceptance: ember-cli-typescript generator', function() {
  helpers.setupTestHooks(this);

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

        const tsconfig = file('tsconfig.json');
        expect(tsconfig).to.exist;

        const tsconfigJson = JSON.parse(tsconfig.content);
        expect(tsconfigJson.compilerOptions.paths).to.deep.equal({
          'my-app/tests/*': ['tests/*'],
          'my-app/*': ['app/*'],
          '*': ['types/*'],
        });

        expect(tsconfigJson.include).to.deep.equal(['app', 'tests']);

        const projectTypes = file('types/my-app/index.d.ts');
        expect(projectTypes).to.exist;
        expect(projectTypes).to.include(ects.APP_DECLARATIONS);

        const environmentTypes = file('types/my-app/config/environment.d.ts');
        expect(environmentTypes).to.exist;
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

        const tsconfig = file('tsconfig.json');
        expect(tsconfig).to.exist;

        const tsconfigJson = JSON.parse(tsconfig.content);
        expect(tsconfigJson.compilerOptions.paths).to.deep.equal({
          'dummy/tests/*': ['tests/*'],
          'dummy/*': ['tests/dummy/app/*', 'app/*'],
          'my-addon': ['addon'],
          'my-addon/*': ['addon/*'],
          '*': ['types/*'],
        });

        expect(tsconfigJson.include).to.deep.equal(['app', 'addon', 'tests']);

        const projectTypes = file('types/dummy/index.d.ts');
        expect(projectTypes).to.exist;
        expect(projectTypes).not.to.include(ects.APP_DECLARATIONS);
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
          'my-addon-2': ['lib/my-addon-2/addon'],
          'my-addon-2/*': ['lib/my-addon-2/addon/*'],
          '*': ['types/*'],
        });

        expect(json.include).to.deep.equal(['app', 'tests', 'lib/my-addon-1', 'lib/my-addon-2']);

        const projectTypes = file('types/my-app/index.d.ts');
        expect(projectTypes).to.exist;
        expect(projectTypes).to.include(ects.APP_DECLARATIONS);
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

        expect(json.include).to.deep.equal(['app', 'tests', 'mirage']);
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
          '*': ['types/*'],
        });

        expect(json.include).to.deep.equal(['app', 'addon', 'tests']);
      });
  });
});
