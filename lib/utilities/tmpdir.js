'use strict';

const os = require('os');
const fs = require('fs');

// Watchman gets upset when it receives non-canonical paths as watch roots
module.exports = () => fs.realpathSync(os.tmpdir());
