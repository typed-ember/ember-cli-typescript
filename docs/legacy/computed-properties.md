# Computed Properties

There are two variants of Ember’s computed properties you may encounter:

* the decorator form used with native \(ES6\) classes
* the callback form used with classic classes \(based on EmberObject\)

## Decorator form

```typescript
import Component from '@ember/component';
import { computed } from '@ember/object/computed';

export default class UserProfile extends Compoennt {
  name = 'Chris';
  age = 33;

  @computed('name', 'age')
  get bio() {
    return `${this.name} is `${this.age}` years old!`;
  }
}
```

Note that it is impossible for `@computed` to know whether the keys you pass to it are allowed or not. Migrating to Octane eliminates this issue, since you mark reactive root state with `@tracked` and leave getters undecorated, rather than vice versa.

## Callback form

Computed properties in the classic object model take a callback instead:

```typescript
import Component from '@ember/component';
import { computed } from '@ember/object/computed';

const UserProfile = Component.extend({
  name: 'Chris',
  age: 32,

  bio: computed('name', 'age', function() {
    return `${this.get('name')} is `${this.get('age')}` years old!`;
  }),
})

export default UserProfile;
```

This definition will not type-check, however. You will need to explicitly write out a `this` type for computed property callbacks for `get` and `set` to type-check correctly:

```typescript
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

Note that this _does not always work_: you may get warnings from TypeScript about the item being defined in terms of itself.

**Accordingly, we strongly recommend migrating classic classes to ES native classes** _**before**_ **adding TypeScript!**

