
import getPathOption = require('ember-cli-get-component-path-option');

getPathOption({}); // 'components'
getPathOption({ path: '' }); // ''
getPathOption({ path: 'foo/bar' }); // 'foo/bar'
