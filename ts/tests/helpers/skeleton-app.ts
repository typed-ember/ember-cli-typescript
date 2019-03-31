import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import execa from 'execa';
import { EventEmitter } from 'events';
import got from 'got';
import debugLib from 'debug';

tmp.setGracefulCleanup();

const debug = debugLib('skeleton-app');

const getEmberPort = (() => {
  let lastPort = 4210;
  return () => lastPort++;
})();

export default class SkeletonApp {
  port = getEmberPort();
  watched: WatchedBuild | null = null;
  tmpDir = tmp.dirSync({
    tries: 10,
    unsafeCleanup: true,
    dir: process.cwd(),
    template: 'test-skeleton-app-XXXXXX',
  });
  root = this.tmpDir.name;

  constructor() {
    fs.copySync(`${__dirname}/../../../test-fixtures/skeleton-app`, this.root);
  }

  build() {
    return this._ember(['build']);
  }

  serve() {
    if (this.watched) {
      throw new Error('Already serving');
    }
    return (this.watched = new WatchedBuild(
      this._ember(['serve', '--port', `${this.port}`]),
      this.port
    ));
  }

  updatePackageJSON(callback: (arg: any) => string) {
    let pkgPath = `${this.root}/package.json`;
    let pkg = fs.readJSONSync(pkgPath);
    fs.writeJSONSync(pkgPath, callback(pkg) || pkg, { spaces: 2 });
  }

  writeFile(filePath: string, contents: string) {
    let fullPath = `${this.root}/${filePath}`;
    fs.ensureDirSync(path.dirname(fullPath));
    fs.writeFileSync(fullPath, contents, 'utf-8');
  }

  readFile(path: string) {
    return fs.readFileSync(`${this.root}/${path}`, 'utf-8');
  }

  removeFile(path: string) {
    return fs.unlinkSync(`${this.root}/${path}`);
  }

  teardown() {
    if (this.watched) {
      this.watched.kill();
    }
    this.tmpDir.removeCallback();
  }

  _ember(args: string[]) {
    let ember = require.resolve('ember-cli/bin/ember');
    return execa('node', [ember].concat(args), { cwd: this.root, cleanup: true });
  }
}

class WatchedBuild extends EventEmitter {

  constructor(protected ember: execa.ExecaChildProcess, protected port: number) {
    super();
    this.ember.stdout.on('data', data => {
      let output = data.toString();
      if (output.includes('Build successful')) {
        this.emit('did-rebuild');
      }

      debug(output);
    });

    this.ember.stderr.on('data', data => {
      debug(data.toString());
    });

    this.ember.catch(error => {
      this.emit('did-error', error);
    });
  }

  request(path: string) {
    return got(`http://localhost:${this.port}${path}`);
  }

  waitForOutput(target: string) {
    return new Promise(resolve => {
      let output = '';
      let listener = (data: string | Buffer) => {
        output += data.toString();
        if (output.includes(target)) {
          this.ember.stdout.removeListener('data', listener);
          this.ember.stderr.removeListener('data', listener);
          resolve(output);
        }
      };

      this.ember.stdout.on('data', listener);
      this.ember.stderr.on('data', listener);
    });
  }

  waitForBuild() {
    return new Promise((resolve, reject) => {
      this.once('did-rebuild', resolve);
      this.once('did-error', reject);
    });
  }

  kill() {
    this.ember.kill();
  }
}
