import Application from '@ember/application';

import { initialize } from 'my-app/initializers/foo';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import destroyApp from '../../helpers/destroy-app';
import { TestContext } from 'ember-test-helpers';

module('Unit | Initializer | foo', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    this.TestApplication = Application.extend();
    this.TestApplication.initializer({
      name: 'initializer under test',
      initialize
    });

    this.application = this.TestApplication.create({ autoboot: false });
  });

  hooks.afterEach(function(this: TestContext) {
    destroyApp(this.application);
  });

  // Replace this with your real tests.
  test('it works', async function(this: TestContext, assert) {
    await this.application.boot();

    assert.ok(true);
  });
});
