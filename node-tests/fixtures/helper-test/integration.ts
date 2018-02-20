import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { TestContext } from 'ember-test-helpers';

moduleForComponent('foo/bar-baz', 'helper:foo/bar-baz', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(this: TestContext, assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{foo/bar-baz inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});
