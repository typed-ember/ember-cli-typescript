# Configuring ember-cli-typescript

## `tsconfig.json`

We generate a good default [`tsconfig.json`][blueprint], which will usually make everything _Just Work™_. In general, you may customize your TypeScript build process as usual using the `tsconfig.json` file.

However, there are a few things worth noting if you're already familiar with TypeScript and looking to make further or more advanced customizations (i.e. _most_ users can just ignore this section!):

1. The generated tsconfig file does not set `"outDir"` and sets `"noEmit"` to `true`. Under the hood, Ember's own invocation of `tsc` _does_ set these, but the default configuration we generate allows you to run editors which use the compiler without creating extraneous `.js` files throughout your codebase, leaving the compilation to ember-cli-typescript to manage.

   You _can_ still customize those properties in `tsconfig.json` if your use case requires it, however. For example, to see the output of the compilation in a separate folder you are welcome to set `"outDir"` to some path and set `"noEmit"` to `false`. Then tools which use the TypeScript compiler (e.g. the watcher tooling in JetBrains IDEs) will generate files at that location, while the Ember.js/Broccoli pipeline will continue to use its own temp folder.

2. Closely related to the previous point: any changes you do make to `outDir` won't have any effect on how _Ember_ builds your application—we have to pipe everything into Ember CLI via [broccoli], so we override that. In general, everything else works just as you'd expect, though!

3. Since your application is built by Babel, and only *type-checked* by TypeScript, the `target` key in `tsconfig.json` is ignored. The Babel configuration in your app's `config/targets.js` will determine the build output instead.

4. If you make changes to the paths included in or excluded from the build via your `tsconfig.json` (using the `"include"`, `"exclude"`, or `"files"` keys), you will need to restart the server to take the changes into account: ember-cli-typescript does not currently watch the `tsconfig.json` file.

[blueprint]: https://github.com/typed-ember/ember-cli-typescript/blob/master/blueprints/ember-cli-typescript/files/tsconfig.json
[broccoli]: http://broccolijs.com/

## Enabling Sourcemaps

To enable TypeScript sourcemaps, you'll need to add the corresponding configuration for Babel to your `ember-cli-build.js` file:

```ts
const app = new EmberApp(defaults, {
  babel: {
    sourceMaps: 'inline',
  },
});
```

(Note that this _will_ noticeably slow down your app rebuilds.)

If you're updating from an older version of the addon, you may also need to update your `tsconfig.json`. (Current versions generate the correct config at installation.) Either run `ember generate ember-cli-typescript` or verify you have the same sourcemap settings in your `tscsonfig.json` that appear in [the blueprint](https://github.com/typed-ember/ember-cli-typescript/blob/master/blueprints/ember-cli-typescript/files/tsconfig.json).

