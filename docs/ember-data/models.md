# Models

Ember Data models are normal TypeScript classes, but with properties decorated to define how the model represents an API resource and relationships to other resources. The decorators the library supplies "just work" with TypeScript at runtime, but require type annotations to be useful with TypeScript.

For details about decorator usage, see [our overview of how Ember's decorators work with TypeScript](../ts/decorators.md).

## `@attr`

The type returned by the `@attr` decorator is whatever [Transform](https://api.emberjs.com/ember-data/release/classes/Transform) is applied via the invocation.

* If you supply no argument to `@attr`, the value is passed through without transformation.
* If you supply one of the built-in transforms, you will get back a corresponding type:
  * `@attr('string')` → `string`
  * `@attr(number)` → `number`, 
  * `@attr('boolean')` → `boolean`
  * `@attr'date')` → `Date`
* If you supply a custom transform, you will get back the type returned by your transform.

So, for example, you might write a class like this:

```typescript
import Model, { attr } from '@ember-data/model';
import CustomType from '../transforms/custom-transform';

export default class User extends Model {
  @attr()
  name?:  string;

  @attr('number')
  declare age: number;

  @attr('boolean')
  declare isAdmin: boolean;

  @attr('custom-transform')
  declare myCustomThing: CustomType;
}
```

**Very important:** Even more than with decorators in general, you should be careful when deciding whether to mark a property as optional `?` or definitely present \(no annotation\): Ember Data will default to leaving a property empty if it is not supplied by the API or by a developer when creating it. That is: the _default_ for Ember corresponds to an optional field on the model.

The _safest_ type you can write for an Ember Data model, therefore, leaves every property optional: this is how models _actually_ behave. If you choose to mark properties as definitely present by leaving off the `?`, you should take care to guarantee that this is a guarantee your API upholds, and that ever time you create a record from within the app, _you_ uphold those guarantees.

One way to make this safer is to supply a default value using the `defaultValue` on the options hash for the attribute:

```typescript
import Model, { attr } from '@ember-data/model';

export default class User extends Model {
  @attr()
  declare name?:  string;

  @attr('number', { defaultValue: 13 })
  declare age: number;

  @attr('boolean', { defaultValue: false })
  declare isAdmin: boolean;
}
```

## `@belongsTo`

The type returned by the `@hasMany` decorator depends on whether the relationship is `{ async: true }` \(which it is by default\).

* If the value is `true`, the type you should use is `DS.PromiseObject<Model>`, where `Model` is the type of the model you are creating a relationship to.
* If the value is `false`, the type is `Model`, where `Model` is the type of the model you are creating a relationship to.

So, for example, you might define a class like this:

```typescript
import Model, { belongsTo } from '@ember-data/model';
import DS from 'ember-data'; // NOTE: this is a workaround, see discussion below!
import User from './user';
import Site from './site';

export default class Post extends Model {
  @belongsTo('user')
  declare user: DS.PromiseObject<User>;

  @belongsTo('site', { async: false })
  declare site: Site;
}
```

These are _type_-safe to define as always present, that is to leave off the `?` optional marker:

* accessing an async relationship will always return a `PromiseObject`, which itself may or may not ultimately resolve to a value—depending on the API response—but will always be present itself.
* accessing a non-async relationship which is known to be associated but has not been loaded will trigger an error, so all access to the property will be safe _if_ it resolves at all.

Note, however, that this type-safety is not a guarantee of there being no runtime error: you still need to uphold the contract for non-async relationships \(that is: loading the data first, or side-loading it with the request\) to avoid throwing an error!

## `@hasMany`

The type returned by the `@hasMany` decorator depends on whether the relationship is `{ async: true }` \(which it is by default\).

* If the value is `true`, the type you should use is `DS.PromiseManyArray<Model>`, where `Model` is the type of the model you are creating a relationship to.
* If the value is `false`, the type is `EmberArray<Model>`, where `Model` is the type of the model you are creating a relationship to.

So, for example, you might define a class like this:

```typescript
import Model, { hasMany } from '@ember-data/model';
import EmberArray from '@ember/array';
import DS from 'ember-data'; // NOTE: this is a workaround, see discussion below!
import Comment from './comment';
import User from './user';

export default class Thread extends Model {
  @hasMany('comment')
  declare comment: DS.PromiseManyArray<Comment>;

  @hasMany('user', { async: false })
  declare participants: EmberArray<User>;
}
```

The same basic rules about the safety of these lookups as with `@belongsTo` apply to these types. The difference is just that in `@hasMany` the resulting types are _arrays_ rather than single objects.

## Importing `PromiseObject` and `PromiseManyArray`

There is no public import path in the [Ember Data Packages](https://emberjs.github.io/rfcs/0395-ember-data-packages.html) API for the `PromiseObject` and `PromiseManyArray` types. These types are slowly being disentangled from Ember Data and will eventually be removed. However, until they are, we need a way to refer to them. For _now_, the best option is to refer to them via the legacy `DS` import.

In the future, they will become unnecesary, as the types will simply be `Promise<Model>` and `Promise<Array<Model>>`.

