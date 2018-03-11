import walkSync = require('walk-sync');

var paths: string[] = walkSync('project')
var paths: string[] = walkSync('project', { globs: ['subdir/**/*.txt'] });
var paths: string[] = walkSync('project', { directories: false })
var paths: string[] = walkSync('project', { ignore: ['subdir'] })

let entry = walkSync.entries('project')[0];
entry.relativePath
entry.mode  // => fs.statSync(fullPath).mode
entry.size  // => fs.statSync(fullPath).size
entry.mtime // => fs.statSync(fullPath).mtime.getTime()

entry.isDirectory() // => true if directory
