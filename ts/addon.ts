import semver from 'semver';
import { hasPlugin, addPlugin, AddPluginOptions } from 'ember-cli-babel-plugin-helpers';
import Addon from 'ember-cli/lib/models/addon';
import { addon } from './lib/utilities/ember-cli-entities';

export default addon({
  name: 'ember-cli-typescript',

  included() {
    this._super.included.apply(this, arguments);
    this._checkDevelopment();
    this._checkBabelVersion();
  },

  includedCommands() {
    if (this.project.isEmberCLIAddon()) {
      return {
        'ts:precompile': require('./lib/commands/precompile'),
        'ts:clean': require('./lib/commands/clean'),
      };
    }
  },

  blueprintsPath() {
    return `${__dirname}/blueprints`;
  },

  setupPreprocessorRegistry(type: string) {
    if (type !== 'parent') return;

    // Normally this is the sort of logic that would live in `included()`, but
    // ember-cli-babel reads the configured extensions when setting up the
    // preprocessor registry, so we need to beat it to the punch.
    this._registerBabelExtension();

    this._addPluginIfMissing('@babel/plugin-transform-typescript');
    this._addPluginIfMissing(
      '@babel/plugin-proposal-class-properties',
      { loose: true },
      {
        // Needs to come after the decorators plugin, if present
        after: ['@babel/plugin-proposal-decorators'],
      }
    );
  },

  shouldIncludeChildAddon(addon) {
    // For testing, we have dummy in-repo addons set up, but e-c-ts doesn't depend on them;
    // its dummy app does. Otherwise we'd have a circular dependency.
    return !['in-repo-a', 'in-repo-b'].includes(addon.name);
  },

  _checkBabelVersion() {
    let babel = this.parent.addons.find(addon => addon.name === 'ember-cli-babel');
    if (!babel || !semver.satisfies(babel.pkg.version, '>=7.0.0-alpha.0 <8')) {
      let version = babel ? `version ${babel.pkg.version}` : `no instance of ember-cli-babel`;
      this.ui.writeWarnLine(
        `ember-cli-typescript requires ember-cli-babel@7, but you have ${version} installed; ` +
          'your TypeScript files may not be transpiled correctly.'
      );
    }
  },

  _checkDevelopment() {
    if (this.isDevelopingAddon() && !process.env.CI && __filename.endsWith('.js')) {
      this.ui.writeWarnLine(
        'ember-cli-typescript is in development but not being loaded from `.ts` sources — ' +
          'do you have compiled artifacts lingering in `/js`?'
      );
    }
  },

  _addPluginIfMissing(name: string, config?: unknown, constraints?: AddPluginOptions) {
    let target = this._getConfigurationTarget();

    if (!hasPlugin(target, name)) {
      addPlugin(target, [require.resolve(name), config], constraints);
    }
  },

  _getConfigurationTarget() {
    // If `this.app` isn't present, we know `this.parent` is an addon
    return this.app || (this.parent as Addon);
  },

  _registerBabelExtension() {
    let target = this._getConfigurationTarget();
    let options: Record<string, any> = target.options || (target.options = {});
    let babelAddonOptions: Record<string, any> =
      options['ember-cli-babel'] || (options['ember-cli-babel'] = {});
    let extensions: string[] =
      babelAddonOptions.extensions || (babelAddonOptions.extensions = ['js']);

    if (!extensions.includes('ts')) {
      extensions.push('ts');
    }
  },
});
