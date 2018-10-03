import { module, test } from 'qunit';

import addonFileA from 'in-repo-a/test-file';
import addonFileB from 'in-repo-b/test-file';
import fileA from 'dummy/a';
import fileB from 'dummy/b';
import shadowedFile from 'dummy/shadowed-file';
import { description as fromAts } from 'in-repo-a/test-support/from-ats';
import { description as fromTs } from 'dummy/tests/from-ts';

module('Unit | Build', function() {
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

  test('addon\'s addon-test-support files end up in <addon-name>/test-support/*', function (assert) {
    assert.ok(fromAts);
    assert.equal(fromAts, 'From addon-test-support');
  });

  test('addon\'s test-support files end up in dummy/tests/*', function (assert) {
    assert.ok(fromTs);
    assert.equal(fromTs, 'From test-support');
  });
});
