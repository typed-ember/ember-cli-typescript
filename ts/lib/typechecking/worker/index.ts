import resolve from 'resolve';
import { defer } from 'rsvp';
import logger from 'debug';
import {
  Diagnostic,
  FileWatcherEventKind,
  SemanticDiagnosticsBuilderProgram,
  CompilerOptions,
  WatchOfConfigFile,
  WatchCompilerHostOfConfigFile,
} from 'typescript';

const debug = logger('ember-cli-typescript:typecheck-worker');

// The compiler has a hard-coded 250ms wait between when it last sees an FS event and when it actually
// begins a new build. Since we can't know ahead of time whether a given file change will necessarily
// trigger a new check, we assume it will and set a timer to go back to the previous resolution if
// a new check doesn't actually start.
// https://github.com/Microsoft/TypeScript/blob/c0587191fc536ca62b68748b0e47072e6f881968/src/compiler/watch.ts#L812-L825
const TYPECHECK_TIMEOUT = 300;

interface TypecheckStatus {
  errors: string[];
  failed: boolean;
}

export default class TypecheckWorker {
  private typecheckListeners: Array<(status: TypecheckStatus) => void> = [];
  private isChecking = true;
  private status = defer<TypecheckStatus>();
  private lastSettledStatus = this.status;
  private typecheckTimeout?: NodeJS.Timer;

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

  private mayTypecheck(filePath: string) {
    debug('File change at %s; watching for new typecheck', filePath);

    this.beginCheck();
    this.typecheckTimeout = setTimeout(() => {
      debug(`File change didn't result in a typecheck; resolving`);
      this.isChecking = false;
      this.status.resolve(this.lastSettledStatus.promise);
    }, TYPECHECK_TIMEOUT);
  }

  private willTypecheck() {
    debug('Typecheck starting');

    this.beginCheck();
  }

  private didTypecheck(diagnostics: ReadonlyArray<Diagnostic>) {
    if (this.isChecking) {
      debug('Typecheck complete (%d diagnostics)', diagnostics.length);

      let status = this.makeStatus(diagnostics);

      this.isChecking = false;
      this.status.resolve(status);
      this.lastSettledStatus = this.status;

      for (let listener of this.typecheckListeners) {
        listener(status);
      }
    }
  }

  private beginCheck() {
    if (this.typecheckTimeout !== undefined) {
      clearTimeout(this.typecheckTimeout);
    }

    if (!this.isChecking) {
      this.isChecking = true;
      this.status = defer();
    }
  }

  private formatDiagnostic(diagnostic: Diagnostic) {
    return this.ts.formatDiagnosticsWithColorAndContext([diagnostic], {
      getCanonicalFileName: (path) => path,
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
  private patchCompilerHostMethods(
    host: WatchCompilerHostOfConfigFile<SemanticDiagnosticsBuilderProgram>
  ) {
    let { watchFile, watchDirectory, afterProgramCreate = () => {} } = host;

    // Intercept tsc's `watchFile` to also invoke `mayTypecheck()` when a watched file changes
    host.watchFile = (path, callback, pollingInterval?) => {
      return watchFile.call(
        host,
        path,
        (filePath: string, eventKind: FileWatcherEventKind) => {
          this.mayTypecheck(filePath);
          return callback(filePath, eventKind);
        },
        pollingInterval
      );
    };

    // Intercept tsc's `watchDirectory` callback to also invoke `mayTypecheck()` when a
    // file is added or removed in a watched directory.
    host.watchDirectory = (path, callback, recursive?) => {
      return watchDirectory.call(
        host,
        path,
        (filePath: string) => {
          this.mayTypecheck(filePath);
          return callback(filePath);
        },
        recursive
      );
    };

    // Intercept `afterProgramCreate` to confirm when a suspected typecheck is happening
    // and schedule the new diagnostics to be emitted.
    host.afterProgramCreate = (program) => {
      this.willTypecheck();

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
    let errors = diagnostics.map((d) => this.formatDiagnostic(d));
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
