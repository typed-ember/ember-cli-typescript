import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | js importing ts', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{js-importing-ts}}`);

    assert.equal(
      this.element.textContent.replace(/\s+/g, ' ').trim(),
      'js-importing-ts.hbs false Ts helper: my type of help Js helper: js please help me'
    );
  });
});
