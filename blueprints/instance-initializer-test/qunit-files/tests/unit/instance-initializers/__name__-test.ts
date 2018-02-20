import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from '<%= dasherizedModulePrefix %>/instance-initializers/<%= dasherizedModuleName %>';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import { TestContext } from 'ember-test-helpers';

module('<%= friendlyTestName %>', {
  beforeEach(this: TestContext) {
    run(() => {
      this.application = Application.create();
      this.appInstance = this.application.buildInstance();
    });
  },
  afterEach(this: TestContext) {
    run(this.appInstance, 'destroy');
    destroyApp(this.application);
  }
});

// Replace this with your real tests.
test('it works', function(this: TestContext, assert) {
  initialize(this.appInstance);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
