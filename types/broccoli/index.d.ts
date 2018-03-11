
interface SourceNode {
  name: string;
  annotation?: string;
  instantiationStack: string;
  nodeType: 'source';
  sourceDirectory: string;
  watched: boolean;
}

interface CallbackObject {
  build(): Promise<any> | void;
}

interface TransformNode {
  name: string;
  annotation?: string;
  instantiationStack: string;
  nodeType: 'transform';
  inputNodes: Node[];
  setup(inputPaths: string[], outputPath: string, cachePath: string): void;
  getCallbackObject(): CallbackObject;
  persistentOutput: boolean;
  needsCache: boolean;
}

interface Features {
  persistentOutputFlag?: boolean,
  sourceDirectories?: boolean
}

export interface ObjectNode {
  __broccoliFeatures__: Features;
  __broccoliGetInfo__(builderFeatures: Features): SourceNode | TransformNode;
}

type StringNode = string;

export type Node = ObjectNode | StringNode;
