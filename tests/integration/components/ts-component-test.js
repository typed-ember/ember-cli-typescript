import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ts component', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{ts-component}}`);

    assert.equal(
      this.element.textContent.replace(/\s+/g, ' ').trim(),
      'ts-component.hbs Component defines someValue property as: from component Ts helper: my type of help Js helper: js please help me'
    );
  });
});
