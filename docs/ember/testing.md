# Testing

Testing with TypeScript mostly works just the same as you'd expect in a non-TypeScript Ember application—so if you're just starting out with Ember, we recommend you read the official Ember [Testing Guides](https://guides.emberjs.com/release/testing/) first. The rest of this guide assumes you're already comfortable with testing in Ember!

When working with TypeScript in Ember tests, there are a few differences in your experience, and there are also differences in how you should handle testing app code vs. addon code.

## App tests

One major difference when working with TypeScript in _app_ code is that once your app is fully converted, there are a bunch of kinds of tests you just don't need to write any more: things like testing bad inputs to functions. We'll use an admittedly silly and contrived example here, an `add` function to add two numbers together, so that we can focus on the differences between JavaScript and TypeScript, rather than getting hung up on the details of this particular function.

First, the function we're testing might look like this.

{% hint style="info" %}
Here we’re using the `assert` from `@ember/debug`. If you’re not familiar with it, you might want to take a look at its [API docs](https://api.emberjs.com/ember/3.14/functions/@ember%2Fdebug/assert)! It’s a development-and-test-only helper that gets stripped from production builds, and is very helpful for this kind of thing!
{% endhint %}

```javascript
// app/utils/math.js

export function add(a, b) {
  assert(
    'arguments must be numbers',
    typeof a === number && typeof b === number
  );

  return a + b;
}
```

Then the test for it might look something like this:

```javascript
// tests/unit/utils/math-test.js

import { module, test } from 'qunit';
import { add } from 'app/utils/math';

module('the `add` function', function(hooks) {
  test('adds numbers correctly', function(assert) {
    assert.equal('2 + 2 is 4', add(2, 2), 4);
    assert.notEqual('2 + 2 is a number', add(2, 2), NaN);
    assert.notEqual('2 + 2 is not infinity', add(2, 2), Infinity);
  });

  test('throws an error with strings', function(assert) {
    assert.throws(
      'when the first is a string and the second is a number',
      () => add('hello', 1)
    );
    assert.throws(
      'when the first is a number and the second is a string',
      () => add(0, 'hello')
    );
    assert.throws(
      'when both are strings',
      () => add('hello', 'goodbye')
    );
  })
});
```

In TypeScript, that wouldn't make any sense at all, because we'd simply add the types to the function declaration:

```typescript
// app/utils/math.ts

export function add(a: number, b: number): number {
  assert(
    'arguments must be numbers',
    typeof a === number && typeof b === number
  );

  return a + b;
}
```

We might still write tests to make sure what we actually got back was what we expected—

```typescript
// tests/unit/utils/math-test.ts

import { module, test } from 'qunit';
import { add } from 'app/utils/math';

module('the `add` function', function(hooks) {
  test('adds numbers correctly', function(assert) {
    assert.equal('2 + 2 is 4', add(2, 2), 4);
    assert.notEqual('2 + 2 is a number', add(2, 2), NaN);
    assert.notEqual('2 + 2 is not infinity', add(2, 2), Infinity);
  });
});
```

—but there are a bunch of things we _don't_ need to test. All of those special bits of handling for the case where we pass in a `string` or `undefined` or whatever else? We can drop that. Notice, too, that we can drop the assertion from our function definition, because the _compiler_ will check this for us:

```typescript
// app/utils/math.ts

export function add(a: number, b: number): number {
 return a + b;
}
```

## Addon tests

Note, however, that this _only_ applies to _app code_. If you're writing an Ember addon \(or any other library\), you cannot assume that everyone consuming your code is using TypeScript. You still need to account for these kinds of cases. This will require you to do something that probably feels a bit gross: casting a bunch of values `as any` for your tests, so that you can test what happens when people feed bad data to your addon!

Let's return to our silly example with an `add` function. Our setup will look a lot like it did in the JavaScript-only example—but with some extra type coercions along the way so that we can invoke it the way JavaScript-only users might.

First, notice that in this case we’ve added back in our `assert` in the body of the function. The inputs to our function here will get checked for us by any TypeScript users, but this way we are still doing the work of helping out our JavaScript users.

```typescript
function add(a: number, b: number): number {
  assert(
    'arguments must be numbers',
    typeof a === number && typeof b === number
  );

  return a + b;
}
```

Now, back in our test file, we’re similarly back to testing all those extra scenarios, but here TypeScript would actually stop us from even having these tests work _at all_ if we didn’t use the `as` operator to throw away what TypeScript knows about our code!

```javascript
// tests/unit/utils/math-test.js

import { module, test } from 'qunit';
import { add } from 'app/utils/math';

module('the `add` function', function(hooks) {
  test('adds numbers correctly', function(assert) {
    assert.equal('2 + 2 is 4', add(2, 2), 4);
    assert.notEqual('2 + 2 is a number', add(2, 2), NaN);
    assert.notEqual('2 + 2 is not infinity', add(2, 2), Infinity);
  });

  test('throws an error with strings', function(assert) {
    assert.throws(
      'when the first is a string and the second is a number',
      () => add('hello' as any, 1)
    );
    assert.throws(
      'when the first is a number and the second is a string',
      () => add(0, 'hello' as any)
    );
    assert.throws(
      'when both are strings',
      () => add('hello' as any, 'goodbye' as any)
    );
  })
});
```

## Gotchas

### The `TestContext`

A common scenario in Ember tests, especially integration tests, is setting some value on the `this` context of the tests, so that it can be used in the context of the test. For example, we might need to set up a `User` type to pass into a `Profile` component.

We’re going to start by defining a basic `User` and `Profile` so that we have a good idea of what we’re testing.

The `User` type is very simple, just an `interface`:

```typescript
// app/types/user.ts

export default interface User {
  displayName: string;
  avatarUrl?: string;
}
```

Then our component might be defined like this:

```text
{{! app/components/profile.hbs }}

<div class='user-profile' ...attributes>
  <img
    src={{this.avatar}}
    alt={{this.description}}
    class='avatar'
    data-test-avatar
  />
  <span class='name' data-test-name>{{@displayName}}</span>
</div>
```

```typescript
import Component from '@glimmer/component';
import User from 'app/types/user';
import { randomAvatarURL  } from 'app/utils/avatar';

export default class Profile extends Component<User> {
  get avatar() {
    return this.args.avatar ?? randomAvatarURL();
  }

  get description() {
    return this.args.avatar
      ? `${this.args.displayName}'s custom profile picture`
      : 'a randomly generated placeholder avatar';
  }
}
```

{% hint style="info" %}
Not familiar with how we define a Glimmer `Component` and its arguments? Check out [our guide](https://github.com/typed-ember/ember-cli-typescript/tree/3a434def8b8c8214853cea0762940ccedb2256e8/docs/ember/components/README.md)!
{% endhint %}

Now, with that setup out of the way, let’s get back to talking about the text context! We need to set up a `User` to pass into the test. With TypeScript on our side, we can even make sure that it actually matches up to the type we want to use!

```typescript
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import User from 'app/types/user';

