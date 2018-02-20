import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { TestContext } from 'ember-test-helpers';

describe('<%= friendlyTestDescription %>', function() {
  setupTest('adapter:<%= dasherizedModuleName %>', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  it('exists', function(this: TestContext) {
    let adapter = this.subject();
    expect(adapter).to.be.ok;
  });
});
