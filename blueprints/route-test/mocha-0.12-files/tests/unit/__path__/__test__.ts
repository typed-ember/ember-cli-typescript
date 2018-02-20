import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { TestContext } from 'ember-test-helpers';

describe('<%= friendlyTestDescription %>', function() {
  setupTest('route:<%= moduleName %>', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  it('exists', function(this: TestContext) {
    let route = this.subject();
    expect(route).to.be.ok;
  });
});
