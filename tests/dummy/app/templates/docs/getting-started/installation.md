# Installation

You can simply `ember install` the dependency like normal:

```sh
ember install ember-cli-typescript@latest
```

All dependencies will be added to your `package.json`, and you're ready to roll! **If you're upgrading from a previous release, see below!** you should check to merge any tweaks you've made to `tsconfig.json`.

Installing ember-cli-typescript modifies your project in two ways:

- installing a number of other packages to make TypeScript work in your app or addon
- generating a number of files in your project

## Other packages this addon installs

We install the following packages—all at their current "latest" value—or generated:

- [**`typescript`**](https://github.com/Microsoft/TypeScript)
- **`@types/ember`** ([npm](https://www.npmjs.com/package/@types/ember) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember)) - Types for [Ember.js](https://github.com/emberjs/ember.js) which includes
    - **`@types/ember__string`** ([npm](https://www.npmjs.com/package/@types/ember__string) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__string)) - types for the [`@ember/string` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fstring)
    - **`@types/ember__object`** ([npm](https://www.npmjs.com/package/@types/ember__object) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__object)) - types for the [`@ember/object` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fobject)
    - **`@types/ember__utils`** ([npm](https://www.npmjs.com/package/@types/ember__utils) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__utils)) - types for the [`@ember/utils` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Futils)
    - **`@types/ember__array`** ([npm](https://www.npmjs.com/package/@types/ember__array) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__array)) - types for the [`@ember/array` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Farray)
    - **`@types/ember__component`** ([npm](https://www.npmjs.com/package/@types/ember__component) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__component)) - types for the [`@ember/component` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fcomponent)
    - **`@types/ember__engine`** ([npm](https://www.npmjs.com/package/@types/ember__engine) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__engine)) - types for the [`@ember/engine` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fengine)
    - **`@types/ember__application`** ([npm](https://www.npmjs.com/package/@types/ember__application) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__application)) - types for the [`@ember/application` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fapplication)
    - **`@types/ember__controller`** ([npm](https://www.npmjs.com/package/@types/ember__controller) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__controller)) - types for the [`@ember/controller` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fcontroller)
    - **`@types/ember__service`** ([npm](https://www.npmjs.com/package/@types/ember__service) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__service)) - types for the [`@ember/service` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fservice)
    - **`@types/ember__runloop`** ([npm](https://www.npmjs.com/package/@types/ember__runloop) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__runloop)) - types for the [`@ember/runloop` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Frunloop)
    - **`@types/ember__error`** ([npm](https://www.npmjs.com/package/@types/ember__error) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__error)) - types for the [`@ember/error` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Ferror)
    - **`@types/ember__polyfills`** ([npm](https://www.npmjs.com/package/@types/ember__polyfills) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__polyfills)) - types for the [`@ember/polyfills` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fpolyfills)
    - **`@types/ember__debug`** ([npm](https://www.npmjs.com/package/@types/ember__debug) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__debug)) - types for the [`@ember/debug` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Fdebug)
    - **`@types/ember__test`** ([npm](https://www.npmjs.com/package/@types/ember__test) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__test)) - types for the [`@ember/test` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Ftest)
    - **`@types/ember__routing`** ([npm](https://www.npmjs.com/package/@types/ember__routing) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__routing)) - types for the [`@ember/routing` package](https://www.emberjs.com/api/ember/3.4/modules/@ember%2Frouting)
- **`@types/ember-data`** - ([npm](https://www.npmjs.com/package/@types/ember-data) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember-data)) - Types for [Ember-Data](https://github.com/emberjs/data)
- **`@types/rsvp`** - ([npm](https://www.npmjs.com/package/@types/rsvp) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/rsvp)) - Types for [RSVP.js](https://github.com/tildeio/rsvp.js/)
- **`@types/ember__test-helpers`** - ([npm](https://www.npmjs.com/package/@types/ember__test-helpers) | [source](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember__test-helpers)) – Types for [@ember/test-helpers](https://github.com/emberjs/ember-test-helpers).

## Files this addon generates

We add the following files to your project:

- [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- `types/<app name>/index.d.ts` – the location for any global type declarations you need to write for you own application; see [**Using TS Effectively: Global types for your package**](./docs/ts-guide/using-ts-effectively#global-types-for-your-package) for information on its default contents and how to use it effectively
- `app/config/environment.d.ts` – a basic set of types defined for the contents of the `config/environment.js` file in your app; see [Environment and configuration typings](#environment-and-configuration-typings) for details
