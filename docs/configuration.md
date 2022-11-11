# Configuration

## `tsconfig.json`

We generate a good default [`tsconfig.json`](https://github.com/typed-ember/ember-cli-typescript/blob/master/blueprint-files/ember-cli-typescript/tsconfig.json), which will usually make everything _Just Work™_. In general, you may customize your TypeScript build process as usual using the `tsconfig.json` file.

However, there are a few things worth noting if you're already familiar with TypeScript and looking to make further or more advanced customizations (but _most_ users can just ignore this section!):

1. The generated tsconfig file does not set `"outDir"` and sets `"noEmit"` to `true`. The default configuration we generate allows you to run editors which use the compiler without creating extraneous `.js` files throughout your codebase, leaving the compilation to ember-cli-typescript to manage.

   You _can_ still customize those properties in `tsconfig.json` if your use case requires it, however. For example, to see the output of the compilation in a separate folder you are welcome to set `"outDir"` to some path and set `"noEmit"` to `false`. Then tools which use the TypeScript compiler (e.g. the watcher tooling in JetBrains IDEs) will generate files at that location, while the Ember.js/[Broccoli](https://broccoli.build) pipeline will continue to use its own temp folder.

2. Closely related to the previous point: any changes you do make to `outDir` won't have any effect on how _Ember_ builds your application—we run the entire build pipeline through Babel's TypeScript support instead of through the TypeScript compiler.
3. Since your application is built by Babel, and only _type-checked_ by TypeScript, we set the `target` key in `tsconfig.json` to the current version of the ECMAScript standard so that type-checking uses the latest and greatest from the JavaScript standard library. The Babel configuration in your app's `config/targets.js` and any included polyfills will determine the final build output.
4. If you make changes to the paths included in or excluded from the build via your `tsconfig.json` (using the `"include"`, `"exclude"`, or `"files"` keys), you will need to restart the server to take the changes into account: ember-cli-typescript does not currently watch the `tsconfig.json` file. For more details, see [the TypeScript reference materials for `tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

## Enabling Sourcemaps

To enable TypeScript sourcemaps, you'll need to add the corresponding configuration for Babel to your `ember-cli-build.js` file:

```typescript
const app = new EmberApp(defaults, {
  babel: {
    sourceMaps: 'inline',
  },
});
```

(Note that this _will_ noticeably slow down your app rebuilds.)

If you are using [Embroider](https://github.com/embroider-build/embroider), you might need to include [devtool](https://webpack.js.org/configuration/devtool/) in your webpack configuration:

```ts
return require('@embroider/compat').compatBuild(app, Webpack, {
  packagerOptions: {
    webpackConfig: { 
      devtool: 'source-map'
    }
  }
}
```

If you're updating from an older version of the addon, you may also need to update your `tsconfig.json`. (Current versions generate the correct config at installation.) Either run `ember generate ember-cli-typescript` or verify you have the same sourcemap settings in your `tscsonfig.json` that appear in [the blueprint](https://github.com/typed-ember/ember-cli-typescript/blob/master/blueprint-files/ember-cli-typescript/files/tsconfig.json).
