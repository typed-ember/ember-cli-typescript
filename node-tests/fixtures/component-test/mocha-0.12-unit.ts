import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { TestContext } from 'ember-test-helpers';

describe('Unit | Component | x-foo', function() {
  setupComponentTest('x-foo', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  });

  it('renders', function(this: TestContext) {
    // creates the component instance
    let component = this.subject();
    // renders the component on the page
    this.render();
    expect(component).to.be.ok;
    expect(this.$()).to.have.length(1);
  });
});
