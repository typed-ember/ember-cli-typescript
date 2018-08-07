# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2018-08-07

### Fixed

* Ignore `node_modules` hoisted above project root (e.g. yarn workspaces)

### Added

* Auto-install of [`@types/ember__test-helpers`](https://www.npmjs.com/package/@types/ember__test-helpers)
* Initial support for [Module Unification](https://github.com/emberjs/rfcs/blob/master/text/0143-module-unification.md) (see [#199](https://github.com/typed-ember/ember-cli-typescript/pull/199) for what is/isn't supported in this release)
* Support for building addons' `test-support` and `addon-test-support` directories

## [1.3.3] - 2018-07-19

### Fixed

* Watcher has been "de-simplified" to make it more consistent with how tsc's own watcher works and prevent rebuild issues.
* `ember-cli-typescript` will now run after `ember-decorators`, ensuring that the `ember-cli-typescript` blueprints override `ember-decorators`'.

### Changed

* Improved documentation regarding service injection.

### Added

* Getting Help section to readme.
* Github issue templates.

## [1.3.2] - 2018-06-05

### Fixed

* TypeScript 2.9 no longer causes infinite error loops and/or fails to trigger rebuilds.

## [1.3.1] - 2018-05-14

### Fixed

* No longer requires TypeScript before it has been installed.
* Properly ignore the root across platforms.

## [1.3.0] - 2018-05-01

### Fixed

* Simplified the file watching implementation, fixing some odd behavior when trees of files were deleted or moved all at once.
* Synchronization between tsc and the broccoli build process has been improved, reducing spurious rebuilds.
* TypeScript no longer churns on every change in the `tmp` directory.
* Make sure ember-cli-typescript is a dev dependency when generating in-repo-addons, so their TypeScript gets built correctly.
* Eliminated some lint errors in the build.

### Changed

* Updated the generated `tsconfig.json` to use the maximum strictness we can with Ember's typings.
* Clarified instructions for sourcemaps.

### Added

* The addon now supports failing the build when there are type errors, using `"noEmitOnError": true` in `tsconfig.json`.

## [1.2.1] - 2018-03-14

### Fixed

* Blueprint now correctly adds ember-cli-typescript as a dependency, allowing TS to be merged into the regular app tree.

## [1.2.0] - 2018-03-05

### Added

* Blueprint (and tests) to generate in-repo addons configured for TypeScript
* Add `// @ts-ignore` component template import.
* `-addon` blueprints for all the things to generate .ts files in `app/` in an addon.

### Changed

* Improve instructions for setting up [Linked Addons](README.md#linking-addons) and [In-repo Addons](README.md#in-repo-addons).

### Fixed

* Addon components need to manually set their layout property to the imported compiled template.
* The declaration file for the `<app-name>/config/environment` module now resolves correctly from app code. If you have a version of this file previously generated at `types/<app-name>/config/environment.d.ts`, you'll likely want to move it to `app/config/environment.d.ts`.

## [1.1.6] - 2018-02-23

### Fixed

* The blueprints provided by `ember-cli-typescript` now deterministically override the base ones from `ember-data` and `ember-source`.
* Correct type declarations are installed out of the box based on what test framework is present.
* A catch-all model registry is generated on installation to avoid the "error TS2344" problem.

## [1.1.5] - 2018-02-20

### Fixed

* Fixed a regression in 1.1.4 which caused in-repo-addons written in TypeScript not to work correctly.
* Fixed the `tsconfig.json` blueprint to properly include the `types` directory.

## [1.1.4] - 2018-02-20

### Changed

* The default `tsconfig.json` now includes inline source maps to support integrating with Babel sourcemaps, and the README has instructions for configuring Ember CLI's Babel integration.

### Fixed

* TypeScript files in addon `app` trees now get compiled properly.
* App files now correctly take precedence over any files of the same name earlier in the tree. (If you had a component with the same name as an addon-supplied component, for example, the addon version could override yours.)

## [1.1.3] - 2018-02-16

### Fixed

* Fix default blueprint for `types/<my app>/index.d.ts`: add missing import and an export statement so ambient declarations work.
* Add types to initializer and instance initializer blueprints.
* Special-case handling for Mirage so that it works at all, and update generators so it works "out of the box".
* Stop assuming the ember-cli-qunit version consumers have installed will be sufficiently high for our tests to pass.

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
[unreleased]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.3.3...v1.4.0
[1.3.3]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.1.6...v1.2.0
[1.1.6]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.1.5...v1.1.6
[1.1.5]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/typed-ember/ember-cli-typescript/compare/v1.1.2...v1.1.3
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
