import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { TestContext } from 'ember-test-helpers';

describe('Integration | Helper | foo/bar-baz', function() {
  setupComponentTest('foo/bar-baz', {
    integration: true
  });

  it('renders', function(this: TestContext) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#foo/bar-baz}}
    //     template content
    //   {{/foo/bar-baz}}
    // `);
    this.set('inputValue', '1234');

    this.render(hbs`{{foo/bar-baz inputValue}}`);

    expect(this.$().text().trim()).to.equal('1234');
  });
});

