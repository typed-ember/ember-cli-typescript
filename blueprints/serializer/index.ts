import extendFromApplicationEntity = require('../../lib/utilities/extend-from-application-entity');
import Blueprint = require("ember-cli/lib/models/blueprint");
import TestFrameworkDetector = require('../test-framework-detector');
import {BlueprintOptions} from "ember-cli/lib/models/blueprint";

declare module "ember-cli/lib/models/blueprint" {
  interface BlueprintOptions {
    baseClass?: string;
  }
}

export = Blueprint.extend({
  description: 'Generates an ember-data serializer.',

  availableOptions: [
    { name: 'base-class', type: String }
  ],

  locals: function(options: BlueprintOptions) {
    return extendFromApplicationEntity('serializer', 'DS.JSONAPISerializer', options);
  }
});
