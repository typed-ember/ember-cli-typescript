import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

module('transform:foo', 'Unit | Transform | foo', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(this: TestContext, assert) {
    let transform = this.owner.lookup('transform:foo');
    assert.ok(transform);
  });
});
