'use strict';

const fs = require('fs-extra');
const Funnel = require('broccoli-funnel');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;
const TemplateTypeGenerator = require('./template-type-generator');
const debug = require('debug')('ember-cli-typescript:type-generator-registry');

module.exports = class TypeGeneratorRegistry {
  constructor(addonOrProject, typesDir) {
    this._addonOrProject = addonOrProject;
    this._typesDir = typesDir;
    this._generators = [
      // TODO separate addon?
      new TemplateTypeGenerator()
    ];

    this._setup(addonOrProject, 'self');
    for (let addon of addonOrProject.addons) {
      this._setup(addon, 'parent');
    }
  }

  add(generator) {
    this._generators.push(generator);
  }

  process(type, destDir, inputPath, filter) {
    let fullPath = `${this._addonOrProject.root}/${inputPath}`;
    if (!fs.existsSync(fullPath)) { return; }

    let inputNode = new UnwatchedDir(fullPath);
    if (filter) {
      inputNode = new Funnel(inputNode, filter);
    }

    debug('processing %s/%s', this._typesDir, destDir);

    let nodes = this._generators.map(generator => generator.toTree(type, inputNode));
    return nodes.filter(Boolean).map(node => new Funnel(node, { destDir }));
  }

  _setup(addon, type) {
    if (typeof addon.setupTypeGeneratorRegistry === 'function') {
      debug('setupTypeGeneratorRegistry (%s) for %s', type, addon.name);
      addon.setupTypeGeneratorRegistry(type, this);
    }
  }
}
