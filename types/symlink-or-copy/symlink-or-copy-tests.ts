var symlinkOrCopySync = require('symlink-or-copy').sync;

symlinkOrCopySync('src_dir/some_file.txt', 'dest_dir/some_file.txt');
symlinkOrCopySync('src_dir/some_dir', 'dest_dir/some_dir');
