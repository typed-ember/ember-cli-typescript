import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { TestContext } from 'ember-test-helpers';

module('Unit | Model | foo', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(this: TestContext, assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('foo', {}));
    assert.ok(model);
  });
});
