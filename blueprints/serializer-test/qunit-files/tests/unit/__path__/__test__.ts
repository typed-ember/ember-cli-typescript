import { moduleForModel, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleForModel('<%= dasherizedModuleName %>', '<%= friendlyTestDescription %>', {
  // Specify the other units that are required for this test.
  needs: ['serializer:<%= dasherizedModuleName %>']
});

// Replace this with your real tests.
test('it serializes records', function(this: TestContext, assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
