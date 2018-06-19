'use strict';

const fs = require('fs-extra');
const Funnel = require('broccoli-funnel');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;
const debug = require('debug')('ember-cli-typescript:type-generator-registry');

module.exports = class TypeGeneratorRegistry {
  constructor(addonOrProject, project, typesDir) {
    this._addonOrProject = addonOrProject;
    this._typesDir = typesDir;
    this._generators = [];

    if (this._isTypeGenerator(addonOrProject)) {
      this._setup(addonOrProject, 'self');
    }

    for (let addon of this._findTypeGenerators(addonOrProject, project)) {
      this._setup(addon, 'parent');
    }
  }

  add(generator) {
    this._generators.push(generator);
  }

  process(type, dir, filter) {
    let fullPath = `${this._addonOrProject.root}/${dir}`;
    if (!fs.existsSync(fullPath)) { return; }

    let inputNode = new UnwatchedDir(fullPath);
    if (filter) {
      inputNode = new Funnel(inputNode, filter);
    }

    debug('processing %s/%s (%s)', this._typesDir, dir, fullPath);

    let nodes = this._generators.map(generator => generator.toTree(type, inputNode));
    return nodes.filter(Boolean).map(node => new Funnel(node, { destDir: dir }));
  }

  _findTypeGenerators(addonOrProject, project) {
    // Start with any of the addon's runtime dependencies that are type generators
    let generators = addonOrProject.addons.filter(addon => this._isTypeGenerator(addon));
    let devDeps = addonOrProject.pkg.devDependencies || {};
    let includedNames = new Set(generators.map(generator => generator.name));

    // Then layer on any project type generators that are in the addon's devDeps
    for (let addon of project.addons) {
      if (this._isTypeGenerator(addon) && addon.name in devDeps && !includedNames.has(addon.name)) {
        generators.push(addon);
      }
    }

    return generators;
  }

  _setup(addon, type) {
    debug('setupTypeGeneratorRegistry (%s) for %s', type, addon.name);
    addon.setupTypeGeneratorRegistry(type, this);
  }

  _isTypeGenerator(addon) {
    return typeof addon.setupTypeGeneratorRegistry === 'function';
  }
}
