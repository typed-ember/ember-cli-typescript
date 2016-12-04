import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ts-component', 'Integration | Component | ts component', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{ts-component}}`);

  assert.equal(this.$().text().replace(/\s+/g,' ').trim(), 'ts-component.hbs Component defines someValue property as: from component');
  
});
