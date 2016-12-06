import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('js-importing-ts', 'Integration | Component | js importing ts', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{js-importing-ts}}`);

  assert.equal(this.$().text().replace(/\s+/g,' ').trim(), 'js-importing-ts.hbs false Ts helper: my type of help Js helper: js please help me');

});
