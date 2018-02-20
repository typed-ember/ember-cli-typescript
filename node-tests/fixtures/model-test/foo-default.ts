import { moduleForModel, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleForModel('foo', 'Unit | Model | foo', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(this: TestContext, assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
