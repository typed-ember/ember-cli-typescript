declare module 'fixturify' {
  export interface Directory {
    [key: string]: string | Directory;
  }

  export function readSync(path: string): Directory;
  export function writeSync(path: string, contents: Directory): void;
}
