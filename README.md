# ember-cli-typescript

Use TypeScript in your Ember 2.x and 3.x apps!

[![*nix build status (master)](https://travis-ci.org/typed-ember/ember-cli-typescript.svg?branch=master)](https://travis-ci.org/typed-ember/ember-cli-typescript) [![Windows build status](https://ci.appveyor.com/api/projects/status/i94uv7jgmrg022ho/branch/master?svg=true)](https://ci.appveyor.com/project/chriskrycho/ember-cli-typescript/branch/master)
 [![Ember Observer Score](https://emberobserver.com/badges/ember-cli-typescript.svg)](https://emberobserver.com/addons/ember-cli-typescript)

## Installing/Upgrading

Just run:

```
ember install ember-cli-typescript
```

All dependencies will be added to your `package.json`, and you're ready to roll!
(If you're upgrading from a previous release, you should check to merge any
tweaks you've made to `tsconfig.json`.)

In addition to ember-cli-typescript, the following are installed—all at their current "latest" value:

- Packages:
    + [`typescript`](https://github.com/Microsoft/TypeScript)
    + [`@types/ember`](https://www.npmjs.com/package/@types/ember)
    + [`@types/rsvp`](https://www.npmjs.com/package/@types/rsvp)
    + [`@types/ember-testing-helpers`](https://www.npmjs.com/package/@types/ember-testing-helpers)
- Files:
    + [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

## Ember support

ember-cli-typescript runs its test suite against the 2.12 LTS, the 2.16 LTS, the 2.18 LTS, the current release, the beta branch, and the canary branch. It's also in active use in several large applications. Any breakage for upcoming releases *should* be detected and fixed ahead of those releases, but you can help us guarantee that by running your own Ember.js+TypeScript app with beta and canary turned on and let us know if you run into issues with upcoming Ember.js releases.

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

## Using ember-cli-typescript with Ember CLI addons

During development, your `.ts` files will be watched and rebuilt just like any
other sources in your addon when you run `ember serve`, `ember test`, etc.

However, in order not to force downstream consumers to install the entire TS
build toolchain when they want to use an addon written in TypeScript,
ember-cli-typescript is designed to allow you to publish vanilla `.js` files
to the npm registry, alongside `.d.ts` declarations so that consumers who _are_
using TypeScript can benefit from it.

### Publishing

This addon provides two commands to help with publishing your addon:
`ember ts:precompile` and `ember ts:clean`. The default `ember-cli-typescript`
blueprint will configure your `package.json` to run these commands in the
`prepublishOnly` and `postpublish` phases respectively, but you can also run
them by hand to verify that the output looks as you expect.

The `ts:precompile` command will put compiled `.js` files in your `addon`
directory and populate the overall structure of your package with `.d.ts`
files laid out to match their import paths. For example, `addon/index.ts`
would produce `addon/index.js` as well as `index.d.ts` in the root of your
package.

The `ts:clean` command will remove the generated `.js` and `.d.ts` files,
leaving your working directory back in a pristine state.

### Linking Addons

Often when developing an addon, it can be useful to run that addon in the
context of some other host app so you can make sure it will integrate the way
you expect, e.g. using [`yarn link`](https://yarnpkg.com/en/docs/cli/link#search)
or [`npm link`](https://docs.npmjs.com/cli/link).

When you do this for a TypeScript addon, by default your `.ts` files won't be
consumed by the host app. In order for a linked addon to work, you need to take
two steps:
 - ensure `ember-cli-typescript` is installed and set up in the host app
 - override [`isDevelopingAddon()`](https://ember-cli.com/api/classes/Addon.html#method_isDevelopingAddon)
   in the linked addon to return `true`

This will cause `ember-cli-typescript` in the host app to take over compiling
the TS files in the addon as well, automatically rebuilding any time you make
a change.

**Note**: remember to remove your `isDevelopingAddon` override before publishing!

### In-Repo Addons

[In-repo addons](https://ember-cli.com/extending/#detailed-list-of-blueprints-and-their-use)
work in much the same way as linked ones: their TypeScript compilation is managed
by the host app. They have `isDevelopingAddon` return `true` by default, so the
only thing you should need to do for an in-repo addon is update the `paths`
entry in your `tsconfig.json` so instruct the compiler how to resolve imports:

```js
paths: {
  // ...other entries e.g. for your app/ and tests/ trees
  'my-addon': ['lib/my-addon/addon'],    // resolve `import x from 'my-addon';
  'my-addon/*': ['lib/my-addon/addon/*'] // resolve `import y from 'my-addon/utils/y';
}
```

### Gotchas

A few things to look out for when working with TypeScript in addons:
 - Normally, addons under development automatically return `true` from their
   `isDevelopingAddon()` hook, which `ember-cli-typescript` relies on to determine
   whether to process the addon's `.ts` files. However, if the name field in
   your `package.json` doesn't match the name in your `index.js`, this default
   behavior will fail and you'll need to override the method yourself.
 - TypeScript has very particular rules when generating declaration files to
   avoid letting private types leak out unintentionally. You may find it useful
   to run `ember ts:precompile` yourself as you're getting a feel for these rules
   to ensure everything will go smoothly when you publish.

## Not (yet) supported

While TS already works nicely for many things in Ember, there are a number of
corners where it *won't* help you out. Some of them are just a matter of further
work on updating the [existing typings]; others are a matter of further support
landing in TypeScript itself.

[existing typings]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember

We are hard at work (and would welcome your help!) [writing new
typings][ember-typings] for Ember and the surrounding ecosystem. If you'd like
to try those out, please see instructions in [that repo][ember-typings]!

[ember-typings]: https://github.com/typed-ember/ember-typings

Here is the short list of things which do *not* work yet in the version of the
typings published on DefinitelyTyped.

### Some `import`s don't resolve

You'll frequently see errors for imports which TypeScript doesn't know how to
resolve. For example, if you use Ember Concurrency today and try to import its
`task` helper:

```typescript
import { task }  from 'ember-concurrency';
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
