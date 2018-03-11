import SilentError = require("silent-error");

async function runCommand(name: string) {
  // some logic
  throw new SilentError(`command: '${name}' is not installed`);
}

async function caller() {

  try {
    await runCommand('foo');
  } catch(e) {
    SilentError.debugOrThrow(e);
  }

  SilentError.debugOrThrow
}
