'use strict';

const fs = require('fs-extra');
const path = require('path');
const mktemp = require('mktemp');
const execa = require('execa');
const EventEmitter = require('events').EventEmitter;

module.exports = class SkeletonApp {
  constructor() {
    this._watched = null;
    this.root = mktemp.createDirSync('test-skeleton-app-XXXXXX');
    fs.copySync(`${__dirname}/../../../test-fixtures/skeleton-app`, this.root);
  }

  build() {
    return this._ember(['build']);
  }

  serve() {
    if (this._watched) {
      throw new Error('Already serving');
    }

    return this._watched = new WatchedBuild(this._ember(['serve']));
  }

  updatePackageJSON(callback) {
    let pkgPath = `${this.root}/package.json`;
    let pkg = fs.readJSONSync(pkgPath);
    fs.writeJSONSync(pkgPath, callback(pkg) || pkg, { spaces: 2 });
  }

  writeFile(filePath, contents) {
    let fullPath = `${this.root}/${filePath}`;
    fs.ensureDirSync(path.dirname(fullPath));
    fs.writeFileSync(fullPath, contents, 'utf-8');
  }

  readFile(path) {
    return fs.readFileSync(`${this.root}/${path}`, 'utf-8');
  }

  removeFile(path) {
    return fs.unlinkSync(`${this.root}/${path}`);
  }

  teardown() {
    if (this._watched) {
      this._watched.kill();
    }

    this._cleanupRootDir({ retries: 1 });
  }

  _ember(args) {
    let ember = require.resolve('ember-cli/bin/ember');
    return execa('node', [ember].concat(args), { cwd: this.root });
  }

  _cleanupRootDir(options) {
    let retries = options && options.retries || 0;

    try {
      fs.removeSync(this.root);
    } catch (error) {
      if (retries > 0) {
        // Windows doesn't necessarily kill the process immediately, so
        // leave a little time before trying to remove the directory.
        setTimeout(() => this._cleanupRootDir({ retries: retries - 1 }), 250);
      } else {
        // eslint-disable-next-line no-console
        console.warn(`Warning: unable to remove skeleton-app tmpdir ${this.root} (${error.code})`);
      }
    }
  }
}

class WatchedBuild extends EventEmitter {
  constructor(ember) {
    super();
    this._ember = ember;
    this._ember.stdout.on('data', (data) => {
      let output = data.toString();
      if (output.includes('Build successful')) {
        this.emit('did-rebuild');
      }
    });

    this._ember.catch((error) => {
      this.emit('did-error', error);
    });
  }

  waitForBuild() {
    return new Promise((resolve, reject) => {
      this.once('did-rebuild', resolve);
      this.once('did-error', reject);
    });
  }

  kill() {
    this._ember.kill();
  }
}
