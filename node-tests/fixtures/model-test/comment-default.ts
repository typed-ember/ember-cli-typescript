import { moduleForModel, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleForModel('comment', 'Unit | Model | comment', {
  // Specify the other units that are required for this test.
  needs: ['model:post', 'model:user']
});

test('it exists', function(this: TestContext, assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
