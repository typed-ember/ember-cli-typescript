import fs from 'fs-extra';

const PACKAGE_PATH = 'node_modules/ember-cli-typescript';

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
    await fs.move(PACKAGE_PATH, `${PACKAGE_PATH}.published`);
  });

  hooks.afterAll(async () => {
    await fs.move(`${PACKAGE_PATH}.published`, PACKAGE_PATH);
  });
}
