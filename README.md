# ember-cli-typescript

Use TypeScript in your Ember 2.x apps!

[![*nix build status (master)](https://travis-ci.org/typed-ember/ember-cli-typescript.svg?branch=master)](https://travis-ci.org/typed-ember/ember-cli-typescript) [![Windows build status](https://ci.appveyor.com/api/projects/status/i94uv7jgmrg022ho/branch/master?svg=true)](https://ci.appveyor.com/project/chriskrycho/ember-cli-typescript/branch/master)
 [![Ember Observer Score](https://emberobserver.com/badges/ember-cli-typescript.svg)](https://emberobserver.com/addons/ember-cli-typescript)

(👆that failing Travis build [is a lie](https://travis-ci.org/typed-ember/ember-cli-typescript). The Ember CLI issue, related to ember-try, is [here](https://github.com/ember-cli/ember-try/issues/161).)

## Installing/Upgrading

Just run:

```
ember install ember-cli-typescript@1
```

All dependencies will be added to your `package.json`, and you're ready to roll!
(If you're upgrading from a previous release, you should check to merge any
tweaks you've made to `tsconfig.json`.

In addition to ember-cli-typescript, the following are installed:

- Packages:
    + [`typescript`](https://github.com/Microsoft/TypeScript) (2.4 or greater)
    + [`@types/ember`](https://www.npmjs.com/package/@types/ember)
    + [`@types/rsvp`](https://www.npmjs.com/package/@types/rsvp)
    + [`@types/ember-testing-helpers`](https://www.npmjs.com/package/@types/ember-testing-helpers)
- Files:
    + [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

## Notes on `tsconfig.json`

If you make changes to the paths included in your `tsconfig.json`, you will need
to restart the server to take the changes into account. Additionally, depending
on what you're doing, you may notice that your tweaks to `tsconfig.json` aren't
applied *exactly* as you might expect.

### The Problem

The configuration file is used by both Ember CLI (via [broccoli]) and for tool
integration in editors.

[broccoli]: http://broccolijs.com/

Broccoli controls the inputs and the output folder of the various build steps
that make the Ember build pipeline. Its expectation are impacted by TypeScript
configuration properties like "include", "exclude", "outFile", "outDir".

We want to allow you to change unrelated properties in the tsconfig file.

### The Solution

This addon takes the following approach to allow this dual use:

- We generate a good default [blueprint], which will give you type resolution in
  your editor for normal Ember.js paths. The generated tsconfig file does not
  set `"outDir"` and sets `"noEmit"` to `true`. This allows you to run editors
  which use the compiler without creating `.js` files throughout your codebase.

- Then, before calling broccoli, the addon:
    + removes any configured `outDir` to avoid name resolution problems in the
      broccoli tree processing
    + sets the `noEmit` option to `false` so that the compiler will emit files
      for consumption by your app
    + sets `allowJs` to `false`, so that the TypeScript compiler does not try to
      process JavaScript files imported by TypeScript files in your app
    + removes all values set for `include`, since we use Broccoli to manage the
      build pipeline directly.

[blueprint]: https://github.com/emberwatch/ember-cli-typescript/blob/master/blueprints/ember-cli-typescript/files/tsconfig.json

### Customization

You can still customize the `tsconfig.json` file further for your use case. For
example, to see the output of the compilation in a separate folder you are
welcome to set `"outDir"` to some path and set `"noEmit"` to `false`. Then tools
which use the TypeScript compiler will generate files at that location, while
the broccoli pipeline will continue to use its own temp folder.

## Incremental adoption

If you are porting an existing app to TypeScript, you can install this addon and
migrate your files incrementally by changing their extensions from `.js` to
`.ts`.  A good approach is to start at your leaf files and then work your way
up. As TypeScript starts to find errors, make sure to celebrate your (small)
wins with your team, specially if some people are not convinced yet. We would
also love to hear your stories!

You may also find the blog series ["Typing Your Ember"][typing-your-ember]
helpful as it walks you through not only how to install but how to most
effectively use TypeScript in an Ember app today, and gives some important info
on the background and roadmap for the project.

[typing-your-ember]: http://www.chriskrycho.com/typing-your-ember.html

## Environment configuration typings

Along with the @types/ files mentioned above, ember-cli-typescript adds a
starter interface for `config/environment.js` in `config/environment.d.ts`.
This interface will likely require some changes to match your app.

## :construction: Using ember-cli-typescript with Ember CLI addons

**:warning: Warning: this is *not* currently recommended. This is a WIP part of
the add-on, and it *will* make a dramatic difference in the size of your add-on
in terms of installation. The upcoming 1.1 release will enable a much better
experience for consumers of your addon.**

We're working on making a solution that lets us ship generated typings and
compiled JavaScript instead of shipping the entire TypeScript compiler toolchain
for add-ons. If you're using ember-cli-typescript in an add-on, you might add a
note to your users about the install size until we get that sorted out!

If you want to experiment with this in the meantime, you can do so, but please
give users fair warning about the increased size. To enable TypeScript for your
addon, simple move `ember-cli-typescript` from `devDependencies` to
`dependencies` in your `package.json`.

## Not (yet) supported

While TS already works nicely for many things in Ember, there are a number of
corners where it *won't* help you out. Some of them are just a matter of further
work on updating the [existing typings]; others are a matter of further support
landing in TypeScript itself.

[existing typings]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember

We are hard at work (and would welcome your help!) [writing new
typings][ember-typings] for Ember and the surrounding ecosystem, which can give
correct types for Ember's custom object model and things which build on it (e.g.
ember-data). If you'd like to try those out, please see instructions in [that
repo][ember-typings]!

[ember-typings]: https://github.com/typed-ember/ember-typings

Here is the short list of things which do *not* work yet in the version of the
typings published on DefinitelyTyped.

### New modules API

Note: the new modules API is not yet supported by the official typings (which
are distinct from this addon, though we install them). We do have experimental
support for them in the [ember-typings] repository, and it works quite well!

### Some `import`s don't resolve

You'll frequently see errors for imports which TypeScript doesn't know how to
resolve. For example, if you use `htmlbars-inline-precompile`:

```typescript
import hbs from 'htmlbars-inline-precompile';
```

You'll see an error, because there aren't yet type definitions for it. You may
see the same with some addons as well. These won't stop the build from working;
they just mean TypeScript doesn't know where to find those.

Writing these missing type definitions is a great way to pitch in! Jump in
\#topic-typescript on the Ember Slack and we'll be happy to help you.

### `extends` gives errors

You'll see quite a few errors like this when calling `.extends()` on an existing
Ember type:

> Class 'FooController' incorrectly extends base class 'Controller'.
> Type '{ bar(): void; }' has no properties in common with type 'ActionHash'

This is a symptom of the current, out-of-date types. The new typings we're
working on will solve these.

In the meantime, note that your application will still build just fine even with
these errors... they'll just be annoying.

### Type safety when invoking actions

TypeScript won't detect a mismatch between this action and the corresponding
call in the template:

```typescript
Ember.Component.extend({
  actions: {
     turnWheel(degrees: number) {
        // ...
     }
  },
})
```

```hbs
<button onclick={{action 'turnWheel' 'NOT-A-NUMBER'}}> Click Me </button>
```

Likewise, it won't notice a problem when you use the `send` method:

```typescript
// TypeScript compiler won't detect this type mismatch
this.send('turnWheel', 'ALSO-NOT-A-NUMBER');
```

### Type safety with `Ember.get`, `Ember.set`, etc.

When you use `Ember.get` or `Ember.set`, TypeScript won't yet warn you that
you're using the wrong type. So in `foo()` here, this will compile but be
wrong at runtime:

```typescript
Ember.Object.extend({
  urls: <string[]> null,
  port: 4200,  // number

  init() {
     this._super(...arguments);
     this.set('urls', []);
  },

  foo() {
    // TypeScript won't detect these type mismatches
    this.get('urls').addObject(51);
    this.set('port', '3000');
  },
});
```


### The type definitions I need to reference are not in `node_modules/@types`

By default the typescript compiler loads up any type definitions found in
`node_modules/@types`. If the type defs you need are not found here you can
register a custom value in `paths` in the `tsconfig.json` file. For example, for
the Redux types, you can add a `"redux"` key:

```json
{
  "compilerOptions": {
    "paths": {
      "my-app-name/*": ["app/*"],
      "redux": ["node_modules/redux/index.d.ts"]
    }
  }
}
```
