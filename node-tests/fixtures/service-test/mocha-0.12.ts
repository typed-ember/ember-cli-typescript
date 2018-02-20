import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { TestContext } from 'ember-test-helpers';

describe('Unit | Service | foo', function() {
  setupTest('service:foo', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  it('exists', function(this: TestContext) {
    let service = this.subject();
    expect(service).to.be.ok;
  });
});
