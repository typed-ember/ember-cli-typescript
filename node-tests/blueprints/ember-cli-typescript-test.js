'use strict';

const fs = require('fs');
const path = require('path');
const {
  setupTestHooks,
  emberNew,
  emberGenerate,
} = require('ember-cli-blueprint-test-helpers/helpers');
const { expect, file } = require('ember-cli-blueprint-test-helpers/chai');

describe('Acceptance: ember-cli-typescript generator', function() {
  setupTestHooks(this);

  it('basic app', function() {
    const args = ['ember-cli-typescript'];

    return emberNew()
      .then(() => emberGenerate(args))
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
        });

        expect(tsconfigJson.include).to.deep.equal(['app', 'tests']);
      });
  });

  it('basic addon', function() {
    const args = ['ember-cli-typescript'];

    return emberNew({ target: 'addon' })
      .then(() => emberGenerate(args))
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
          'dummy/*': ['tests/dummy/app/*'],
          'my-addon': ['addon'],
          'my-addon/*': ['addon/*'],
        });

        expect(tsconfigJson.include).to.deep.equal(['addon', 'tests']);
      });
  });

  it('in-repo addons', function() {
    const args = ['ember-cli-typescript'];

    return emberNew()
      .then(() => {
        const packagePath = path.resolve(process.cwd(), 'package.json');
        const contents = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
        contents['ember-addon'] = {
          paths: ['lib/my-addon-1', 'lib/my-addon-2'],
        };
        fs.writeFileSync(packagePath, JSON.stringify(contents, null, 2));
      })
      .then(() => emberGenerate(args))
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
        });

        expect(json.include).to.deep.equal(['app', 'tests', 'lib/my-addon-1', 'lib/my-addon-2']);
      });
  });
});
