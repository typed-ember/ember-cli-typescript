import BroccoliMergeTrees = require('broccoli-merge-trees');

new BroccoliMergeTrees(['public', 'scripts']);
new BroccoliMergeTrees(['public', 'scripts'], { overwrite: true });
