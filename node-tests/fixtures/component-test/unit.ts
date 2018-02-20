import { moduleForComponent, test } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

moduleForComponent('x-foo', 'Unit | Component | x-foo', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true
});

test('it renders', function(this: TestContext, assert) {
  
  // Creates the component instance
  /*let component =*/ this.subject();
  // Renders the component to the page
  this.render();
  assert.equal(this.$().text().trim(), '');
});
