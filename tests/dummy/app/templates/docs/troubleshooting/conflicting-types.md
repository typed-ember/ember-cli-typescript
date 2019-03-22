# Conflicting Type Dependencies

You will sometimes see <b>Duplicate identifier</b> errors when type-checking your application.

<details><summary><i>An example duplicate identifier error</i></summary>

```sh
yarn tsc --noEmit
yarn run v1.15.2
$ /Users/chris/dev/teaching/emberconf-2019/node_modules/.bin/tsc --noEmit
node_modules/@types/ember__object/index.d.ts:23:22 - error TS2300: Duplicate identifier 'EmberObject'.

23 export default class EmberObject extends CoreObject.extend(Observable) {}
                        ~~~~~~~~~~~

  node_modules/@types/ember__component/node_modules/@types/ember__object/index.d.ts:23:22
    23   export default class EmberObject extends CoreObject.extend(Observable) {}
                             ~~~~~~~~~~~
    'EmberObject' was also declared here.

node_modules/@types/ember__component/node_modules/@types/ember__object/index.d.ts:23:22 - error TS2300: Duplicate identifier 'EmberObject'.

8   export default class EmberObject extends CoreObject.extend(Observable) {}
                         ~~~~~~~~~~~

  node_modules/@types/ember__object/index.d.ts:23:22
    23 export default class EmberObject extends CoreObject.extend(Observable) {}
                            ~~~~~~~~~~~
    'EmberObject' was also declared here.


Found 2 errors.

error Command failed with exit code 1.
```

</details>

This occurs whenever your `yarn.lock` or `package-lock.json` files include more than a single copy of a given set of type definitions—here, types for `@ember/object`, named `@types/ember__object`. See below for details on the yarn behavior, and TODO for details on the package names.

## Workarounds

There are currently two recommended workarounds for this:

- You can specify a specific version of the package to use in the `"resolutions"` key in `package.json`. For example, if you saw that you had `@types/ember__object@3.0.8` from the default package installs but `@types/ember__object@3.0.5` from `some-cool-ts-addon`, you could force yarn to use `3.0.8` like so:

    ```json
    {
      "resolutions": {
        "@types/ember__object": "3.0.8"
      }
    }
    ```

- You can identify the dependencies which installed the type dependencies transitively, and uninstall and reinstall them. For example, if running `yarn why` reported you had one version of `@types/ember__object` from the normally-installed set of packages (TODO: LINK TO THEM), and one from `some-cool-ts-addon`, you could run this:

    ```sh
    yarn remove @types/ember some-cool-ts-addon
    yarn add -D @types/ember some-cool-ts-addon
    ```

## Understanding the Problem

When you are using TypeScript in your Ember application, you consume Ember's types through [DefinitelyTyped], the tool the TypeScript team built to power the `@types/*` definitions. That tooling examines the dependencies implied by the package imports and generates a `package.json` with those types specified with a `*` dependency version. On initial installation of your dependencies, yarn installs the highest version of the package available, and correctly deduplicates that across both your own package and all the `@types` packages which reference each other.

[DefinitelyTyped]: https://github.com/DefinitelyTyped/DefinitelyTyped

However, later installs may introduce conflicting versions of the types, simply by way of yarn's normal update rules. TypeScript requires that there be one and only one type definition a given item can resolve to. Yarn actively avoids changing a previously-installed version of a transitive dependency when a newly installed package depends on the same dependency transitively. Thus, if one of your dependencies *also* depends on the same package from `@types/*` that you do, and you upgrade your dependence on that type by editing your `package.json` file and running `yarn` again, TypeScript will suddenly start offering the error described in detail above:

> Duplicate identifier 'EmberObject'.ts(2300)

Normally, running `yarn upgrade @types/ember__object` instead of updating your `package.json` file will resolve this for you, because yarn will deduplicate the packages once again. ::TODO: confirm this is accurate!::

Let's imagine three packages, `A`, `B`, and `C`, where `A` is *your* app or library, and `B` and `C` have the following versions and dependencies:

- `C` is currently at version `1.2.3`.
- `B` is at version `4.5.6`. It depends on `C` with a `*` dependency. So the `dependencies` key in its `package.json` looks like this:

    ```json
    {
      "dependencies": {
        "C": "*"
      }
    }
    ```

Now, you install *only* `B` (this is the equivalent of installing just the basic type definitions in your package):

```json
{
  "dependencies": {
    "B": "~4.5.6"
  }
}
```

The first time you install these, you will get a *single* version of `C` – `1.2.3`.

Now, let's say that `C` publishes a new version, `1.2.4`, and `A` (your app or library) adds a dependency on both `C` like so:

```json
{
  "dependencies": {
    "B": "~4.5.6",
    "C": "~1.2.0"
  }
}
```

When yarn runs, it goes out of its way to leave the *existing* installation of `C` in place, while adding a *new* version for you as a top-level consumer. So now you have two versions of `C` installed in your `node_modules` directory: `1.2.3` (for `B`) and `1.2.4` (for `A`, your app or library).

What's important to understand here is that this is *exactly* the behavior you want as the default in the Node ecosystem. Automatically updating a transitive dependency—even when the change is simply a bug fix release—*can* cause your entire app or library to stop working. If one of your dependencies accidentally depended on that buggy behavior, and adding a direct dependency on the fixed version caused the buggy version to be upgraded, you're just out of luck. Yarn accounts for this by resolving packages to the same version during initial installation, but leaving existing package resolutions as they are when adding new dependencies later.

Unfortunately, this is also the *opposite* of what you want for TypeScript, which needs a single source of truth for the types in your app or library. When you install the type definitions, and then *later* install a package which transitively depends on those type definitions

## Understanding the Workarounds

The two solutions listed above both make sure Yarn only installs a single version of the package.

- Specifying a version in the `"resolutions"` field in your `package.json` simply forces Yarn to resolve *every* reference to that package to a single version. This actually works extremely well for types, but it means that every time you either update the types package(s) yourself *or* update a package which transitively depends on them, you have to edit this value manually as well.

- Uninstalling and reinstalling both the impacted packages and *all* the packages which transitively depend on them gives you the same behavior as an initial install… because that's exactly what you're doing. The downside, of course, is that you have to identify and uninstall and reinstall all top-level packages which transitively depend on the files, and this introduces risk by way of *other* transitive dependencies being updated.
