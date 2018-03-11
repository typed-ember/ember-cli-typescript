
interface Options {
  directories?: boolean;
  globs?: ReadonlyArray<string>;
  ignore?: ReadonlyArray<string>;
}

interface Entry {
  relativePath: string;
  mode: number;
  size: number;
  mtime: number;
  isDirectory(): boolean;
}

declare function walkSync(baseDir: string, options?: Options): string[];
declare namespace walkSync {
  function entries(baseDir: string, options?: Options): Entry[];
}

export = walkSync;
