import { moduleFor, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleFor('service:foo', 'Unit | Service | foo', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('it exists', function(this: TestContext, assert) {
  let service = this.subject();
  assert.ok(service);
});
