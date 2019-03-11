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

- ensure `ember-cli-typescript` is installed and set up in the host app
- override [`isDevelopingAddon()`](https://ember-cli.com/api/classes/Addon.html#method_isDevelopingAddon) in the linked addon to return `true`
- update the `paths` and `include` entries in your `tsconfig.json` to instruct the compiler how to resolve imports and include the addon's TypeScript files:

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

- Normally, addons under development automatically return `true` from their `isDevelopingAddon()` hook, which `ember-cli-typescript` relies on to determine whether to process the addon's `.ts` files. However, if the name field in your `package.json` doesn't match the name in your `index.js`, this default behavior will fail and you'll need to override the method yourself.
- TypeScript has very particular rules when generating declaration files to avoid letting private types leak out unintentionally. You may find it useful to run `ember ts:precompile` yourself as you're getting a feel for these rules to ensure everything will go smoothly when you publish.
