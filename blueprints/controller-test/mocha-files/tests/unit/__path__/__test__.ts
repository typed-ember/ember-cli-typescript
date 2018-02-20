import { expect } from 'chai';
import { describeModule, it } from 'ember-mocha';
import { TestContext } from 'ember-test-helpers';

describeModule('controller:<%= dasherizedModuleName %>', '<%= friendlyTestDescription %>',
  {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  },
  function() {
    // Replace this with your real tests.
    it('exists', function(this: TestContext) {
      let controller = this.subject();
      expect(controller).to.be.ok;
    });
  }
);
