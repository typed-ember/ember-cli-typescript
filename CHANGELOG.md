# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

* Fix default blueprint for `types/<my app>/index.d.ts`: add missing import and an export statement so ambient declarations work.
* Add types to initializer and instance initializer blueprints.

## [1.1.2] - 2018-02-13

### Fixed

* _Actually_ resolve the problem of throwing when running generators if `ember-cli-version-checker` version too low: put it in `dependencies`.

## [1.1.1] - 2018-02-12

### Fixed

* No longer throw when running generators if `ember-cli-version-checker` version too low by putting it in `peerDependencies`.
* Clarified some parts of the README that misled people on handling certain errors.

## [1.1.0] - 2018-02-12

### Added

* **Generators:** `ember generate <blueprint>` now creates TypeScript files for you
* **Support for addons:** we now precompile addon TypeScript so `ember-cli-typescript` and `typescript` itself can remain in `devDependencies` instead of `dependencies`, and addons can easily distribute compiled JavaScript with TypeScript type definition (`.d.ts`) files.
* **Incremental compilation:** `ember serve` or `ember test --serve` now use TypeScript's `tsc --watch` mode to only rebuild what changed, so your builds should be much faster

### Fixed

* `tsconfig.json` is no longer so annoyingly temperamental; you can largely do what you want with it
* `ember serve` no longer triggers a full rebuild of all TypeScript files every time _any_ file in your project changes.

## [1.0.6] - 2017-12-17

### Changed

* Update to broccoli-typescript-compiler 2.1.1, for proper support for TS 2.6. This should make your build properly respect things like // @ts-ignore special comments.

## [1.0.5] - 2017-11-23

### Fixed

* Updated the `tsconfig.json` blueprint to set the `noImplicitThis` option to `true`, improving experience around use of updated type definitions

## [1.0.4] - 2017-11-13

### Changed

* Updated broccoli-compiler-typescript
* Updated package.json to always install latest version of type definitions

### Fixed

* Fixed the default generated `environment.d.ts`

### Internal

* Made everything [✨ Prettier ✨](https://prettier.io)

## [1.0.3] - 2017-08-22

### Changed

* TS info messages now go to `stdout` and TS error messages now properly go to `stderr`
* Fixed a dead link in the README

## [1.0.2] - 2017-08-16

### Fixed

* Updates the generated `tsconfig.json` to set `"modules": "ES6"` in the compiler options, so that codemods which operate on modules, like [babel-plugin-ember-modules-api-polyfill](https://github.com/ember-cli/babel-plugin-ember-modules-api-polyfill/), will actually work. (Yes, this is 1.0.1, but done correctly.)

## [1.0.1] - 2017-08-16

### Changed

* Updates the generated `tsconfig.json` to set `"modules": "ES6"` in the compiler options, so that codemods which operate on modules, like [babel-plugin-ember-modules-api-polyfill](https://github.com/ember-cli/babel-plugin-ember-modules-api-polyfill/), will actually work.

## [1.0.0] - 2017-08-08

### Added

* Include more type definitions in the default blueprint
* Documentation of using `paths` (thanks @toranb!)
* Supports in-repo addons, including in-repo Ember Engines

### Changed

* Update to broccoli-compiler-typescript@2.0
* Update Ember CLI and TypeScript (thanks @mfeckie!)
* Match the `broccoli-typescript-compiler` option `throwOnError` with the `tsconfig.json` `noEmitOnError` option.

### Fixed

* Use `this.ui.write` instead of `console.log`.
* Only process the tsconfig file once, instead of for every Broccoli tree (i.e. addons, the app, and the tests).
* No longer pass the `allowJs` option to TypeScript, since Broccoli manages the tree so `.ts` and `.js` files for us.

### Internal

* Run prettier on the codebase

## [0.4.0] - 2017-05-03

### Changed

* Updated the base type definitions in `app/config/environment.d.ts` to include the defaults generated when creating an Ember app (thanks, @luketheobscure!)
* Updated the README with clearer installation instructions and notes on using the add-on to develop other add-ons

### Fixed

* `ember serve` and `ember test` and `ember build` all work properly now, across platforms
* builds are much faster on all platforms.

## [0.3.2] - 2017-04-22

### Fixed

* Now properly installs on Windows.

## [0.3.1] - 2017-04-22

### Added

* `tsconfig.json` blueprint now includes paths to resolve default Ember app structure imports

### Fixed

* Resolved install bugs on macOS and Linux

### Removed

* All references to `local-types` in the codebase and blueprints, since `local-types` is not used by the addon and not a normal TypeScript file location

## [0.3.0] - 2017-03-13

### Fixed

* `tsconfig.json` blueprint now works for both the addon and editors

## [0.2.0] - 2016-12-17

### Added

* Everything; the 0.2.0 release began by copying the implementation from [ember-cli-typify].
* Basic, semi-working functionality.

[ember-cli-typify]: https://github.com/winding-lines/ember-cli-typify
[unreleased]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.1.2...HEAD
[1.1.2]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.0.6...v1.1.0
[1.0.6]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/typed-ember/ember-cli-typescript/compare/v0.4.0...v1.0.0
[0.4.0]: https://github.com/typed-ember/ember-cli-typescript/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/typed-ember/ember-cli-typescript/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/typed-ember/ember-cli-typescript/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/typed-ember/ember-cli-typescript/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/typed-ember/ember-cli-typescript/compare/04dfe8757710ef8fab0d7a0dfec2a4b06593efa2...v0.2.0
