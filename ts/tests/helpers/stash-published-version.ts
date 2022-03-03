import fs from 'fs-extra';

const PACKAGE_PATH = 'node_modules/ember-cli-typescript';

function isNodeError(e: unknown): e is NodeJS.ErrnoException {
  // Not full-proof but good enough for our purposes.
  return e instanceof Error && 'code' in e;
}

function handleError(e: unknown) {
  // Ignore the case where we just don't have the files to move. (And hope this
  // works correctly?)
  if (!isNodeError(e) || e.code !== 'ENOENT') {
    throw e;
  }
}

/**
 * We have assorted devDependencies that themselves depend on `ember-cli-typescript`.
 * This means we have a published copy of the addon present in `node_modules` normally,
 * though `ember-cli-blueprint-test-helpers` fiddles around in there as well.
 *
 * This helper ensures we move the published version of the addon out of the way into
 * an inert location during the enclosing `describe` block and put it back afterwards.
 */
export function setupPublishedVersionStashing(hooks: Mocha.Suite): void {
  hooks.beforeAll(async () => {
    fs.move(PACKAGE_PATH, `${PACKAGE_PATH}.published`).catch();
    try {
      await fs.move(PACKAGE_PATH, `${PACKAGE_PATH}.published`);
    } catch (e: unknown) {
      handleError(e);
    }
  });

  hooks.afterAll(async () => {
    try {
      await fs.move(`${PACKAGE_PATH}.published`, PACKAGE_PATH);
    } catch (e) {
      handleError(e);
    }
  });
}
