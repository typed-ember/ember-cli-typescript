import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext } from 'ember-test-helpers';

module('Integration | Helper | foo/bar-baz', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(this: TestContext, assert) {
    this.set('inputValue', '1234');

    await render(hbs`{{foo/bar-baz inputValue}}`);

    assert.equal(this.element.textContent.trim(), '1234');
  });
});
