'use strict';

const fs = require('fs-extra');
const path = require('path');
const stringUtil = require('ember-cli-string-utils');
const Blueprint = require('ember-cli/lib/models/blueprint'); // eslint-disable-line node/no-unpublished-require
const stringifyAndNormalize = require('ember-cli/lib/utilities/stringify-and-normalize'); // eslint-disable-line node/no-unpublished-require
const updatePathsForAddon = require('../../lib/utilities/update-paths-for-addon');

module.exports = {
  description: 'The blueprint for addon in repo ember-cli addons.',

  beforeInstall(options) {
    let libBlueprint = Blueprint.lookup('lib', {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
    });

    return libBlueprint.install(options);
  },

  afterInstall(options) {
    this._generatePackageJson(options, true);
    this._updateTsconfigJson(options, true);
  },

  afterUninstall(options) {
    this._generatePackageJson(options, false);
    this._updateTsconfigJson(options, false);
  },

  _generatePackageJson(options, isInstall) {
    let packagePath = path.join(this.project.root, 'package.json');
    let contents = this._readJsonSync(packagePath);
    let name = stringUtil.dasherize(options.entity.name);
    let newPath = ['lib', name].join('/');
    let paths;

    contents['ember-addon'] = contents['ember-addon'] || {};
    paths = contents['ember-addon']['paths'] = contents['ember-addon']['paths'] || [];

    if (isInstall) {
      if (paths.indexOf(newPath) === -1) {
        paths.push(newPath);
        contents['ember-addon']['paths'] = paths.sort();
      }
    } else {
      let newPathIndex = paths.indexOf(newPath);
      if (newPathIndex > -1) {
        paths.splice(newPathIndex, 1);
        if (paths.length === 0) {
          delete contents['ember-addon']['paths'];
        }
      }
    }

    this._writeFileSync(packagePath, stringifyAndNormalize(contents));
  },

  _updateTsconfigJson(options, isInstall) {
    const tsconfigPath = path.join(this.project.root, 'tsconfig.json');
    const addonName = stringUtil.dasherize(options.entity.name);
    const appName = this.project.isEmberCLIAddon() ? 'dummy' : this.project.name();
    const addonPath = ['lib', addonName].join('/');
    let contents = this._readJsonSync(tsconfigPath);
    contents['compilerOptions'] = contents['compilerOptions'] || {};
    contents['include'] = contents['include'] || [];
    let paths = contents['compilerOptions']['paths'];

    if (isInstall) {
      updatePathsForAddon(paths, addonName, appName);
      if (contents['include'].indexOf(addonPath) === -1) {
        contents['include'].push(addonPath);
      }
    } else {
      updatePathsForAddon(paths, addonName, appName, { removePaths: true });
      let addonPathIndex = contents['include'].indexOf(addonPath);
      if (addonPathIndex > -1) {
        contents['include'].splice(addonPathIndex, 1);
      }
    }

    this._writeFileSync(tsconfigPath, stringifyAndNormalize(contents));
  },

  _readJsonSync(path) {
    return fs.readJsonSync(path);
  },

  _writeFileSync(path, content) {
    fs.writeFileSync(path, content);
  },
};
