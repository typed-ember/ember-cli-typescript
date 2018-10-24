import resolve from 'resolve';
import { defer } from 'rsvp';
import {
  Diagnostic,
  FileWatcherEventKind,
  SemanticDiagnosticsBuilderProgram,
  CompilerOptions,
  WatchOfConfigFile,
  WatchCompilerHostOfConfigFile,
} from 'typescript';

interface TypecheckStatus {
  errors: string[];
  failed: boolean;
}

export default class TypecheckWorker {
  private typecheckListeners: Array<(status: TypecheckStatus) => void> = [];
  private isChecking = true;
  private status = defer<TypecheckStatus>();

  private projectRoot!: string;
  private ts!: typeof import('typescript');
  private watch!: WatchOfConfigFile<SemanticDiagnosticsBuilderProgram>;
  private compilerOptions!: CompilerOptions;

  /**
   * Begin project typechecking, loading TypeScript from the given project root.
   */
  public start(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.ts = this.loadTypeScript();
    this.watch = this.ts.createWatchProgram(this.buildWatchHost());
    this.compilerOptions = this.watch.getProgram().getCompilerOptions();
  }

  /**
   * Returns the current typechecking status, blocking until complete if a
   * check is currently in progress.
   */
  public getStatus(): Promise<TypecheckStatus> {
    return this.status.promise;
  }

  /**
   * Accepts a callback that will be invoked any time a check completes,
   * receiving a `TypecheckStatus` payload describing the results.
   */
  public onTypecheck(listener: (status: TypecheckStatus) => void): void {
    this.typecheckListeners.push(listener);
  }

  private loadTypeScript() {
    return require(resolve.sync('typescript', { basedir: this.projectRoot }));
  }

  private willTypecheck() {
    if (!this.isChecking) {
      this.status = defer();
      this.isChecking = true;
    }
  }

  private didTypecheck(diagnostics: ReadonlyArray<Diagnostic>) {
    let status = this.makeStatus(diagnostics);

    this.isChecking = false;
    this.status.resolve(status);

    for (let listener of this.typecheckListeners) {
      listener(status);
    }
  }

  private formatDiagnostic(diagnostic: Diagnostic) {
    return this.ts.formatDiagnosticsWithColorAndContext([diagnostic], {
      getCanonicalFileName: path => path,
      getCurrentDirectory: this.ts.sys.getCurrentDirectory,
      getNewLine: () => this.ts.sys.newLine,
    });
  }

  private buildWatchHost() {
    let host = this.ts.createWatchCompilerHost(
      this.findConfigFile(),
      { noEmit: true },
      this.ts.sys,
      this.ts.createSemanticDiagnosticsBuilderProgram,
      // Pass noop functions for reporters because we want to print our own output
      () => {},
      () => {}
    );

    return this.patchCompilerHostMethods(host);
  }

  // The preferred means of being notified when things happen in the compiler is
  // overriding methods and then calling the original. See the TypeScript wiki:
  // https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
  private patchCompilerHostMethods(host: WatchCompilerHostOfConfigFile<SemanticDiagnosticsBuilderProgram>) {
    let { watchFile, watchDirectory, afterProgramCreate = () => {} } = host;

    // Intercept tsc's `watchFile` to also invoke `didTypecheck()` when a `.ts` file changes
    host.watchFile = (path, callback, pollingInterval?) => {
      return watchFile.call(host, path, (filePath: string, eventKind: FileWatcherEventKind) => {
        this.willTypecheck();
        return callback(filePath, eventKind);
      }, pollingInterval);
    };

    // Intercept tsc's `watchDirectory` callback to also invoke `didTypecheck()` when a
    // `.ts` file is added to a watched directory
    host.watchDirectory = (path, callback, recursive?) => {
      return watchDirectory.call(host, path, (filePath: string) => {
        if (filePath.endsWith('.ts')) {
          this.willTypecheck();
        }
        return callback(filePath);
      }, recursive);
    };

    host.afterProgramCreate = program => {
      // The `afterProgramCreate` callback will be invoked synchronously when we first call
      // `createWatchProgram`, meaning we can enter `didTypecheck` before we're fully set up
      // (e.g. before `compilerOptions` has been set). We use `nextTick` to ensure that
      // `didTypecheck` is only ever invoked after the worker is fully ready.
      process.nextTick(() => this.didTypecheck(program.getSemanticDiagnostics()));

      return afterProgramCreate.call(host, program);
    };

    return host;
  }

  private makeStatus(diagnostics: ReadonlyArray<Diagnostic>): TypecheckStatus {
    let errors = diagnostics.map(d => this.formatDiagnostic(d));
    let failed = !!(this.compilerOptions.noEmitOnError && errors.length);
    return { errors, failed };
  }

  private findConfigFile() {
    let configPath = this.ts.findConfigFile(
      this.projectRoot,
      this.ts.sys.fileExists,
      'tsconfig.json'
    );

    if (!configPath) {
      throw new Error(`Unable to locate tsconfig.json for project at ${this.projectRoot}`);
    }

    return configPath;
  }
}
