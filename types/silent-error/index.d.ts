
declare class SilentError extends Error {
  constructor(message: string);
  name: 'SilentError';
  isSilentError: true;

  static debugOrThrow(e: Error): never;
  static debugOrThrow(label: string, e: Error): never;
}

export = SilentError;
