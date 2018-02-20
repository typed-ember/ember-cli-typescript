import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

module('Unit | Route | foo', function(hooks) {
  setupTest(hooks);

  test('it exists', function(this: TestContext, assert) {
    let route = this.owner.lookup('route:foo');
    assert.ok(route);
  });
});
