import testInfo = require('ember-cli-test-info');

testInfo.humanize('my-cool-feature'); // 'my cool feature'
testInfo.name('my-cool-feature', 'Acceptance', null); // 'Acceptance | my cool feature'
testInfo.name('my-Mixin', 'Unit', 'Mixin'); // 'Unit | Mixin | my mixin'
testInfo.description('x-foo', 'Unit', 'Component'); // 'Unit | Component | x foo'
