import UI = require('console-ui');

const ui = new UI({
  inputStream: process.stdin,
  // outputStream: process.stdout,
  // errorStream: process.stderr,
  writeLevel: 'DEBUG',
  ci: true
});

ui.write('message');
ui.write('message', 'ERROR'); // specify  writelevel
ui.writeLine('message');
ui.writeLine('message', 'ERROR'); // specify  writelevel
ui.writeDebugLine('message');
ui.writeInfoLine('message');
ui.writeWarnLine('message');
ui.writeDeprecateLine('some message', true); // pass boolean as second argument indicating if deprecated or not
ui.writeError(new Error('test'));
ui.setWriteLevel('DEBUG');
ui.startProgress('building...');
ui.stopProgress();
ui.prompt([], answers => {});
ui.writeLevelVisible('DEBUG'); // => true | false
