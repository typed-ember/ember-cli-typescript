import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

module('<%= friendlyTestDescription %>', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(this: TestContext, assert) {
    let controller = this.owner.lookup('controller:<%= controllerPathName %>');
    assert.ok(controller);
  });
});
