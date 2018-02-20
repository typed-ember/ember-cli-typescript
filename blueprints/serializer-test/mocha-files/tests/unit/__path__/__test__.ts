import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';
import { TestContext } from 'ember-test-helpers';

describe('<%= friendlyTestDescription %>', function() {
  setupModelTest('<%= dasherizedModuleName %>', {
    // Specify the other units that are required for this test.
    needs: ['serializer:<%= dasherizedModuleName %>']
  });

  // Replace this with your real tests.
  it('serializes records', function(this: TestContext) {
    let record = this.subject();

    let serializedRecord = record.serialize();

    expect(serializedRecord).to.be.ok;
  });
});
