import os = require('os');
import fs = require('fs');

// Watchman gets upset when it receives non-canonical paths as watch roots
export default () => fs.realpathSync(os.tmpdir());
