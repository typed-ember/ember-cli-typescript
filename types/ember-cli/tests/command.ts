import Command = require('ember-cli/lib/models/command');
import path = require('path');

const CustomCommand = Command.extend({
  works: 'everywhere',
  availableOptions: [
    { name: 'environment',  type: String,  default: 'capture', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'host',         type: String,                      aliases: ['H'], description: 'Listens on all interfaces by default' },
    { name: 'output-path',  type: path,    default: 'dist/',   aliases: ['op', 'out'] },
    { name: 'variable',     type: Array,                       aliases: ['var'] },
    { name: 'browserify',   type: Boolean, default: false },
    { name: 'link',         type: String,  default: undefined },
    { name: 'build-config', type: 'Path',                      aliases: ['buildConfig'] },
    { name: 'port',         type: Number,  default: 4200, required: true, key: 'port' },
  ]
});
