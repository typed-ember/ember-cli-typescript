declare module 'broccoli-stew' {
  import { Node as BroccoliNode } from 'broccoli-node-api';
  import Plugin from 'broccoli-plugin';

  export function afterBuild(node: BroccoliNode, callback: (this: Plugin) => void): BroccoliNode;
}
