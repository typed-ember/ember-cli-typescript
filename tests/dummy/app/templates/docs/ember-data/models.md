# Models

## Decorators

When working with Ember Data, you'll very commonly be using one of the decorators the library supplies to define the shape of the relationships between your resources. These "just work" with TypeScript at runtime, but require type annotations to be useful with TypeScript.

For an overview of using Ember's decorators with TypeScript, see <LinkTo @route='docs.ts.decorators'>our overview</LinkTo>.

### `@attr`

The type returned by the `@attr` decorator is whatever [Transform](https://api.emberjs.com/ember-data/release/classes/Transform) is applied via the invocation.

- If you supply no argument to `@attr`, the value is passed through without transformation.

- If you supply one of the built-in transforms, you will get back a corresponding type:
    - `@attr('string')` → `string`
    - `@attr(number)` → `number`, 
    - `@attr('boolean')` → `boolean`
    - `@attr'date')` → `Date`

- If you supply a custom transform, you will get back the type returned by your transform.

So, for example, you might write a class like this:

```ts
import Model, { attr } from '@ember-data/object';
import CustomType from '../transforms/custom-transform';

export default class User extends Model {
  @attr()
  name?:  string;

  @attr('number')
  age!: number;

  @attr('boolean')
  isAdmin!: boolean;

  @attr('custom-transform')
  myCustomThing!: CustomType;
}
```

**Very important:** Even more than with decorators in general, you should be careful when deciding whether to mark a property as optional `?` or definitely present `!`: Ember Data will default to leaving a property empty if it is not supplied by the API or by a developer when creating it.

The *safest* type you can write for an Ember Data model, therefore, leaves every property optional: this is how models *actually* behave. If you choose to mark properties as definitely present, you should take care to guarantee that this is a guarantee your API upholds, and that ever time you create a record from within the app, *you* uphold those guarantees.

One way to make this safer is to supply a default value using the `defaultValue` on the options hash for the attribute:

```ts
import Model, { attr } from '@ember-data/object';

export default class User extends Model {
  @attr()
  name?:  string;

  @attr('number', { defaultValue: 13 })
  age!: number;

  @attr('boolean', { defaultValue: false })
  isAdmin!: boolean;
}
```

### `@belongsTo`


The type returned by the `@hasMany` decorator depends on whether the relationship is `{ async: true }` (which it is by default).

- If the value is `true`, the type you should use is `DS.PromiseObject<Model>`, where `Model` is the type of the model you are creating a relationship to.

- If the value is `false`, the type is `Model`, where `Model` is the type of the model you are creating a relationship to.

So, for example, you might define a class like this:

```ts

```

### `@hasMany`

The type returned by the `@hasMany` decorator depends on whether the relationship is `{ async: true }` (which it is by default).

- If the value is `true`, the type you should use is `DS.PromiseManyArray<Model>`, where `Model` is the type of the model you are creating a relationship to.

- If the value is `false`, the type is `EmberArray<Model>`, where `Model` is the type of the model you are creating a relationship to.

So, for example, you might define a class like this:

```ts

```
