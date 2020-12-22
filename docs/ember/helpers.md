# Helpers

Helpers in Ember are just functions or classes with a well-defined interface, which means they largely Just Work™ with TypeScript. However, there are a couple things you’ll want to watch out for.

{% hint style="info" %}
As always, you should start by reading and understanding the [Ember Guide on Helpers](https://guides.emberjs.com/release/templates/writing-helpers/)!
{% endhint %}

## Function-based helpers

The basic type of a helper function in Ember is:

```typescript
type FunctionBasedHelper =
  (positional: unknown[], named: Record<string, unknown>) => string | void;
```

This represents a function which _may_ have an arbitrarily-long list of positional arguments, which _may_ be followed by a single dictionary-style object containing any named arguments.

There are three important points about this definition:

1. `positional` is an array of `unknown`, of unspecified length.
2. `named` is a `Record`.
3. Both arguments are always set, but may be empty.

Let’s walk through each of these.

### Handling `positional` arguments

The type is an array of `unknown` because we don’t \(yet!\) have any way to make templates aware of the information in this definition—so users could pass in _anything_. We can work around this using [type narrowing](https://microsoft.github.io/TypeScript-New-Handbook/chapters/narrowing/)—TypeScript’s way of using runtime checks to inform the types at runtime.

```typescript
function totalLength(positional: unknown[]) {
  // Account for case where user passes no arguments
  assert(
    'all positional args to `total-length` must be strings',
    positional.every(arg => typeof arg === 'string')
  );

  // safety: we can cast `positional as string[]` because we asserted above
  return (positional as string[]).reduce((sum, s) => sum + s.length, 0);
}
```

### Handling `named` arguments

We specified the type of `named` as a `Record<string, unknown>`. `Record` is a built-in TypeScript type representing a fairly standard type in JavaScript: an object being used as a simple map of keys to values. Here we set the values to `unknown` and the keys to `string`, since that accurately represents what callers may actually pass to a helper.

\(As with `positional`, we specify the type here as `unknown` to account for the fact that the template layer isn’t aware of types yet.\)

### `positional` and `named` presence

Note that even if the user passes _no_ arguments, both `positional` and `named` are always present. They will just be _empty_ in that case. For example:

```typescript
import { helper } from '@ember/component/helper';

const describe = (entries: string): string => (entries.length > 0 ? entries : '(none)');

export function showAll(positional: unknown[], named: Record<string, unknown>) {
  // pretty print each item with its index, like `0: { neat: true }` or
  // `1: undefined`.
  const positionalEntries = positional
    .reduce<string[]>((items, arg, index) => items.concat(`${index}: ${JSON.stringify(arg)}`), [])
    .join(', ');

  // pretty print each item with its name, like `cool: beans` or
  // `answer: 42`.
  const namedEntries = Object.keys(named)
    .reduce<string[]>(
      (items, key) => items.concat(`${key}: ${JSON.stringify(named[key], undefined, 2)}`),
      []
    )
    .join(', ');

  return `positional: ${describe(positionalEntries)}\nnamed: ${describe(namedEntries)}`;
}

export default helper(showAll);
```

### Putting it all together

Given those constraints, let’s see what a \(very contrived\) actual helper might look like in practice. Let’s imagine we want to take a pair of strings and join them with a required separator and optional prefix and postfixes:

```typescript
import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import { is } from '../../type-utils'

export function join(positional: [unknown, unknown], named: Dict<unknown>) {
  assert(
    `'join' requires two 'string' positional parameters`,
    is<[string, string]>(
      positional,
      positional.length === 2 &&
      positional.every(el => typeof el === 'string')
    )
  );
  assert(`'join' requires argument 'separator'`, typeof named.separator === 'string');

  const joined = positional.join(named.separator);
  const prefix = typeof named.prefix === 'string' ? named.prefix : '';

  return `${prefix}${joined}`;
}

export default helper(join);
```

## Class-based helpers

The basic type of a class-based helper function in Ember is:

```typescript
interface ClassBasedHelper {
  compute(positional?: unknown[], named?: Record<string, unknown>): string | void;
}
```

Notice that the signature of `compute` is the same as the signature for the function-based helper! This means that everything we said above applies in exactly the same way here. The only differences are that we can have local state and, by extending from Ember’s `Helper` class, we can hook into the dependency injection system and use services.

```typescript
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import Authentication from 'my-app/services/authentication';

export default class Greet extends Helper {
  @service authentication: Authentication;

  compute() {
    return this.authentication.isAuthenticated
      ? `Welcome back, ${authentication.userName}!`
      : 'Sign in?';
}
```

For more details on using decorators, see our [guide to using decorators](https://github.com/typed-ember/ember-cli-typescript/tree/3a434def8b8c8214853cea0762940ccedb2256e8/docs/ember/%28../ts/decorators/%29/README.md). For details on using services, see our [guide to services](https://github.com/typed-ember/ember-cli-typescript/tree/3a434def8b8c8214853cea0762940ccedb2256e8/docs/ember/%28./services/%29/README.md).

