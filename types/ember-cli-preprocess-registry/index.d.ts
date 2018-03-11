import { Node as Tree } from 'broccoli';

interface Plugin {
  name: string;
  ext?: string;
  [key: string]: any;
  toTree(...args: any[]): Tree;
}

interface JsPlugin extends Plugin {
  toTree(original: Tree, inputPath: string, outputPath: string, options: { registry: Registry, annotation?: string }): Tree;
}

interface CssPlugin extends Plugin {
  toTree(original: Tree, inputPath: string, outputPath: string, options: { registry: Registry, outputPaths: string }): Tree;
}

interface MinifyCssPlugin extends Plugin {
  toTree(original: Tree, options: { registry: Registry, outputPaths: string, minifyCSS: object }): Tree;
}

interface TemplatePlugin extends Plugin {
  toTree(original: Tree, options: { registry: Registry, annotation?: string }): Tree;
}

declare class Registry {
  add(type: 'js', plugin: JsPlugin): void;
  add(type: 'css', plugin: CssPlugin): void;
  add(type: 'minify-css', plugin: MinifyCssPlugin): void;
  add(type: 'template', plugin: TemplatePlugin): void;
  add(type: string, plugin: Plugin): void;

  load(type: string): Plugin[];
  extensionsForType(type: string): string[];
  remove(type: string, plugin: Plugin): void;
}

export = Registry;
