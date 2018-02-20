import { expect } from 'chai';
import { describeModule, it } from 'ember-mocha';
import { TestContext } from 'ember-test-helpers';

describeModule('route:<%= moduleName %>', '<%= friendlyTestDescription %>',
  {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  },
  function() {
    it('exists', function(this: TestContext) {
      let route = this.subject();
      expect(route).to.be.ok;
    });
  }
);
