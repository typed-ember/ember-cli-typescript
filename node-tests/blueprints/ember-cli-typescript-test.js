'use strict';

const fs = require('fs');
const path = require('path');
const helpers = require('ember-cli-blueprint-test-helpers/helpers');
const chaiHelpers = require('ember-cli-blueprint-test-helpers/chai');

const expect = chaiHelpers.expect;
const file = chaiHelpers.file;

describe('Acceptance: ember-cli-typescript generator', function() {
  helpers.setupTestHooks(this);

  it('basic app', function() {
    const args = ['ember-cli-typescript'];

    return helpers.emberNew()
      .then(() => helpers.emberGenerate(args))
      .then(() => {
        const tsconfig = file('tsconfig.json');
        expect(tsconfig).to.exist;

        const json = JSON.parse(tsconfig.content);
        expect(json.compilerOptions.paths).to.deep.equal({
          'my-app/tests/*': ['tests/*'],
          'my-app/*': ['app/*'],
        });
      });
  });

  it('in-repo addons', function() {
    const args = ['ember-cli-typescript'];

    return helpers.emberNew()
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
        });
      });
  });
});
