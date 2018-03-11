import Registry = require('ember-cli-preprocess-registry');
import {Node} from "broccoli";

module.exports = {
  name: 'special-js-sauce',

  setupPreprocessorRegistry(type: 'self' | 'parent', registry: Registry) {
    if (type !== 'parent') { return; }

    registry.add('js', {
      name: 'special-js-sauce-preprocessor',
      toTree(tree) {
        // do your thing here....
        return tree;
      }
    });
  }
};

class SpecialSauce {
  get name() { return 'special-sauce'; }

  toTree(tree: Node) {
    // return new tree after processing
    return tree;
  }
}

declare const registry: Registry;
registry.add('js', new SpecialSauce);
