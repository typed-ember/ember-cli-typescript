# ember-cli-typescript

Use TypeScript in your Ember 2.x and 3.x apps!

[![*nix build status (master)](https://travis-ci.org/typed-ember/ember-cli-typescript.svg?branch=master)](https://travis-ci.org/typed-ember/ember-cli-typescript) [![Windows build status](https://ci.appveyor.com/api/projects/status/i94uv7jgmrg022ho/branch/master?svg=true)](https://ci.appveyor.com/project/chriskrycho/ember-cli-typescript/branch/master) [![Ember Observer Score](https://emberobserver.com/badges/ember-cli-typescript.svg)](https://emberobserver.com/addons/ember-cli-typescript)

* [Setup and Configuration](#setup-and-configuration)
  * [Ember Support](#ember-support)
  * [`tsconfig.json`](#tsconfigjson)
  * [Sourcemaps](#sourcemaps)
* [Using TypeScript with Ember effectively](#using-typescript-with-ember-effectively)
  * [Incremental adoption](#incremental-adoption)
  * [Install other types!](#install-other-types)
  * [The `types` directory](#the-types-directory)
    * [Global types for your package](#global-types-for-your-package)
    * [Environment configuration typings](#environment-configuration-typings)
  * [String-keyed lookups](#string-keyed-lookups)
    * [`this` type workaround](#this-type-workaround)
    * [Nested keys in `get` or `set`](#nested-keys-in-get-or-set)
    * [Service and controller injections](#service-and-controller-injections)
      * [Using `.extend`](#using-extend)
      * [Using decorators](#using-decorators)
    * [Ember Data lookups](#ember-data-lookups)
      * [Opt-in unsafety](#opt-in-unsafety)
      * [Fixing the Ember Data `error TS2344` problem](#fixing-the-ember-data-error-ts2344-problem)
  * [Class property setup errors](#class-property-setup-errors)
  * [Type definitions outside `node_modules/@types`](#type-definitions-outside-node_modulestypes)
  * [ember-browserify](#ember-browserify)
  * [ember-cli-mirage](#ember-cli-mirage)
  * ["TypeScript is complaining about multiple copies of the same types"](#typescript-is-complaining-about-multiple-copies-of-the-same-types)
    * [Just tell me how to fix it](#just-tell-me-how-to-fix-it)
    * [Why is this happening?](#why-is-this-happening)
* [Using ember-cli-typescript with Ember CLI addons](#using-ember-cli-typescript-with-ember-cli-addons)
  * [Publishing](#publishing)
  * [Linking Addons](#linking-addons)
  * [In-Repo Addons](#in-repo-addons)
  * [Gotchas](#gotchas)
* [Current limitations](#current-limitations)
  * [Some `import`s don't resolve](#some-imports-dont-resolve)
  * [Type safety when invoking actions](#type-safety-when-invoking-actions)

## Setup and Configuration

To install or upgrade the addon, just run:

```
ember install ember-cli-typescript@latest
```

All dependencies will be added to your `package.json`, and you're ready to roll! If you're upgrading from a previous release, you should check to merge any tweaks you've made to `tsconfig.json`.

In addition to ember-cli-typescript, we make the following changes to your project:

* We install the following packages—all at their current "latest" value—or generated:

  * [`typescript`](https://github.com/Microsoft/TypeScript)
  * [`@types/ember`](https://www.npmjs.com/package/@types/ember)
  * [`@types/ember-data`](https://www.npmjs.com/package/@types/ember-data)
  * [`@types/rsvp`](https://www.npmjs.com/package/@types/rsvp)
  * [`@types/ember-test-helpers`](https://www.npmjs.com/package/@types/ember-test-helpers) – these are the importable test helpers from [RFC #232](https://github.com/emberjs/rfcs/blob/master/text/0232-simplify-qunit-testing-api.md)-style tests
  * [`@types/ember-testing-helpers`](https://www.npmjs.com/package/@types/ember-testing-helpers) – these are the globally-available acceptance test helpers

* We add the following files to your project:

  * [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
  * `types/<app name>/index.d.ts` – the location for any global type declarations you need to write for you own application; see [Global types for your package](#global-types-for-your-package) for information on its default contents and how to use it effectively
  * `app/config/environment.d.ts` – a basic set of types defined for the contents of the `config/environment.js` file in your app; see [Environment and configuration typings](#environment-and-configuration-typings) for details

### Ember support

ember-cli-typescript runs its test suite against the 2.12 LTS, the 2.16 LTS, the 2.18 LTS, the current release, the beta branch, and the canary branch. It's also in active use in several large applications. Any breakage for upcoming releases _should_ be detected and fixed ahead of those releases, but you can help us guarantee that by running your own Ember.js+TypeScript app with beta and canary turned on and let us know if you run into issues with upcoming Ember.js releases.

### `tsconfig.json`

We generate a good default [`tsconfig.json`][blueprint], which will usually make everything _Just Work™_. In general, you may customize your TypeScript build process as usual using the `tsconfig.json` file.

However, there are a few things worth noting if you're already familiar with TypeScript and looking to make further or more advanced customizations (i.e. _most_ users can just ignore this section!):

1. The generated tsconfig file does not set `"outDir"` and sets `"noEmit"` to `true`. Under the hood, Ember's own invocation of `tsc` _does_ set these, but the default configuration we generate allows you to run editors which use the compiler without creating extraneous `.js` files throughout your codebase, leaving the compilation to ember-cli-typescript to manage.

   You _can_ still customize those properties in `tsconfig.json` if your use case requires it, however. For example, to see the output of the compilation in a separate folder you are welcome to set `"outDir"` to some path and set `"noEmit"` to `false`. Then tools which use the TypeScript compiler (e.g. the watcher tooling in JetBrains IDEs) will generate files at that location, while the Ember.js/Broccoli pipeline will continue to use its own temp folder.

2. Closely related to the previous point: any changes you do make to `outDir` won't have any effect on how _Ember_ builds your application—we have to pipe everything into Ember CLI via [broccoli], so we override that. In general, everything else works just as you'd expect, though!

3. By default, we target the highest stable version of JavaScript available in the TypeScript compiler, so that you may ship anything from that very code without further modification to browsers that support it all the way back to ES3, in line with the Babel configuration in your app's `config/targets.js`. You can set this target to whatever is appropriate for your application, but we _strongly_ encourage you to leave it set to the highest stable version of JavaScript if you are developing an addon, so that consumers of your addon have full flexibility in this regard.

4. If you make changes to the paths included in or excluded from the build via your `tsconfig.json` (using the `"include"`, `"exclude"`, or `"files"` keys), you will need to restart the server to take the changes into account: ember-cli-typescript does not currently watch the `tsconfig.json` file.

[blueprint]: https://github.com/typed-ember/ember-cli-typescript/blob/master/blueprints/ember-cli-typescript/files/tsconfig.json
[broccoli]: http://broccolijs.com/

### Sourcemaps

To enable TypeScript sourcemaps, you'll need to add the corresponding configuration for Babel to your `ember-cli-build.js` file:

```ts
const app = new EmberApp(defaults, {
  babel: {
    sourceMaps: 'inline',
  },
});
```

(Note that this _will_ noticeably slow down your app rebuilds.)

If you're updating from an older version of the addon, you may also need to update your `tsconfig.json`. (Current versions generate the correct config at installation.) Either run
`ember generate ember-cli-typescript` or verify you have the same sourcemap settings in your `tscsonfig.json` that appear in [the blueprint](https://github.com/typed-ember/ember-cli-typescript/blob/master/blueprints/ember-cli-typescript/files/tsconfig.json).

## Using TypeScript with Ember effectively

In addition to the points made below, you may find the [Typing Your Ember][typing-your-ember] blog series (especially the "Update" sequence) particularly helpful in knowing how to do specific things.

### Incremental adoption

If you are porting an existing app to TypeScript, you can install this addon and migrate your files incrementally by changing their extensions from `.js` to `.ts`. As TypeScript starts to find errors (and it usually does!), make sure to celebrate your wins – even if they're small! – with your team, especially if some people are not convinced yet. We would also love to hear your stories!

Some specific tips for success on the technical front:

* Use the *strictest* strictness settings that our typings allow. While it may be tempting to start with the *loosest* strictness settings and then to tighten them down as you go, this will actually mean that "getting your app type-checking" will become a repeated process – getting it type-checking with every new strictness setting you enable! – rather than something you do just once. The only strictness setting you should turn *off* is `strictFunctionTypes`, which our current type definitions do not support. The recommended *strictness* settings in your `"compilerOptions"` hash:

    ```
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    ```

* Make liberal use of `any` for things you don't have types for as you go, and come back and fill them in later. This will let you do the strictest strictness settings but with an escape hatch that lets you say "We will come back to this when we have more idea how to handle it."

* A good approach is to start at your "leaf" files (the ones that don't import anything else from your app, only Ember types) and then work your way back inward toward the most core types that are used everywhere. Often the highest-value modules are your Ember Data models and any core services that are used everywhere else in the app – and those are also the ones that tend to have the most cascading effects (having to update *tons* of other places in your app) when you type them later in the process.

* Set `"noEmitOnError": true` in the `"compilerOptions"` hash in your `tsconfig.json` – it will help a lot if you can be sure that for the parts of your app you *have* added types to are still correct. And you'll get nice feedback *immediately* when you have type errors that way!

    ![type errors in your build!](https://user-images.githubusercontent.com/108688/38774630-7d9224d4-403b-11e8-8dbc-87dad977a4c4.gif "example of a build error during live reload")

You may find the blog series ["Typing Your Ember"][typing-your-ember] helpful as it walks you through not only how to install but how to most effectively use TypeScript in an Ember app today, and gives some important info on the background and roadmap for the project.

[typing-your-ember]: http://www.chriskrycho.com/typing-your-ember.html

### Install other types!

You'll want to use other type definitions as much as possible. The first thing you should do, for example, is install the types for your testing framework of choice: `@types/ember-mocha` or `@types/ember-qunit`. Beyond that, look for types from other addons: it will mean writing `any` a lot less and getting a lot more help both from your editor and from the compiler.

To make this easier, we're maintaining [a list of addons with known type definitions][known-typings] either on [Definitely Typed] or as part of the addon itself. (If you know of typings that aren't in that list, please open a pull request to add them!)

[known-typings]: ./known-typings.md
[definitely typed]: https://github.com/DefinitelyTyped/DefinitelyTyped

### The `types` directory

During installation, we create a `types` directory in the root of your application and add a `"paths"` mapping that includes that directory in any type lookups TypeScript tries to do. This is convenient for a few things:

* global types for your package (see the next section)
* writing types for third-party/`vendor` packages which do not have any types
* developing types for an addon which you intend to upstream later

These are all fallbacks, of course, you should use the types supplied directly with a package

#### Global types for your package

At the root of your application or addon, we include a `types/<your app>` directory with an `index.d.ts` file in it. Anything which is part of your application but which must be declared globally can go in this file. For example, if you have data attached to the `Window` object when the page is loaded (for bootstrapping or whatever other reason), this is a good place to declare it.

In the case of applications (but not for addons), we also automatically include declarations for Ember's prototype extensions in this `index.d.ts` file, with the `Array` prototype extensions enabled and the `Function` prototype extensions commented out. You should configure them to match your own config (which we cannot check during installation). If you are [disabling Ember's prototype extensions][disabling], you can remove these declarations entirely; we include them because they're enabled in most Ember applications today.

[disabling]: https://guides.emberjs.com/v2.18.0/configuring-ember/disabling-prototype-extensions/

#### Environment configuration typings

Along with the @types/ files mentioned above, ember-cli-typescript adds a starter interface for `config/environment.js` in `app/config/environment.d.ts`. This interface will likely require some changes to match your app.

We install this file because the actual `config/environment.js` is (a) not actually identical with the types as you inherit them in the content of an application, but rather a superset of what an application has access to, and (b) not in a the same location as the path at which you look it up. The actual `config/environment.js` file executes in Node during the build, and Ember CLI writes its result as `<my-app>/config/environment` into your build for consumption at runtime.

### String-keyed lookups

Ember makes heavy use of string-based APIs to allow for a high degree of dynamicism. With some limitations, you can nonetheless use TypeScript very effectively to get auto-complete/IntelliSense as well as to accurately type-check your applications.

The "Update" sequence in the Typing Your Ember has detailed explanations and guides for getting good type-safety for Ember's string-based APIs, e.g. the use of `get` and `set`, service and controller injection, Ember Data models and lookups

* [Part 1][pt1]: A look at normal Ember objects, "arguments" to components (and controllers), and service (or controller) injections.
* [Part 2][pt2]: Class properties — some notes on how things differ from the `Ember.Object` world.
* [Part 3][pt3]: Computed properties, actions, mixins, and class methods.
* [Part 4][pt4]: Using Ember Data, and service and controller injections improvements. (This includes a detailed guide to updating making the service and controller injections and Ember Data lookups behave as described below.)

[pt1]: http://www.chriskrycho.com/2018/typing-your-ember-update-part-1.html
[pt2]: http://www.chriskrycho.com/2018/typing-your-ember-update-part-2.html
[pt3]: http://www.chriskrycho.com/2018/typing-your-ember-update-part-3.html
[pt4]: http://www.chriskrycho.com/2018/typing-your-ember-update-part-4.html

A few of the most common speed-bumps are listed here to help make this easier:

#### `this` type workaround

One important note for using `class` types effectively with today's Ember typings: you will (at least for now) need to explicitly write out a `this` type for methods, computed property callbacks, and actions if you are going to use `get` or `set`

```ts
import Component from '@ember/component';

export default class UserProfile extends Component {
  changeUsername(this: UserProfile, userName: string) {
    //           ^---------------^
    // `this` tells TS to use `UserProfile` for `get` and `set` lookups
  }
}
```

This is a workaround for how incredibly dynamic `Ember.Object` instances are and hopefully will improve over time as we continue to iterate on the type definitions. Again, see [the relevant blog post for details][pt2].

#### Nested keys in `get` or `set`

In general, `this.get` and `this.set` will work as you'd expect _if_ you're doing lookups only a single layer deep. Things like `this.get('a.b.c')` don't (and can't ever!) type-check; see the blog posts for a more detailed discussion of why.

The workaround is simply to do one of two things:

1. **The type-safe approach.** This _will_ typecheck, but is both ugly and only works \*if there are no `null`s or `undefined`s along the way. If `nested` is `null` at runtime, this will crash!

   ```ts
   import { get } from '@ember/object';

   // -- Type-safe but ugly --//
   get(get(get(someObject, 'deeply'), 'nested'), 'key');
   ```

2. **Using `// @ts-ignore`.** This will _not do any type-checking_, but is useful for the cases where you are intentionally checking a path which may be `null` or `undefined` anywhere long it.

   ```ts
   // @ts-ignore
   get(someObject, 'deeply.nested.key');
   ```

   It's usually best to include an explanation of _why_ you're ignoring a lookup!

#### Service and controller injections

Ember does service and controller lookups with the `inject` functions at runtime, using the name of the service or controller being injected up as the default value—a clever bit of metaprogramming that makes for a nice developer experience. TypeScript cannot do this, because the name of the service or controller to inject isn't available at compile time in the same way.

This means that if you do things the normal Ember way, you will have to specify the type of your service or controller explicitly everywhere you use it. But… where should we put that? If we try to set it up as a [class property], we'll get an error as of Ember 3.1 (and it only accidentally works before that): computed properties and injections must be installed on the prototype.

[class property]: https://basarat.gitbooks.io/typescript/docs/classes.html#property-initializer

There are two basic approaches we can take. The first uses the `.extend` method in conjunction with class definitions to make sure the injections are set up correctly; the second leans on the still-experimental [Ember Decorators][decorators] project to let us do everything in the class body while still getting the niceties of ES6 classes. The decorators approach is much nicer, and likely to eventually become the standard across Ember in general assuming the decorators spec stabilizes. For today, however, it's an opt-in rather than the default because it remains an experimental extension to the JavaScript standard.

[decorators]: https://github.com/ember-decorators/ember-decorators

##### Using `.extend`

The officially supported method for injections uses a combination of class body and traditional `EmberObject.extend` functionality. We generate a service like normal by running `ember generate service my-session`. The resulting definition will look like this:

```ts
// my-app/services/my-session.ts
import Service from '@ember/service';
import RSVP from 'rsvp';

export default class MySession extends Service {
  login(email: string, password: string): RSVP.Promise<string> {
    // login and return the confirmation message
  }
}

declare module '@ember/service' {
  interface Registry {
    'my-session': MySession;
  }
}
```

(If you're converting an existing service, remember to add the module declaration at the end. This is what we'll use to tell TypeScript what the type of the service is in the injection.)

Then we can use the service as usual:

```ts
// my-app/components/user-profile.ts
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default class UserProfile extends Component.extend({
  mySession: service('my-session'),
}) {
  login(email: string, password: string) {
    this.session.login(email, password);
  }
}
```

Notice that the type of `mySession` will be the `MySession` type here: TypeScript is using the "registry" set up in the last lines of the `my-session` module to look up the type by its name. If we had written just `service()` instead, Ember would have resolved the correct type at runtime as usual, but TypeScript would not be able to tell *which* service we had, only that it was a `Service`. In that case, the `this.session` would not have a `login` property from TS's perspective, and this would fail to type-check. That extra string gives TS the information it needs to resolve the type and give us auto-completion, type-checking, etc.

(In Ember 3.0 or earlier, we would have `this.get('session').login(email, password);` instead.)

Although this may look a little strange, everything works correctly. We can use other ES6 class functionality and behaviors (including class properties) as normal; it is just the special Ember pieces which have to be set up on the prototype like this: injections, computed properties, and the `actions` hash.

##### Using decorators

The alternative here is to use [Ember Decorators][decorators]. In that case, we'd have precisely the same definition for our `MySession` service, but a much cleaner implementation in the component class:

```ts
// my-app/components/user-profile.ts
import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import MySession from 'my-app/services/my-session';

export default class UserProfile extends Component {
  @service mySession: MySession;

  login(this: UserProfile, email: string, password: string) {
    this.session.login(email, password);
  }
}
```

Note that we need the `MySession` type annotation this way, but we *don't* need the string lookup (unless we're giving the service a different name than the usual on the class, as in Ember injections in general). Without the type annotation, the type of `session` would just be `any`. This is because decorators (as of TS 2.8 – 3.0) are not allowed to modify the types of whatever they decorate. As a result, we wouldn't get any type-checking on that `session.login` call, and we wouldn't get any auto-completion either. Which would be really sad and take away a lot of the reason we're using TypeScript in the first place!

You'll need to add that module and interface declaration to all your existing service and controller declarations for this to work (again, see the [blog post][pt4] for further details), but once you do that, you'll have this much nicer experience throughout! It's not quite vanilla Ember.js, but it's close—and this way, you still get all those type-checking and auto-completion benefits, but with a lot less noise! Moreover, you actually get a significant benefit over "vanilla" Ember: we type-check that you typed the key correctly in the `service` invocation.

#### Ember Data lookups

We use the same basic approach for Ember Data type lookups with string keys as we do for service or controller injections. As a result, once you add the module and interface definitions for each model, serializer, and adapter in your app, you will automatically get type-checking and autocompletion and the correct return types for functions like `findRecord`, `queryRecord`, `adapterFor`, `serializerFor`, etc. No need to try to write out those (admittedly kind of hairy!) types; just write your Ember Data calls like normal and everything _should_ just work.

The declarations and changes you need to add to your existing files are:

* Models

  ```ts
  import DS from 'ember-data';

  export default class UserMeta extends DS.Model.extend({
    // attribute declarations here, as usual
  }) {}

  declare module 'ember-data' {
    interface ModelRegistry {
      'user-meta': UserMeta;
    }
  }
  ```

* Adapters

  ```ts
  import DS from 'ember-data';

  export default class UserMeta extends DS.Adapter {
    // properties and methods
  }

  declare module 'ember-data' {
    interface AdapterRegistry {
      'user-meta': UserMeta;
    }
  }
  ```

* Serializers

  ```ts
  import DS from 'ember-data';

  export default class UserMeta extends DS.Serializer {
    // properties and methods
  }

  declare module 'ember-data' {
    interface SerializerRegistry {
      'user-meta': UserMeta;
    }
  }
  ```

In addition to the registry, note the oddly defined class for `DS.Model`s. This is because we need to set up the attribute bindings on the prototype (for a discussion of how and why this is different from class properties, see [Typing Your Ember, Update, Part 2][pt2]), but we cannot just use a `const` here because we need a named type—like a class!—to reference in the type registry and elsewhere in the app.

[pt2]: http://www.chriskrycho.com/2018/typing-your-ember-update-part-2.html

##### Opt-in unsafety

Also notice that unlike with service and controller injections, there is no unsafe fallback method by default, because there isn't an argument-less variant of the functions to use as there is for `Service` and `Controller` injection. If for some reason you want to opt _out_ of the full type-safe lookup for the strings you pass into methods like `findRecord`, `adapterFor`, and `serializerFor`, you can add these declarations somewhere in your project:

```ts
import DS from 'ember-data';

declare module 'ember-data' {
  interface ModelRegistry {
    [key: string]: DS.Model;
  }

  interface AdapterRegistry {
    [key: string]: DS.Adapter;
  }

  interface SerializerRegistry {
    [key: string]: DS.Serializer;
  }
}
```

However, we **_strongly_** recommend that you simply take the time to add the few lines of declarations to each of your `DS.Model`, `DS.Adapter`, and `DS.Serializer` instances instead. It will save you time in even the short run!

##### Fixing the Ember Data `error TS2344` problem

If you're developing an Ember app or addon and _not_ using Ember Data (and accordingly not even have the Ember Data types installed), you may see an error like this and be confused:

```
node_modules/@types/ember-data/index.d.ts(920,56): error TS2344: Type 'any' does not satisfy the constraint 'never'.
```

This happens because the types for Ember's _test_ tooling includes the types for Ember Data because the `this` value in several of Ember's test types can include a reference to `DS.Store`.

**The fix:** add a declaration like this in a new file named `ember-data.d.ts` in your `types` directory:

```ts
declare module 'ember-data' {
  interface ModelRegistry {
    [key: string]: any;
  }
}
```

This works because (a) we include things in your types directory automatically and (b) TypeScript will merge this module and interface declaration with the main definitions for Ember Data from DefinitelyTyped behind the scenes.

If you're developing an addon and concerned that this might affect consumers, it won't. Your types directory will never be referenced by consumers at all!

#### Class property setup errors

Some common stumbling blocks for people switching to ES6 classes from the traditional EmberObject setup:

- `Assertion Failed: InjectedProperties should be defined with the inject computed property macros.` – You've written `someService = inject()` in an ES6 class body in Ember 3.1+. Replace it with the `.extend` approach or by using decorators (`@service` or `@controller`) as discussed [above](#service-and-controller-injections). Because computed properties of all sorts, including injections, must be set up on a prototype, *not* on an instance, if you try to use class properties to set up injections, computed properties, the action hash, and so on, you will see this error.

- `Assertion Failed: Attempting to lookup an injected property on an object without a container, ensure that the object was instantiated via a container.` – You failed to pass `...arguments` when you called `super` in e.g. a component class `constructor`. Always do `super(...arguments)`, not just `super()`, in your `constructor`.

### Type definitions outside `node_modules/@types`

By default, the TypeScript compiler loads all type definitions found in `node_modules/@types`. If the type defs you need are not found there and are not supplied in the root of the package you're referencing, you can register a custom value in `paths` in the `tsconfig.json` file. For example, if you're using [ember-browserify], you're used to writing imports like this:

[ember-browserify]: https://github.com/ef4/ember-browserify

```js
import MyModule from 'npm:my-module';
```

If `my-module` has types, you will not be able to resolve them this way by default. You can add a simple tweak to your `tsconfig.json` to resolve the types correctly, however, mapping `npm:my-module/*` to `node_modules/my-module/*`.

```json
{
  "compilerOptions": {
    "paths": {
      "my-app-name/*": ["app/*"],
      "npm:my-module/*": ["node_modules/my-module/*"]
    }
  }
}
```

### ember-cli-mirage

Mirage adds files from a nonstandard location to your application tree, so you'll need to tell the TypeScript compiler about how that layout works.

For an app, this should look roughly like:

```js
{
  "compilerOptions": {
    "paths": {
      // ...
      "my-app-name/mirage/*": "mirage/*",
    }
  },
  "include": [
    "app",
    "tests",
    "mirage"
  ]
}
```

And for an addon:

```js
{
  "compilerOptions": {
    "paths": {
      // ...
      "dummy/mirage/*": "tests/dummy/mirage/*",
    }
  },
  "include": [
    "addon",
    "tests"
  ]
}
```

Note that if Mirage was present when you installed ember-cli-typescript (or if you run `ember g ember-cli-typescript`), this configuration should be automatically set up for you.

### "TypeScript is complaining about multiple copies of the same types!"

You may sometimes see TypeScript errors indicating that you have duplicate type definitions for Ember, Ember Data, etc. This is usually the result of an annoying quirk of the way both npm and yarn resolve your dependencies in their lockfiles.

#### Just tell me how to fix it

There are two options here, neither of them _great_:

* manually edit `yarn.lock` or `package-lock.json` and merge the conflicting
* add a ["resolutions"] key to your `package.json` with the version you want to install of the types you're installing:

```json
{
  "resolutions": {
    "**/@types/ember": "2.8.15"
  }
}
```

["resolutions"]: https://yarnpkg.com/lang/en/docs/selective-version-resolutions/

#### Why is this happening?

If you're using another package which includes these types, and then you trigger an upgrade for your own copy of the type definitions, npm and yarn will both try to preserve the existing installation and simply add a new one for your updated version. In most cases, this is sane behavior, because it prevents transitive dependency breakage hell. However, in the _specific_ case of type definitions, it causes TypeScript to get confused.

## Using ember-cli-typescript with Ember CLI addons

During development, your `.ts` files will be watched and rebuilt just like any other sources in your addon when you run `ember serve`, `ember test`, etc.

However, in order not to force downstream consumers to install the entire TS build toolchain when they want to use an addon written in TypeScript, ember-cli-typescript is designed to allow you to publish vanilla `.js` files to the npm registry, alongside `.d.ts` declarations so that consumers who _are_ using TypeScript can benefit from it.

### Publishing

This addon provides two commands to help with publishing your addon: `ember ts:precompile` and `ember ts:clean`. The default `ember-cli-typescript` blueprint will configure your `package.json` to run these commands in the `prepublishOnly` and `postpublish` phases respectively, but you can also run them by hand to verify that the output looks as you expect.

The `ts:precompile` command will put compiled `.js` files in your `addon` directory and populate the overall structure of your package with `.d.ts` files laid out to match their import paths. For example, `addon/index.ts` would produce `addon/index.js` as well as `index.d.ts` in the root of your package.

The `ts:clean` command will remove the generated `.js` and `.d.ts` files, leaving your working directory back in a pristine state.

**Note**: While `.ts` files from both the `app` and `addon` directories of your addon will be transpiled by `ts:precompile`, only the declaration files from `addon` will be published. Since the final import paths for `app` files will depend on the name of the consuming application, we can't put those declaration files in a meaningful place.

### Linking Addons

Often when developing an addon, it can be useful to run that addon in the context of some other host app so you can make sure it will integrate the way you expect, e.g. using [`yarn link`](https://yarnpkg.com/en/docs/cli/link#search) or [`npm link`](https://docs.npmjs.com/cli/link).

When you do this for a TypeScript addon, by default your `.ts` files won't be consumed by the host app. In order for a linked addon to work, you need to take a few steps:

* ensure `ember-cli-typescript` is installed and set up in the host app
* override [`isDevelopingAddon()`](https://ember-cli.com/api/classes/Addon.html#method_isDevelopingAddon) in the linked addon to return `true`
* update the `paths` and `include` entries in your `tsconfig.json` to instruct the compiler how to resolve imports and include the addon's TypeScript files:

```js
compilerOptions: {
  // ...other options
  paths: {
    // ...other paths, e.g. for your tests/ tree
    "my-app": [
      "app/*",
      // add addon app directory that will be merged with the host application
      "node_modules/my-addon/app/*"
    ],
    // resolve: import x from 'my-addon';
    "my-addon": [
      "node_modules/my-addon/addon"
    ],
    // resolve: import y from 'my-addon/utils/y';
    "my-addon/*": [
      "node_modules/my-addon/addon/*"
    ]
  }
},
include: [
  // ...other includes, e.g. app, tests, types
  "node_modules/my-addon/app",
  "node_modules/my-addon/addon"
]
```

This will cause `ember-cli-typescript` in the host app to take over compiling the TS files in the addon as well, automatically rebuilding any time you make a change.

**Note**: remember to remove your `isDevelopingAddon` override before publishing!

### In-Repo Addons

[In-repo addons](https://ember-cli.com/extending/#detailed-list-of-blueprints-and-their-use) work in much the same way as linked ones: their TypeScript compilation is managed by the host app. They have `isDevelopingAddon` return `true` by default, so you only have to update the `paths` and `include` entries in your `tsconfig.json` to instruct the compiler how to resolve imports and include the addon's TypeScript files:

```js
compilerOptions: {
  // ...other options
  paths: {
    // ...other paths, e.g. for your tests/ tree
    "my-app": [
      "app/*",
      // add addon app directory that will be merged with the host application
      "lib/my-addon/app/*"
    ],
    // resolve: import x from 'my-addon';
    "my-addon": [
      "lib/my-addon/addon"
    ],
    // resolve: import y from 'my-addon/utils/y';
    "my-addon/*": [
      "lib/my-addon/addon/*"
    ]
  }
},
include: [
  // ...other includes, e.g. app, tests, types
  "lib/my-addon"
]
```

### Gotchas

A few things to look out for when working with TypeScript in addons:

* Normally, addons under development automatically return `true` from their `isDevelopingAddon()` hook, which `ember-cli-typescript` relies on to determine whether to process the addon's `.ts` files. However, if the name field in your `package.json` doesn't match the name in your `index.js`, this default behavior will fail and you'll need to override the method yourself.
* TypeScript has very particular rules when generating declaration files to avoid letting private types leak out unintentionally. You may find it useful to run `ember ts:precompile` yourself as you're getting a feel for these rules to ensure everything will go smoothly when you publish.

## Current limitations

While TS already works nicely for many things in Ember, there are a number of corners where it _won't_ help you out. Some of them are just a matter of further work on updating the [existing typings]; others are a matter of further support landing in TypeScript itself, or changes to Ember's object model.

[existing typings]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember

We are hard at work (and would welcome your help!) [writing new typings][ember-typings] for Ember and the surrounding ecosystem. If you'd like to try those out, please see instructions in [that repo][ember-typings]!

[ember-typings]: https://github.com/typed-ember/ember-typings

Here is the short list of things which do _not_ work yet in the version of the typings published on DefinitelyTyped.

### Some `import`s don't resolve

You'll frequently see errors for imports which TypeScript doesn't know how to resolve. For example, if you use Ember Concurrency today and try to import its `task` helper:

```typescript
import { task } from 'ember-concurrency';
```

You'll see an error, because there aren't yet type definitions for it. You may see the same with some addons as well. **These won't stop the build from working;** they just mean TypeScript doesn't know where to find those.

Writing these missing type definitions is a great way to pitch in! Jump in \#topic-typescript on the [Ember Slack][Slack] and we'll be happy to help you.

### Type safety when invoking actions

TypeScript won't detect a mismatch between this action and the corresponding call in the template:

```typescript
Ember.Component.extend({
  actions: {
    turnWheel(degrees: number) {
      // ...
    },
  },
});
```

```hbs
<button onclick={{action 'turnWheel' 'NOT-A-NUMBER'}}> Click Me </button>
```

Likewise, it won't notice a problem when you use the `send` method:

```typescript
// TypeScript compiler won't detect this type mismatch
this.send('turnWheel', 'ALSO-NOT-A-NUMBER');
```
