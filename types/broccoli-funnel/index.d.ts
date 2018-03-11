import Plugin = require('broccoli-plugin');
import { Node } from 'broccoli';

type Filter = string | RegExp | ((path: string) => boolean);

interface Options {
  srcDir?: string;
  destDir?: string;
  allowEmpty?: boolean;
  include?: ReadonlyArray<Filter>;
  exclude?: ReadonlyArray<Filter>;
  files?: string[];
  getDestinationPath?(path: string): string;
}

declare interface Funnel extends Plugin {}
declare class Funnel {
  constructor(inputNode: Node, options?: Options);
}

export = Funnel;
