import Plugin = require("broccoli-plugin");
import { Node } from 'broccoli';

interface Options {
  overwrite?: boolean;
  annotation?: string;
}

declare interface BroccoliMergeTrees extends Plugin {}
declare class BroccoliMergeTrees {
  constructor(inputNodes: Node[], options?: Options);
}

export = BroccoliMergeTrees;
