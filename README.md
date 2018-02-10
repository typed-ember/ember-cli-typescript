# ember-cli-typescript

Use TypeScript in your Ember 2.x and 3.x apps!

[![*nix build status (master)](https://travis-ci.org/typed-ember/ember-cli-typescript.svg?branch=master)](https://travis-ci.org/typed-ember/ember-cli-typescript) [![Windows build status](https://ci.appveyor.com/api/projects/status/i94uv7jgmrg022ho/branch/master?svg=true)](https://ci.appveyor.com/project/chriskrycho/ember-cli-typescript/branch/master)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cli-typescript.svg)](https://emberobserver.com/addons/ember-cli-typescript)

* [Setup and Configuration](#setup-and-configuration)
  * [Ember Support](#ember-support)
  * [`tsconfig.json`](#tsconfigjson)
* [Incremental adoption](#incremental-adoption)
* [Environment configuration typings](#environment-configuration-typings)
* [Using ember-cli-typescript with Ember CLI addons](#using-ember-cli-typescript-with-ember-cli-addons)
  * [Publishing](#publishing)
  * [Linking Addons](#linking-addons)
  * [Gotchas](#gotchas)
* [Using TypeScript with Ember effectively](#using-typescript-with-ember-effectively)
  * [Service and controller injections](#service-and-controller-injections)
  * [Opt-in unsafety for Ember Data lookups](#opt-in-unsafety-for-ember-data-lookups)
  * [Type definitions outside `node_modules/@types`](#type-definitions-outside-node_modulestypes)
  * [ember-browserify](#ember-browserify)
* [Current limitations](#current-limitations)
  * [Some `import`s don't resolve](#some-imports-dont-resolve)
  * [Type safety when invoking actions](#type-safety-when-invoking-actions)

## Setup and Configuration

To install the addon, just run:

```
ember install ember-cli-typescript@latest
```

All dependencies will be added to your `package.json`, and you're ready to roll! If you're upgrading from a previous release, you should check to merge any tweaks you've made to `tsconfig.json`.

In addition to ember-cli-typescript, the following are installed—all at their current "latest" value:

* Packages:
  * [`typescript`](https://github.com/Microsoft/TypeScript)
  * [`@types/ember`](https://www.npmjs.com/package/@types/ember)
  * [`@types/rsvp`](https://www.npmjs.com/package/@types/rsvp)
  * [`@types/ember-testing-helpers`](https://www.npmjs.com/package/@types/ember-testing-helpers)
* Files:
  * [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

### Ember support

ember-cli-typescript runs its test suite against the 2.12 LTS, the 2.16 LTS, the 2.18 LTS, the current release, the beta branch, and the canary branch. It's also in active use in several large applications. Any breakage for upcoming releases _should_ be detected and fixed ahead of those releases, but you can help us guarantee that by running your own Ember.js+TypeScript app with beta and canary turned on and let us know if you run into issues with upcoming Ember.js releases.

### `tsconfig.json`

In general, you may customize your TypeScript build process as usual using the `tsconfig.json` file. However, there are a couple points worth noting.

First, by default, we target the highest stable version of JavaScript available in the TypeScript compiler, so that you may ship anything from that very code without further modification to browsers that support it all the way back to ES3, in line with the Babel configuration in your app's `config/targets.js`. You can set this target to whatever is appropriate for your application, but we _strongly_ encourage you to leave it set to the highest stable version of JavaScript if you are developing an addon, so that consumers of your addon have full flexibility in this regard.

Second, if you make changes to the paths included in or excluded from the build via your `tsconfig.json`, you will need to restart the server to take the changes into account: ember-cli-typescript does not currently watch the `tsconfig.json` file

Finally, depending on what you're doing, you may notice that your tweaks to `tsconfig.json` aren't applied _exactly_ as you might expect, because the configuration file is used by both Ember CLI (via [broccoli]) and for tool
integration in editors.

[broccoli]: http://broccolijs.com/

Usually, the TypeScript compiler's behavior is determined entirely by configuration properties like `"include"`, `"exclude"`, `"outFile"`, and `"outDir"`. However, your editor _also_ leans on those properties to determine how to resolve files, what to do during file watching, etc. And in this case, we have the third player of Ember.js and Broccoli in play, managing the TypeScript compilation and feeding it only what it actually needs (so that Broccoli's support for tree merging, concatenation, etc. works as expected).

This addon takes the following approach to allow normal use with your editor tooling while also supporting the customization required for Broccoli:

* We generate a good default [blueprint], which will give you type resolution in your editor for normal Ember.js paths. The generated tsconfig file does not set `"outDir"` and sets `"noEmit"` to `true`. This allows you to run editors which use the compiler without creating `.js` files throughout your codebase.

* Then, before calling broccoli, the addon:

  * removes any configured `outDir` to avoid name resolution problems in the Broccoli tree processing
  * sets the `noEmit` option to `false` so that the compiler will emit files for consumption by your app
  * sets `allowJs` to `false`, so that the TypeScript compiler does not try to process JavaScript files imported by TypeScript files in your app
  * removes all values set for `include`, since we use Broccoli to manage the build pipeline directly

[blueprint]: https://github.com/emberwatch/ember-cli-typescript/blob/master/blueprints/ember-cli-typescript/files/tsconfig.json

You can still customize those properties in `tsconfig.json` for your use case. Just note that the changes won't directly impact how Ember/Broccoli builds your app!

For example, to see the output of the compilation in a separate folder you are welcome to set `"outDir"` to some path and set `"noEmit"` to `false`. Then tools which use the TypeScript compiler (e.g. the watcher tooling in JetBrains IDEs) will generate files at that location, while the Ember.js/Broccoli pipeline will continue to use its own temp folder.

## Incremental adoption

If you are porting an existing app to TypeScript, you can install this addon and migrate your files incrementally by changing their extensions from `.js` to `.ts`. A good approach is to start at your leaf files and then work your way up. As TypeScript starts to find errors, make sure to celebrate your (small) wins with your team, specially if some people are not convinced yet. We would also love to hear your stories!

You may also find the blog series ["Typing Your Ember"][typing-your-ember] helpful as it walks you through not only how to install but how to most effectively use TypeScript in an Ember app today, and gives some important info on the background and roadmap for the project.

[typing-your-ember]: http://www.chriskrycho.com/typing-your-ember.html

## Environment configuration typings

Along with the @types/ files mentioned above, ember-cli-typescript adds a starter interface for `config/environment.js` in `config/environment.d.ts`. This interface will likely require some changes to match your app.

## Using ember-cli-typescript with Ember CLI addons

During development, your `.ts` files will be watched and rebuilt just like any other sources in your addon when you run `ember serve`, `ember test`, etc.

However, in order not to force downstream consumers to install the entire TS build toolchain when they want to use an addon written in TypeScript, ember-cli-typescript is designed to allow you to publish vanilla `.js` files to the npm registry, alongside `.d.ts` declarations so that consumers who _are_ using TypeScript can benefit from it.

### Publishing

This addon provides two commands to help with publishing your addon: `ember ts:precompile` and `ember ts:clean`. The default `ember-cli-typescript` blueprint will configure your `package.json` to run these commands in the `prepublishOnly` and `postpublish` phases respectively, but you can also run them by hand to verify that the output looks as you expect.

The `ts:precompile` command will put compiled `.js` files in your `addon` directory and populate the overall structure of your package with `.d.ts` files laid out to match their import paths. For example, `addon/index.ts` would produce `addon/index.js` as well as `index.d.ts` in the root of your package.

The `ts:clean` command will remove the generated `.js` and `.d.ts` files, leaving your working directory back in a pristine state.

### Linking Addons

Often when developing an addon, it can be useful to run that addon in the context of some other host app so you can make sure it will integrate the way you expect, e.g. using [`yarn link`](https://yarnpkg.com/en/docs/cli/link#search) or [`npm link`](https://docs.npmjs.com/cli/link).

When you do this for a TypeScript addon, by default your `.ts` files won't be consumed by the host app. In order for a linked addon to work, you need to take two steps:

* ensure `ember-cli-typescript` is installed and set up in the host app
* override [`isDevelopingAddon()`](https://ember-cli.com/api/classes/Addon.html#method_isDevelopingAddon) in the linked addon to return `true`

This will cause `ember-cli-typescript` in the host app to take over compiling the TS files in the addon as well, automatically rebuilding any time you make a change.

**Note**: remember to remove your `isDevelopingAddon` override before publishing!

### In-Repo Addons

[In-repo addons](https://ember-cli.com/extending/#detailed-list-of-blueprints-and-their-use) work in much the same way as linked ones: their TypeScript compilation is managed by the host app. They have `isDevelopingAddon` return `true` by default, so the only thing you should need to do for an in-repo addon is update the `paths` entry in your `tsconfig.json` so instruct the compiler how to resolve imports:

```js
paths: {
  // ...other entries e.g. for your app/ and tests/ trees
  'my-addon': ['lib/my-addon/addon'],    // resolve `import x from 'my-addon';
  'my-addon/*': ['lib/my-addon/addon/*'] // resolve `import y from 'my-addon/utils/y';
}
```

### Gotchas

A few things to look out for when working with TypeScript in addons:

* Normally, addons under development automatically return `true` from their `isDevelopingAddon()` hook, which `ember-cli-typescript` relies on to determine whether to process the addon's `.ts` files. However, if the name field in your `package.json` doesn't match the name in your `index.js`, this default behavior will fail and you'll need to override the method yourself.
* TypeScript has very particular rules when generating declaration files to avoid letting private types leak out unintentionally. You may find it useful to run `ember ts:precompile` yourself as you're getting a feel for these rules to ensure everything will go smoothly when you publish.

## Using TypeScript with Ember effectively

In addition to the points made below, you may find the "Update" sequence in the [Typing Your Ember][typing-your-ember] blog series particularly helpful in knowing how to do specific things. In particular, [Update, Part 4][pt4] is a really important guide to making the service and controller injections and Ember Data lookups behave as described below.

[pt4]: http://www.chriskrycho.com/2018/typing-your-ember-update-part-4.html

## Service and controller injections

Ember does service and controller lookups with the `inject` helpers at runtime, using the name of the service or controller being injected up as the default value—a clever bit of metaprogramming that makes for a nice developer experience. TypeScript cannot do this, because the name of the service or controller to inject isn't available at compile time in the same way. This means that if you do things the normal Ember way, you will have to specify the type of your service or controller explicitly everywhere you use it.

```ts
// my-app/services/session.ts
import Service from '@ember/service';
import RSVP from 'rsvp';

export default class Session extends Service {
  login(email: string, password: string): RSVP.Promise<string> {
    // login and return the confirmation message
  }
}
```

```ts
// my-app/components/user-profile.ts
import Component from '@ember/component';
import Computed from '@ember/object/computed';
import { inject as service } from '@ember/service';

import Session from 'my-app/services/session';

export default class UserProfile extends Component {
  session: Computed<Session> = service();

  actions = {
    login(this: UserProfile, email: string, password: string) {
      this.get('session').login(email, string);
    },
  };
}
```

The type of `session` would just be `Computed<Service>` if we didn't explicitly type it out. As a result, we wouldn't get any type-checking on that `.login` call (and in fact we'd get an incorrect type _error_!), and we wouldn't get any auto-completion either. Which would be really sad and take away a lot of the reason we're using TypeScript in the first place!

The handy workaround we supply is simply to write some boilerplate (though take heart! We have generators for any _new_ services or controllers you create) and then explicitly name the service or controller with its "dasherized" name, just like you would if you were mapping it to a different local name:

```ts
// my-app/services/session.ts
import Service from '@ember/service';
import RSVP from 'rsvp';

export default class Session extends Service {
  login(email: string, password: string): RSVP.Promise<string> {
    // login and return the confirmation message
  }
}

declare module '@ember/service' {
  interface Registry {
    session: Session;
  }
}
```

```
// my-app/components/user-profile.ts
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default class UserProfile extends Component {
  session = service('session');

  actions = {
    login(this: UserProfile, email: string, password: string) {
      this.get('session').login(email, string);
    }
  }
}
```

The corresponding declaration for controllers is:

```ts
declare module '@ember/controller' {
  interface Registry {
    // add your key here, like `'dasherized-name': ClassifiedName;`
  }
}
```

You'll need to add that module and interface declaration to all your existing service and controller declarations for this to work (again, see the [blog post][pt4] for further details), but once you do that, you'll have this much nicer experience throughout! It's not quite vanilla Ember.js, but it's close—and this way, you still get all those type-checking and auto-completion benefits, but with a lot less noise! Moreover, you actually get a significant benefit over "vanilla" Ember: we type-check that you typed the key correctly in the `service` invocation.

If you have a reason to fall back to just getting the `Service` or `Controller` types, you can always do so by just using the string-less variant: `service('session')` will check that the string is a valid name of a service; `session()` will not.

## Opt-in unsafety for Ember Data lookups

The same basic approach is in play for Ember Data lookups. As a result, once you add the module and interface definitions for each model, serializer, and adapter in your app, you will automatically get type-checking and autocompletion and the correct return types for functions like `findRecord`, `queryRecord`, `adapterFor`, `serializerFor`, etc. No need to try to write out those (admittedly kind of hairy!) types; just write your Ember Data calls like normal and everything _should_ just work.

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

### Type definitions outside `node_modules/@types`

By default the typescript compiler loads up any type definitions found in `node_modules/@types`. If the type defs you need are not found here you can register a custom value in `paths` in the `tsconfig.json` file. For example, if you are using [True Myth], you'll need to follow that project's installation instructions (since it ships types in a special location to support both CommonJS and ES Modules):

[true myth]: https://github.com/chriskrycho/true-myth

```json
{
  "compilerOptions": {
    "paths": {
      "my-app-name/*": ["app/*"],
      "true-myth/*": ["node_modules/true-myth/dist/types/src/*"]
    }
  }
}
```

### ember-browserify

If you're using [ember-browserify], you're used to writing imports like this:

[ember-browserify]: https://github.com/ef4/ember-browserify

```js
import 'npm:my-module' from 'my-module';
```

If the `my-module` has types, you will not be able to resolve them this way by default. You can add a simple tweak to your `tsconfig.json` to resolve the types correctly, hwowever:

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

## Current limitations

While TS already works nicely for many things in Ember, there are a number of corners where it _won't_ help you out. Some of them are just a matter of further work on updating the [existing typings]; others are a matter of further support landing in TypeScript itself, or changes to Ember's object model.

[existing typings]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember

We are hard at work (and would welcome your help!) [writing new typings][ember-typings] for Ember and the surrounding ecosystem. If you'd like to try those out, please see instructions in [that repo][ember-typings]!

[ember-typings]: https://github.com/typed-ember/ember-typings

Here is the short list of things which do _not_ work yet in the version of the typings published on DefinitelyTyped.

### Some `import`s don't resolve

You'll frequently see errors for imports which TypeScript doesn't know how to
resolve. For example, if you use Ember Concurrency today and try to import its
`task` helper:

```typescript
import { task } from 'ember-concurrency';
```

You'll see an error, because there aren't yet type definitions for it. You may
see the same with some addons as well. **These won't stop the build from
working;** they just mean TypeScript doesn't know where to find those.

Writing these missing type definitions is a great way to pitch in! Jump in
\#topic-typescript on the Ember Slack and we'll be happy to help you.

### Type safety when invoking actions

TypeScript won't detect a mismatch between this action and the corresponding
call in the template:

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
