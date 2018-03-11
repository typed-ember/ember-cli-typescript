import normalizeEntityName = require('ember-cli-normalize-entity-name');
import Blueprint = require("ember-cli/lib/models/blueprint");

export = Blueprint.extend({
  description: 'Generates a helper function.',
  normalizeEntityName
});
