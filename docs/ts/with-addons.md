# Building Addons in TypeScript

Building addons in TypeScript offers many of the same benefits as building apps that way: it puts an extra tool at your disposal to help document your code and ensure its correctness. For addons, though, there's one additional bonus: publishing type information for your addons enables autocomplete and inline documentation for your consumers, even if they're not using TypeScript themselves.

## Key Differences from Apps

To process `.ts` files, `ember-cli-typescript` tells Ember CLI to [register a set of Babel plugins](https://devblogs.microsoft.com/typescript/typescript-and-babel-7/) so that Babel knows how to strip away TypeScript-specific syntax. This means that `ember-cli-typescript` operates according to the same set of rules as other preprocessors when used by other addons.

* Like other addons that preprocess source files, **`ember-cli-typescript` must be in your addon's `dependencies`, not `devDependencies`**.
* Because addons have no control over how files in `app/` are transpiled, **you cannot have `.ts` files in your addon's `app/` folder**.

## Publishing

When you publish an addon written in TypeScript, the `.ts` files will be consumed and transpiled by Babel as part of building the host application the same way `.js` files are, in order to meet the requirements of the application's `config/targets.js`. This means that no special steps are required for your source code to be consumed by users of your addon.

Even though you publish the source `.ts` files, though, by default you consumers who also use TypeScript won't be able to benefit from those types, because the TS compiler isn't aware of how `ember-cli` resolves import paths for addon files. For instance, if you write `import { foo } from 'my-addon/bar';`, the typechecker has no way to know that the actual file on disk for that import path is at `my-addon/addon/bar.ts`.

In order for your addon's users to benefit from type information from your addon, you need to put `.d.ts` _declaration files_ at the location on disk where the compiler expects to find them. This addon provides two commands to help with that: `ember ts:precompile` and `ember ts:clean`. The default `ember-cli-typescript` blueprint will configure your `package.json` to run these commands in the `prepublishOnly` and `postpublish` phases respectively, but you can also run them by hand to verify that the output looks as you expect.

The `ts:precompile` command will populate the overall structure of your package with `.d.ts` files laid out to match their import paths. For example, `addon/index.ts` would produce an `index.d.ts` file in the root of your package.

The `ts:clean` command will remove the generated `.d.ts` files, leaving your working directory back in a pristine state.

The TypeScript compiler has very particular rules when generating declaration files to avoid letting private types leak out unintentionally. You may find it useful to run `ember ts:precompile` yourself as you're getting a feel for these rules to ensure everything will go smoothly when you publish.

## Linking Addons

Often when developing an addon, it can be useful to run that addon in the context of some other host app so you can make sure it will integrate the way you expect, e.g. using [`yarn link`](https://yarnpkg.com/en/docs/cli/link#search) or [`npm link`](https://docs.npmjs.com/cli/link).

When you do this for a TypeScript addon, the source files will be picked up in the host app build and everything will execute at runtime as you'd expect. If the host app is also using TypeScript, though, it won't be able to resolve imports from your addon by default, for the reasons outlined above in the Publishing section.

You could run `ember ts:precompile` in your addon any time you change a file, but for development a simpler option is to temporarily update the `paths` configuration in the host application so that it knows how to resolve types from your linked addon.

Add entries for `<addon-name>` and `<addon-name>/*` in your `tsconfig.json` like so:

```javascript
compilerOptions: {
  // ...other options
  paths: {
    // ...other paths, e.g. for your app/ and tests/ trees
    // resolve: import x from 'my-addon';
    "my-addon": [
      "node_modules/my-addon/addon"
    ],
    // resolve: import y from 'my-addon/utils/y';
    "my-addon/*": [
      "node_modules/my-addon/addon/*"
    ]
  }
}
```

## In-Repo Addons

[In-repo addons](https://ember-cli.com/extending/#detailed-list-of-blueprints-and-their-use) work in much the same way as linked ones. Their `.ts` files are managed automatically by `ember-cli-typescript` in their `dependencies`, and you can ensure imports resolve correctly from the host by adding entries in `paths` in the base `tsconfig.json` file.

Note that the `in-repo-addon` blueprint should automatically add these entries if you have `ember-cli-typescript-blueprints` installed when you run it.

```javascript
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
}
```

One difference as compared to regular published addons: you know whether or not the host app is using `ember-cli-typescript`, and if it is, you can safely put `.ts` files in an in-repo addon's `app/` folder.

