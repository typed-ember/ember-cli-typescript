import { moduleFor, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleFor('adapter:foo', 'Unit | Adapter | foo', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
});

// Replace this with your real tests.
test('it exists', function(this: TestContext, assert) {
  let adapter = this.subject();
  assert.ok(adapter);
});
