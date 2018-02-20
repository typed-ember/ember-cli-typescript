<% if (testType === 'integration') { %>import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext } from 'ember-test-helpers';

module('<%= friendlyTestDescription %>', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(this: TestContext, assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{<%= componentPathName %>}}`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#<%= componentPathName %>}}
        template block text
      {{/<%= componentPathName %>}}
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});<% } else if (testType === 'unit') { %>import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';

module('<%= friendlyTestDescription %>', function(hooks) {
  setupTest(hooks);

  test('it exists', function(this: TestContext, assert) {
    let component = this.owner.factoryFor('component:<%= componentPathName %>').create();
    assert.ok(component);
  });
});<% } %>
