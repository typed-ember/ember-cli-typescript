import pathUtils = require('ember-cli-path-utils');

pathUtils.getRelativeParentPath('foo/bar/baz'); // '../../../'
pathUtils.getRelativeParentPath('foo/bar/baz', 2); // '../'
pathUtils.getRelativeParentPath('foo', -1); // '../../'
pathUtils.getRelativePath('foo/bar/baz'); // '../../'
pathUtils.getRelativePath('foo/bar/baz', 2); // './'
