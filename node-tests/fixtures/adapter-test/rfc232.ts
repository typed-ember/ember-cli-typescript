import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

module('Unit | Adapter | foo', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(this: TestContext, assert) {
    let adapter = this.owner.lookup('adapter:foo');
    assert.ok(adapter);
  });
});
