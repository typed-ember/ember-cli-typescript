const Command = require('ember-cli/lib/models/command');

module.exports = Command.extend({
  name: 'ts:clean',
  works: 'insideProject',
});
