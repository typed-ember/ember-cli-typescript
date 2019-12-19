# Helpers

Helpers in Ember are just functions or classes with a well-defined interface, which means they largely Just Work™ with TypeScript. However, there are a couple things you’ll want to watch out for.

<aside>

As always, you should start by reading and understanding the [Ember Guide on Helpers][guide]!

</aside>

[guide]: https://guides.emberjs.com/release/templates/writing-helpers/

## Function-based helpers

The basic type of a helper function in Ember is:

```ts
interface FunctionBasedHelper {
  (positional: unknown[], named: Dict<unknown>): string | void;
}
```

This represents a function which *may* have an arbitrarily-long list of positional arguments, which *may* be followed by a single dictionary-style object containing any named arguments.

<aside>

Not familiar with this syntax for defining the shape of a function as an interface? See TODO.

</aside>

There are three important points about this definition:

1. `positional` is an array of `unknown`, of unspecified length.
2. `named` is a `Dict<unknown>`.
3. Both arguments are always set, but may be empty.

Let’s walk through both of these.

### 1. Handling `positional`

TODO

The type is an array of `unknown` because we don’t (yet!) have any way to make templates aware of the information in this definition—so users could pass in *anything*. We can work around this using [type narrowing]—TypeScript’s way of using runtime checks to inform the types at runtime.

[type narrowing]: https://microsoft.github.io/TypeScript-New-Handbook/chapters/narrowing/

```ts
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

### 2. Handling `named`

We specified the type of `named` as `Dict<unknown>`. Here, `Dict<T>` is this type:

```ts
interface Dict<T> {
  [key: string]: T | undefined;
}
```

This describes a fairly standard type in JavaScript: an object being used as a simple map of string keys to values. The type is `T | undefined` because any given string may or may not have a value associated with it:

```ts
let ages: Dict<number> = {
  chris: 32,
};

let johnAge = ages['john']; // undefined
let chrisAge = ages['chris']; // 32
```

As with `positional`, we specify the type here as `unknown` to account for the fact that the template layer isn’t aware of types yet.

### 3. `positional` and `named` are always present

Note that even if the user passes *no* arguments, both `positional` and `named` are always present. They will just be *empty* in that case. For example:

<DocsDemo as |demo|>
  <demo.example>
    {{log-all 'hello' 12 (hash neat=true) cool='beans' answer=42}}
  </demo.example>

 <demo.snippet @name='log-all.ts' @label='app/helpers/log-all.ts'>
    import { helper } from '@ember/component/helper';

    export function logAll(positional: unknown[], named: Dict<unknown>) {
      // pretty print each item with its index, like `0: { neat: true }` or
      // `1: undefined`.
      const positionalDescription ='positional: ' + positional
        .reduce((items, arg, index) => {
          const description = arg ? arg.toString() : arg;
          return items.concat(`${index}: ${arg}`);
        })
        .join(', ');

      // pretty print each item with its name, like `cool: beans` or
      // `answer: 42`.
      const namedDescription = 'named: '  + Object.keys(named)
        .reduce((items, key) => {
          const description  = named[key] ? named[key].toString() : named[key];
          return items.concat(`${key}: ${description}`);
        })
        .join(', ');

      return `${positionalDescription}\n${namedDescription}`;
   }

    export default helper(logAll);
  </demo.snippet>
    {{log-all 'hello' 12 (hash neat=true) cool='beans' answer=42}}
  <demo.snippet>
  </demo.snippet>
</DocsDemo>

### Putting it all together

Given those constraints, let’s see what a (very contrived) actual helper might look like in practice.  Let’s imagine we want to take a pair of strings and join them with a required separator and optional prefix and postfixes:

<DocsSnippet @name='function-based-helper.ts' @title='my-app/helpers/join.ts' @showCopy={{true}}>
  import { helper } from '@ember/component/helper';
  import { assert } from '@ember/debug';

  export function join(positional: [unknown, unknown], named: Dict<unknown>) {
    assert(
      `'join' requires two positional parameters, but received ${positional.length}`,
      positional.length === 2
    );
    assert(
      `'join' positional parameters must be strings`,
      positional.every(param => typeof param === 'string'
    );
    assert(
      `'join' requires argument 'separator'`,
      typeof named.separator === 'string'
    );

    // safety: `positional as string[]` and `named.separator as string` are safe
    // because we asserted their types above.
    const joined = (positional as string[]).join(named.separator as string);

    const prefix = typeof named.prefix === 'string' ? named.prefix : '';
    const postfix = typeof named.postfix  === 'string' ? named.postfix  : '';

    return `${prefix}${joined}${postfix}`;
  }

  export default helper(join);
</DocsSnippet>

## Class-based helpers

The basic type of a class-based helper function in Ember is:

```ts
interface ClassBasedHelper {
  compute(positional?: unknown[], named?: Dict<unknown>): string | void;
}
```

Notice that the signature of `compute` is the same as the signature for the function-based helper! This means that everything we said above applies in exactly the same way here. The only differences are that we can have local state and, by extending from Ember’s `Helper` class, we can hook into the dependency injection system and use services.

<DocsSnippet @name='class-based-helper.ts' @title='my-app/helpers/greet.ts' @showCopy={{true}}>
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
</DocsSnippet>

For more details on using decorators, see our [guide to using Ember classes in TypeScript][classes]. For details on using services, see our [guide to services][services].

[classes]: TODO
[services]: TODO