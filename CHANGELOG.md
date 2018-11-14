# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-beta.2] - 2018-10-26

### Fixed
- Ensure that ember-cli-typescript doesn't interfere with parallelizing the Babel transpilation process (#351)

## [2.0.0-beta.1] - 2018-10-25

This is a major release with 💥 breaking changes 💥! However, most apps will compile with minimal (or no) changes! 🎉 They'll also tend to compile *much faster* in many cases. ⚡️

We now use Babel 7's support for TypeScript to build apps and addons. Most of the horrible hacks we had to do before are now gone, and the error outputs you will see for type errors are much nicer as well. (As a particular note, we should work better with `ember-auto-import` now, since we're just part of the normal Broccoli/Babel pipeline Ember CLI uses.)

***THIS IS A BETA!*** Please test this out in your apps! Please do *not* use this for your production apps!

### Added

* Much nicer reporting of type errors both in the console and in your browser
* Type errors now use the "pretty" type error format stabilized in TypeScript 2.9

### Changed

* We now build the application using Babel 7's TypeScript plugin. This has a few important limitations – some of them bugs (linked below); others are conscious decisions on the part of Babel. The changes:
    - `const enum` types are unsupported. You should switch to constants or regular enums.

    - trailing commas after rest function parameters (`function foo(...bar[],) {}`) are disallowed by the ECMAScript spec, so Babel also disallows them.

    - re-exports of types have to be disambiguated to be *types*, rather than values. Neither of these will work:

      ```ts
      export { FooType } from 'foo';
      ```
      ```ts
      import { FooType } from 'foo';
      export { FooType };
      ```

      In both cases, Babel attempts to emit a *value* export, not just a *type* export, and fails because there is no actual value to emit. You can do this instead as a workaround:

      ```ts
      import * as Foo from 'foo';
      export type FooType = Foo.FooType;
      ```

    - `this` types in ES5 getters and setters are do not work ([babel/babel#8069](https://github.com/babel/babel/issues/8069))

    - destructuring of parameters in function signatures currently do not work ([babel/babel#8099](https://github.com/babel/babel/issues/8099))

    Other bugs you should be aware of:

    - if an enum has a member with the same name as an imported type ([babel/babel#8881](https://github.com/babel/babel/issues/8881))

* `ember-cli-typescript` must be in `dependencies` instead of `devDependencies` for addons, since we now hook into the normal Broccoli + Babel build pipeline instead of doing an end-run around it

* Addons can no longer use `.ts` in app, because an addon's `app` directory gets merged with and uses the *host's* (i.e. the other addon or app's) preprocessors, and we cannot guarantee the host has TS support. Note that in-repo-addons will continue to work for in-repo addons because of the app build works with the host's (i.e. the app's, not the addon's) preprocessors.

* Apps need to use `.js` for overrides in app, since the different file extension means apps no long consistently "win" over addon versions (a limitation of how Babel + app merging interact) – note that this won’t be a problem with Module Unification apps

### Fixed

* Type errors now show properly in the browser when running tests

## [1.5.0] - 2018-10-25

### Fixed

* We now provide better user feedback when installing ember-cli-typescript from a git version (i.e. for testing prereleases