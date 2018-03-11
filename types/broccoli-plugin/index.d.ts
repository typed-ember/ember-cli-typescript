import { Node, ObjectNode} from "broccoli";

interface Options {
  name?: string;
  annotation?: string;
  persistentOutput?: boolean;
  needsCache?: boolean;
}

declare interface Plugin extends ObjectNode {}
declare abstract class Plugin {
  constructor(inputNodes: Node[], options?: Options);

  inputPaths: string[];
  outputPath: string;
  cachePath?: string;

  /**
   * Plugin subclasses must implement a .build() function
   */
  abstract build(): void;

  rebuild: {
    (): void;
    ['For compatibility, plugins must not define a plugin.rebuild() function']: any;
  };
  read: {
    (readTree: any): Promise<any>;
    ['For compatibility, plugins must not define a plugin.read() function']: any;
  };
  cleanup: {
    (): void;
    ['For compatibility, plugins must not define a plugin.cleanup() function']: any;
  };
}

export = Plugin;
