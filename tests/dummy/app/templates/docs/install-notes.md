# Installation

***Note:* Because ember-cli-typescript is part of the build pipeline, the process for installing it differs slightly between apps and addons!**

## In apps

In apps, you can simply `ember install` the dependency like normal:

```sh
ember install ember-cli-typescript@latest
```

## In addons

To work properly, Ember addons must declare this library as a `dependency`, not a `devDependency`. You can `ember install` it by running:

```sh
ember install ember-cli-typescript@latest --save
```

All dependencies will be added to your `package.json`, and you're ready to roll! **If you're upgrading from a previous release, see below!** you should check to merge any tweaks you've made to `tsconfig.json`.

## Other Packages This Addon Installs

- We install the following packages—all at their current "latest" value—or generated:

  - [`typescript`](https://github.com/Microsoft/TypeScript)
  - **@types/ember** ([npm](https://www.npmjs.com/package/@types/ember) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember)) - Types for [Ember.js](https://github.com/emberjs/ember.js) which includes
    - **@types/ember\_\_string** ([npm](https://www.npmjs.com/package/@types/ember__string) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__string)) - types for the [`@ember/string` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fstring)
    - **@types/ember\_\_object** ([npm](https://www.npmjs.com/package/@types/ember__object) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__object)) - types for the [`@ember/object` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fobject)
    - **@types/ember\_\_utils** ([npm](https://www.npmjs.com/package/@types/ember__utils) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__utils)) - types for the [`@ember/utils` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Futils)
    - **@types/ember\_\_array** ([npm](https://www.npmjs.com/package/@types/ember__array) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__array)) - types for the [`@ember/array` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Farray)
    - **@types/ember\_\_component** ([npm](https://www.npmjs.com/package/@types/ember__component) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__component)) - types for the [`@ember/component` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fcomponent)
    - **@types/ember\_\_engine** ([npm](https://www.npmjs.com/package/@types/ember__engine) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__engine)) - types for the [`@ember/engine` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fengine)
    - **@types/ember\_\_application** ([npm](https://www.npmjs.com/package/@types/ember__application) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__application)) - types for the [`@ember/application` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fapplication)
    - **@types/ember\_\_controller** ([npm](https://www.npmjs.com/package/@types/ember__controller) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__controller)) - types for the [`@ember/controller` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fcontroller)
    - **@types/ember\_\_service** ([npm](https://www.npmjs.com/package/@types/ember__service) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__service)) - types for the [`@ember/service` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fservice)
    - **@types/ember\_\_runloop** ([npm](https://www.npmjs.com/package/@types/ember__runloop) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__runloop)) - types for the [`@ember/runloop` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Frunloop)
    - **@types/ember\_\_error** ([npm](https://www.npmjs.com/package/@types/ember__error) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__error)) - types for the [`@ember/error` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Ferror)
    - **@types/ember\_\_polyfills** ([npm](https://www.npmjs.com/package/@types/ember__polyfills) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__polyfills)) - types for the [`@ember/polyfills` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fpolyfills)
    - **@types/ember\_\_debug** ([npm](https://www.npmjs.com/package/@types/ember__debug) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__debug)) - types for the [`@ember/debug` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fdebug)
    - **@types/ember\_\_test** ([npm](https://www.npmjs.com/package/@types/ember__test) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__test)) - types for the [`@ember/test` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Ftest)
    - **@types/ember\_\_routing** ([npm](https://www.npmjs.com/package/@types/ember__routing) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__routing)) - types for the [`@ember/routing` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Frouting)
  - **@types/ember-data** - ([npm](https://www.npmjs.com/package/@types/ember-data) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember-data)) - Types for [Ember-Data](https://github.com/emberjs/data)
  - **@types/rsvp** - ([npm](https://www.npmjs.com/package/@types/rsvp) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/rsvp)) - Types for [RSVP.js](https://github.com/tildeio/rsvp.js/)
  - **@types/ember-test-helpers** - ([npm](https://www.npmjs.com/package/@types/ember-test-helpers) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember-test-helpers)) Types for [ember-test-helpers](https://github.com/emberjs/ember-test-helpers), which arose from [RFC #232](https://github.com/emberjs/rfcs/blob/master/text/0232-simplify-qunit-testing-api.md)
  - **@types/ember-testing-helpers** - ([npm](https://www.npmjs.com/package/@types/ember-testing-helpers) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember-testing-helpers)) – Types for [Ember's built-in globally-available test helpers](https://github.com/emberjs/ember.js/tree/master/packages/ember-testing/lib/helpers)
  - **@types/ember\_\_test-helpers** - ([npm](https://www.npmjs.com/package/@types/ember__test-helpers) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__test-helpers)) – Types for [ember-test-helpers](https://github.com/emberjs/ember-test-helpers) when imported as `@ember/test-helpers`.

### Files this addon Generates

- We add the following files to your project:

  - [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
  - `types/<app name>/index.d.ts` – the location for any global type declarations you need to write for you own application; see [Global types for your package](#global-types-for-your-package) for information on its default contents and how to use it effectively
  - `app/config/environment.d.ts` – a basic set of types defined for the contents of the `config/environment.js` file in your app; see [Environment and configuration typings](#environment-and-configuration-typings) for details
