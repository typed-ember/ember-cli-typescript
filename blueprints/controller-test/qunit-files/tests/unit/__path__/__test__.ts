import { moduleFor, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleFor('controller:<%= dasherizedModuleName %>', '<%= friendlyTestDescription %>', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

// Replace this with your real tests.
test('it exists', function(this: TestContext, assert) {
  let controller = this.subject();
  assert.ok(controller);
});
