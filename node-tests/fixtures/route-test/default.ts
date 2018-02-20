import { moduleFor, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleFor('route:foo', 'Unit | Route | foo', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', function(this: TestContext, assert) {
  let route = this.subject();
  assert.ok(route);
});
