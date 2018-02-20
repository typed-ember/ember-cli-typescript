import { moduleForModel, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleForModel('foo', 'Unit | Serializer | foo', {
  // Specify the other units that are required for this test.
  needs: ['serializer:foo']
});

// Replace this with your real tests.
test('it serializes records', function(this: TestContext, assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
