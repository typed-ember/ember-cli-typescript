import Application from '@ember/application';
import { run } from '@ember/runloop';

import { initialize } from 'my-app/initializers/foo';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import { TestContext } from 'ember-test-helpers';

module('Unit | Initializer | foo', {
  beforeEach(this: TestContext) {
    run(() => {
      this.application = Application.create();
      this.application.deferReadiness();
    });
  },
  afterEach(this: TestContext) {
    destroyApp(this.application);
  }
});

// Replace this with your real tests.
test('it works', function(this: TestContext, assert) {
  initialize(this.application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
