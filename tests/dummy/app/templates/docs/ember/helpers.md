# Helpers

Helpers in Ember are just functions or classes with a well-defined interface, which means they largely Just Work™ with TypeScript. However, there are a couple things you’ll want to watch out for.

<aside>

As always, you should start by reading and understanding the [Ember Guide on Helpers][guide]!

</aside>

[guide]: https://guides.emberjs.com/release/templates/writing-helpers/

## Function-based helpers

The basic type of a helper function in Ember is:

```ts
type FunctionBasedHelper =
  (positional: unknown[], named: Record<string, unknown>) => string | void;
```

This represents a function which *may* have an arbitrarily-long list of positional arguments, which *may* be followed by a single dictionary-style object containing any named arguments.

There are three important points about this definition:

1. `positional` is an array of `unknown`, of unspecified length.
2. `named` is a `Record`.
3. Both arguments are always set, but may be empty.

Let’s walk through each of these.

### Handling `positional` arguments

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

### Handling `named` arguments

We specified the type of `named` as a `Record<string, unknown>`. `Record` is a built-in TypeScript type representing a fairly standard type in JavaScript: an object being used as a simple map of keys to values. Here we set the values to `unknown` and the keys to `string`, since that accurately represents what callers may actually pass to a helper.

(As with `positional`, we specify the type here as `unknown` to account for the fact that the template layer isn’t aware of types yet.)

### `positional` and `named` presence

Note that even if the user passes *no* arguments, both `positional` and `named` are always present. They will just be *empty* in that case. For example:

<DocsDemo as |demo|>
  <demo.example @name='show-all.hbs' @label='usage.hbs' language='hbs'>
    {{show-all 'hello' 12 (hash neat=true) cool='beans' answer=42}}
  </demo.example>

  <demo.snippet @name='show-all.ts' @label='app/helpers/show-all.ts' />
</DocsDemo>

### Putting it all together

Given those constraints, let’s see what a (very contrived) actual helper might look like in practice.  Let’s imagine we want to take a pair of strings and join them with a required separator and optional prefix and postfixes:

<DocsSnippet @name='function-based-helper.ts' @title='my-app/helpers/join.ts' @showCopy={{true}} />

## Class-based helpers

The basic type of a class-based helper function in Ember is:

```ts
interface ClassBasedHelper {
  compute(positional?: unknown[], named?: Record<string, unknown>): string | void;
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

For more details on using decorators, see our [guide to using decorators][decorators]. For details on using services, see our [guide to services][services].

[decorators]: (../ts/decorators/)
[services]: (./services/)
