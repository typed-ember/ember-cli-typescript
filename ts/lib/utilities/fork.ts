import * as ChildProcess from 'child_process';

const REGISTER_TS_NODE_PATH = `${__dirname}/../../../register-ts-node`;

export default function fork(path: string) {
  let child = ChildProcess.fork(path, [], {
    execArgv: execArgs()
  });

  // Terminate the child when ember-cli shuts down
  process.on('exit', () => child.kill());

  return child;
}

function execArgs() {
  // If we're running in a TypeScript file, we need to register ts-node for the child too
  if (isTypeScript()) {
    return ['-r', REGISTER_TS_NODE_PATH];
  } else {
    return [];
  }
}

function isTypeScript() {
  return __filename.endsWith('.ts');
}
