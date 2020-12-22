# Installation

You can simply `ember install` the dependency like normal:

```bash
ember install ember-cli-typescript@latest
```

All dependencies will be added to your `package.json`, and you're ready to roll!

**If you're upgrading from a previous release, see (./upgrade-notes.md).**

Installing ember-cli-typescript modifies your project in two ways:

* installing a number of other packages to make TypeScript work in your app or addon
* generating a number of files in your project

## Other packages this addon installs

We install all of the following packages at their current "latest" value, :

* `typescript`
* `ember-cli-typescript-blueprints`
* `@types/ember`
* `@types/ember-data`
* `@types/ember__*` – `@types/ember__object` for `@ember/object` etc.
* `@types/ember-data__*` – `@types/ember-data__model` for `@ember-data/model` etc.
* `@types/rsvp`
* `@types/ember__test-helpers`

## Files this addon generates

We also add the following files to your project:

* [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
* `types/<app name>/index.d.ts` – the location for any global type declarations you need to write for you own application; see [**Using TS Effectively: Global types for your package**](https://github.com/typed-ember/ember-cli-typescript/tree/3a434def8b8c8214853cea0762940ccedb2256e8/docs/getting-started/docs/ts/using-ts-effectively/README.md#global-types-for-your-package) for information on its default contents and how to use it effectively
* `app/config/environment.d.ts` – a basic set of types defined for the contents of the `config/environment.js` file in your app; see [Environment and configuration typings](installation.md#environment-and-configuration-typings) for details

