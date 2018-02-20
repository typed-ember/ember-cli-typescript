import { moduleForModel, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleForModel('application', 'Unit | Serializer | application', {
  // Specify the other units that are required for this test.
  needs: ['serializer:application']
});

// Replace this with your real tests.
test('it serializes records', function(this: TestContext, assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
