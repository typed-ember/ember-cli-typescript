# Computed Properties

There are two variants of Ember’s computed properties you may encounter:

- the decorator form used with native (ES6) classes
- the callback form used with classic classes (based on <LinkTo @route='docs.legacy.ember-object'>EmberObject</LinkTo>)

## Decorator form

<!-- TODO: write this -->

## Callback form

<!-- TODO: write this -->

### `this` type workaround

One important note for using `class` types effectively with today's Ember typings: you will need to explicitly write out a `this` type for computed property callbacks for `get` and `set` to type-check correctly:

```ts
import Component from '@ember/component';
import { computed } from '@ember/object/computed';

const UserProfile = Component.extend({
  name: 'Chris',
  age: 32,

  bio: computed('name', 'age', function(this: UserProfile) {
    //                                  ^---------------^
    // `this` tells TS to use `UserProfile` for `get` and `set` lookups;
    // otherwise `this.get` below would not know the types of `'name'` or
    // `'age'` or even be able to suggest them for autocompletion.
    return `${this.get('name')} is `${this.get('age')}` years old!`;
  }),
})

export default UserProfile;
```

Note that this *does not always work*: you may get warnings from TypeScript about the item being defined in terms of itself.
