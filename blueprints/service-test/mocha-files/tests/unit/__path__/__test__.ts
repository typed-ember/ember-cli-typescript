import { expect } from 'chai';
import { describeModule, it } from 'ember-mocha';
import { TestContext } from 'ember-test-helpers';

describeModule('service:<%= dasherizedModuleName %>', '<%= friendlyTestDescription %>',
  {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  },
  function() {
    // Replace this with your real tests.
    it('exists', function(this: TestContext) {
      let service = this.subject();
      expect(service).to.be.ok;
    });
  }
);
