import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { TestContext } from 'ember-test-helpers';

module('Unit | Serializer | foo', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(this: TestContext, assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('foo');

    assert.ok(serializer);
  });

  test('it serializes records', function(this: TestContext, assert) {
    let store = this.owner.lookup('service:store');
    let record = run(() => store.createRecord('foo', {}));

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
