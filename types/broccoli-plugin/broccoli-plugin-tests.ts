import Plugin = require('broccoli-plugin');
import path = require('path');
import * as fs from "fs";
import {Node} from "broccoli";

interface MyPluginOptions {
  annotation?: string;
}

class MyPlugin extends Plugin {
  options: MyPluginOptions;

  constructor(inputNodes: Node[], options: MyPluginOptions = {}) {
    super(inputNodes, { annotation: options.annotation });
    this.options = options;
  }

  build() {
    // Read files from this.inputPaths, and write files to this.outputPath.
    // Silly example:

    // Read 'foo.txt' from the third input node
    var inputBuffer = fs.readFileSync(path.join(this.inputPaths[2], 'foo.txt'));
    var outputBuffer = someCompiler(inputBuffer);
    // Write to 'bar.txt' in this node's output
    fs.writeFileSync(path.join(this.outputPath, 'bar.txt'), outputBuffer);
  };
}

declare function someCompiler(input: any): any;
