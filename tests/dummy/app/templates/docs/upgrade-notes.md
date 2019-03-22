# Upgrading from 1.x

There are a number of important changes between ember-cli-typescript v1 and v2, which mean the upgrade process is *straightforward* but *specific*:

1. Update ember-cli-babel. Fix any problems introduced during the upgrade.
2. Update ember-decorators. Fix any problems introduced during the upgrade.
3. Update ember-cli-typescript. Follow the detailed upgrade guide below to fix discrepancies between Babel and TypeScript's compiled output.

If you deviate from this order, you are likely to have a *much* more difficult time upgrading!

## Update ember-cli-babel

ember-cli-typescript **requires** ember-cli-babel at version 7.1.0 or above, which requires ember-cli 2.13 or above. It also **requires** @babel/core 7.2.0 or higher.

The recommended approach here is to deduplicate existing installations of the dependency, remove and reinstall ember-cli-babel to make sure that all its transitive dependencies are updated to the latest possible, and then to deduplicate *again*.

If using yarn:
    
```
npx yarn-deduplicate
yarn remove ember-cli-babel
yarn add --dev ember-cli-babel
npx yarn-deduplicate
```

If using npm:
      
```
npm dedupe
npm uninstall ember-cli-babel
npm install --save-dev ember-cli-babel
npm dedupe
```

Note: If you are also using ember-decorators—and specifically the babel-transform that gets added with it—you will need update @ember-decorators/babel-transforms as well (anything over 3.1.0 should work):

```
ember install ember-decorators@^3.1.0 @ember-decorators/babel-transforms@^3.1.0
```

## Update ember-decorators

Follow the same process of deduplication, reinstallation, and re-deduplication as described for ember-cli-babel above. This will get you the latest version of ember-decorators and, importantly, its @ember-decorators/babel-transforms dependency.

## Update ember-cli-typescript

***Note:* Because ember-cli-typescript is part of the build pipeline, the process for updating it differs slightly between apps and addons!**

### In apps

In apps, you can simply `ember install` the dependency like normal:

```sh
ember install ember-cli-typescript@latest
```

### In addons

To work properly, Ember addons must declare this library as a `dependency`, not a `devDependency`. **This is a *change* from ember-cli-typescript v1.**

1. Remove ember-cli-typescript from your dependencies.

    With yarn:
    
    ```sh
    yarn remove ember-cli-typescript 
    ```

    With npm:
    
    ```sh
    npm uninstall ember-cli-typescript
    ```

2. Re-install it with `ember install`:

    ```sh
    ember install ember-cli-typescript@latest --save
    ```

### Account for addon build pipeline changes

Since we now integrate in a more traditional way into Ember CLI's build pipeline, there are two changes required for addons using TypeScript.

- Addons can no longer use `.ts` in `app`, because an addon's `app` directory gets merged with and uses the *host's* (i.e. the other addon or app's) preprocessors, and we cannot guarantee the host has TS support. Note that `.ts` will continue to work for in-repo addons because the app build works with the host's (i.e. the app's, not the addon's) preprocessors.

- Similarly, apps must use `.js` to override addon defaults in `app`, since the different file extension means apps no long consistently "win" over addon versions (a limitation of how Babel + app merging interact).

### Account for TS → Babel issues

ember-cli-typescript v2 uses Babel to compile your code, and the TypeScript compiler only to *check* your code. This makes for much faster builds, and eliminates the differences between Babel and TypeScript in the build output that could cause problems in v1. However, because of those differences, you’ll need to make a few changes in the process of upgrading.

Any place where a type annotation overrides a *getter*

- Fields like `element`, `disabled`, etc. as annotated defined on a subclass of `Component` and (correctly) not initialized to anything, e.g.:

    ```ts
    import Component from '@ember/component';

    export default class Person extends Component {
      element!: HTMLImageElement;
    }
    ```

    This breaks because `element` is a getter on `Component`. This declaration then shadows the getter declaration on the base class and stomps it to `undefined` (effectively `Object.defineProperty(this, 'element', void 0)`.

    Two solutions—

    1. Annotate locally (slightly more annoying, but less likely to troll you):

        ```ts
        class Image extends Component {
          useElement() {
            let element = this.element as HTMLImageElement;
            console.log(element.src);
          }
        }
        ```

    2. Use a local getter:

        ```ts
        class Image extends Component {
          // We do this because...
          get _element(): HTMLImageElement {
            return this.element as HTMLImageElement;
          }
          
          useElement() {
            console.log(this._element.src);
          }
        }
        ```


- `const enum` is not supported at all. You will need to replace all uses of `const enum` with simply `enum` or constants.

- Using ES5 getters or settings with `this` type annotations is not supported through at least Babel 7.3. However, they should also be unnecessary with ES6 classes, so you can simply *remove* the `this` type annotation.

- Trailing commas after rest function parameters (`function foo(...bar[],) {}`) are disallowed by the ECMAScript spec, so Babel also disallows them.

- Re-exports of types have to be disambiguated to be *types*, rather than values. Neither of these will work:

  ```ts
  export { FooType } from 'foo';
  ```
  ```ts
  import { FooType } from 'foo';
  export { FooType };
  ```

  In both cases, Babel attempts to emit a *value* export, not just a *type* export, and fails because there is no actual value to emit. You can do this instead as a workaround:

  ```ts
  import * as Foo from 'foo';
  export type FooType = Foo.FooType;
  ```
