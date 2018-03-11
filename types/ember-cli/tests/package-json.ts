import {Package} from "ember-cli/package-json";

const packageJson: Package = {
  "name": "ember-cli-typescript",
  "version": "1.1.6",
  "description": "Allow ember apps to use typescript files.",
  "keywords": [
    "ember-addon",
    "typescript"
  ],
  "license": "MIT",
  "author": "Chris Krycho <chris@chriskrycho.com> (http://www.chriskrycho.com)",
  "contributors": [
    "Marius Seritan",
    "David Gardiner",
    "Philip Bjorge"
  ],
  "directories": {
    "doc": "doc",
    "test": "tests"
  },
  "repository": "https://github.com/typed-ember/ember-cli-typescript.git",
  "bugs": {
    "url": "https://github.com/typed-ember/ember-cli-typescript"
  },
  "homepage": "https://github.com/typed-ember/ember-cli-typescript",
  "scripts": {
    "build": "ember build",
    "postpublish": "ember ts:clean"
  },
  "dependencies": {
    "broccoli-debug": "^0.6.4",
    "mkdirp": "^0.5.1",
    "resolve": "^1.5.0",
    "rimraf": "^2.6.2",
    "rsvp": "^4.8.1",
    "silent-error": "^1.1.0",
    "symlink-or-copy": "^1.1.8",
    "walk-sync": "^0.3.2"
  },
  "devDependencies": {
    "@types/debug": "^0.0.30",
    "loader.js": "^4.2.3",
    "mocha": "^5.0.0",
    "typescript": "^2.7.2"
  },
  "resolutions": {
    "@types/ember": "^2.8.15",
    "@types/rsvp": "^4.0.1"
  },
  "peerDependencies": {
    "typescript": "^2.4.2"
  },
  "engines": {
    "node": "^4.5 || 6.* || >= 7.*"
  },
  "ember-addon": {
    "configPath": "tests/dummy/config",
    "before": [
      "ember-cli-babel"
    ],
    "after": [
      "ember-source",
      "ember-data"
    ],
    "paths": [
      "tests/dummy/lib/in-repo-a",
      "tests/dummy/lib/in-repo-b"
    ]
  },
  "prettier": {
    "printWidth": 100,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "es5",
    "tabWidth": 2,
    "proseWrap": "never"
  }
};
