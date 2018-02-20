import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

module('Unit | Component | x-foo', function(hooks) {
  setupTest(hooks);

  test('it exists', function(this: TestContext, assert) {
    let component = this.owner.factoryFor('component:x-foo').create();
    assert.ok(component);
  });
});
