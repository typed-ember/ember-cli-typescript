import { moduleFor, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleFor('transform:<%= dasherizedModuleName %>', '<%= friendlyTestDescription %>', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
});

// Replace this with your real tests.
test('it exists', function(this: TestContext, assert) {
  let transform = this.subject();
  assert.ok(transform);
});
