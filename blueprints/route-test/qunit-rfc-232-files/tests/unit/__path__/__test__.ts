import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

module('<%= friendlyTestDescription %>', function(hooks) {
  setupTest(hooks);

  test('it exists', function(this: TestContext, assert) {
    let route = this.owner.lookup('route:<%= moduleName %>');
    assert.ok(route);
  });
});
