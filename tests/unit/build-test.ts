import { module, test } from 'qunit';

import addonFileA from 'in-repo-a/test-file';
import addonFileB from 'in-repo-b/test-file';
import fileA from 'dummy/a';
import fileB from 'dummy/b';
import shadowedFile from 'dummy/shadowed-file';

module('Unit | Build');

test('in-repo addons\' addon trees wind up in the right place', function(assert) {
  assert.equal(addonFileA, 'in-repo-a/test-file');
  assert.equal(addonFileB, 'in-repo-b/test-file');
});

test('in-repo addons\' app trees wind up in the right place', function(assert) {
  assert.equal(fileA, 'dummy/a');
  assert.equal(fileB, 'dummy/b');
});

test('app files aren\'t shadowed by addons\' app tree files', function(assert) {
  assert.equal(shadowedFile, 'dummy/shadowed-file');
});