module('Integration | Component | Profile', function(hooks) {
  setupRenderingTest(hooks);

  test('given a user with an avatar', async function(assert) {
    this.user: User = {
      displayName: 'Rey',
      avatar: 'https://example.com/star-wars/rey',
    };

    await render(hbs`<Profile @user={{this.user}}`);

    assert.dom('[data-test-name]').hasText(this.user.displayName);

    assert.dom('[data-test-avatar]')
      .hasAttribute('src', this.user.avatar);
    assert.dom('[data-test-avatar]')
      .hasAttribute('alt', `${this.user.displayName}'s custom profile picture`);
  });

  test('given a user without an avatar', async function(assert) {
    this.user: User = {
      displayName: 'Rey',
    };

    await render(hbs`<Profile @user={{this.user}}`);

    assert.dom('[data-test-name]').hasText(this.user.displayName);

    assert.dom('[data-test-avatar]')
      .hasAttribute('src', /rando-avatars-yo/);
    assert.dom('[data-test-avatar]')
      .hasAttribute('alt', 'a randomly generated placeholder avatar');
  });
});
```

This is a decent test, and TypeScript actually makes the experience of writing certain parts of it pretty nice. Unfortunately, though, it won’t type-check. TypeScript reports that the `user` field doesn't exist on the `TestContext`. Now, TypeScript _does_ know that QUnit sets up that helpfully-named `TestContext`—so a lot of the things we can do in tests work out of the box—but we haven’t told TypeScript that `this` now has a `user` property on it.

To inform TypeScript about this, we need to tell it that the type of `this` in each test assertion includes the `user` property, of type `User`. We’ll start by importing the `TestContext` defined by Ember’s test helpers, and extending it:

```typescript
import { TestContext } from 'ember-test-helpers';

import User from 'app/types/user';

interface Context extends TestContext {
  user: User;
}
```

Then, in every `test` callback, we need to [specify the `this` type](https://www.typescriptlang.org/docs/handbook/functions.html#this):

```typescript
test('...', function(this: Context, assert) {

});
```

Putting it all together, this is what our updated test definition would look like:

```typescript
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext } from 'ember-test-helpers';

import User from 'app/types/user';

interface Context extends TestContext {
  user: User;
}

module('Integration | Component | Profile', function(hooks) {
  setupRenderingTest(hooks);

  test('given a user with an avatar', async function(this: Context, assert) {
    this.user: User = {
      displayName: 'Rey',
      avatar: 'https://example.com/star-wars/rey',
    };

    await render(hbs`<Profile @user={{this.user}}`);

    assert.dom('[data-test-name]').hasText(this.user.displayName);

    assert.dom('[data-test-avatar]')
      .hasAttribute('src', this.user.avatar);
    assert.dom('[data-test-avatar]')
      .hasAttribute('alt', `${this.user.displayName}'s custom profile picture`);
  });

  test('given a user without an avatar', async function(this: Context, assert) {
    this.user: User = {
      displayName: 'Rey',
    };

    await render(hbs`<Profile @user={{this.user}}`);

    assert.dom('[data-test-name]').hasText(this.user.displayName);

    assert.dom('[data-test-avatar]')
      .hasAttribute('src', /rando-avatars-yo/);
    assert.dom('[data-test-avatar]')
      .hasAttribute('alt', 'a randomly generated placeholder avatar');
  });
});
```

Now everything type-checks again, and we get the nice auto-completion we’re used to when dealing with `this.user` in the test body.

{% hint style="info" %}
If you’ve been around TypeScript a little, and you look up the type of the `TestContext` and realize its an interface, you might be tempted to reach for declaration merging here. Don’t! If you do that, _every single test in your entire application_ will now have a `user: User` property on it!
{% endhint %}

There are still a couple things to be careful about here, however. First, we didn’t specify that the `this.user` property was _optional_. That means that TypeScript won’t complain if you do `this.user` _before_ assigning to it. Second, every test in our module gets the same `Context`. Depending on what you’re doing, that may be fine, but you may end up needing to define multiple distinct test context extensions. If you _do_ end up needing to define a bunch of different test context extension, that may be a sign that this particular set of tests is doing too much. That in turn is probably a sign that this particular _component_ is doing too much!

