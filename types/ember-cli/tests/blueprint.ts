import Blueprint = require("ember-cli/lib/models/blueprint");

const CustomBlueprint = Blueprint.extend({
  availableOptions: [
    { name: 'stage', type: String, aliases: ['s'], default: 'dev' },
    { name: 'clean', type: Boolean, default: false, aliases: ['c'] },
    { name: 'port', type: Number, default: 3000, aliases: ['p'] },
    { name: 'version', type: String }
  ]
});
