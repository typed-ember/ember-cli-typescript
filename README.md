# ember-cli-typescript

[![*nix build status](https://travis-ci.org/emberwatch/ember-cli-typescript.svg?branch=master)](https://travis-ci.org/emberwatch/ember-cli-typescript) [![Windows build status](https://ci.appveyor.com/api/projects/status/pjilqv1xo3o9auon/branch/master?svg=true)](https://ci.appveyor.com/project/chriskrycho/ember-cli-typescript/branch/master) [![Ember Observer Score](https://emberobserver.com/badges/ember-cli-typescript.svg)](https://emberobserver.com/addons/ember-cli-typescript)

Use TypeScript in your Ember 2.x apps!


## Installation

Just run:

```
ember install ember-cli-typescript
```

All dependencies will be added to your `package.json`, and you're ready to roll!

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

Please see [the wiki] for additional how to tips from other users or to add
your own tips. If an use case is frequent enough we can codify in the plugin.

[the wiki]: https://github.com/emberwatch/ember-cli-typescript/wiki/tsconfig-how-to

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

## :construction: Using ember-cli-typescript with Ember CLI addons

**:warning: Warning: this is *not* currently recommended. This is a WIP part of the
add-on, and it *will* make a dramatic difference in the size of your add-on in
terms of installation. The upcoming 1.1 release will enable a much better
experience for consumers of your addon.**

We're working on making a solution that lets us ship generated typings and
compiled JavaScript instead of shipping the entire TypeScript compiler toolchain
for add-ons. If you're using ember-cli-typescript in an add-on, you might add a
note to your users about the install size until we get that sorted out!

If you want to experiment with this in the meantime, you can do so, but please
give users fair warning about the increased size. To enable TypeScript for your
addon, simple move `ember-cli-typescript` from `devDependencies` to
`dependencies` in your `package.json`.

## New modules API

Note: the new modules API is not yet supported by the official typings (which
are distinct from this addon, though we install them). We hope to have support
for them shortly!

## Not (yet) supported

While TS already works nicely for many things in Ember, there are a number of
corners where it *won't* help you out. Some of them are just a matter of further
work on updating the [existing typings]; others are a matter of further support
landing in TypeScript itself.

[existing typings]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember

We are hard at work (and would welcome your help!) [writing new typings] for
Ember which can give correct types for Ember's custom object model. If you'd
like to try those out, please see instructions in that repo!

[writing new typings]: https://github.com/typed-ember/ember-typings

Here is the short list of things which do *not* work yet in the version of the
typings published on DefinitelyTyped.

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
