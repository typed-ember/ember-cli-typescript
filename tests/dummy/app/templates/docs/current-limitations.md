## Current limitations

While TS already works nicely for many things in Ember, there are a number of corners where it _won't_ help you out. Some of them are just a matter of further work on updating the [existing typings]; others are a matter of further support landing in TypeScript itself, or changes to Ember's object model.

[existing typings]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember

We are hard at work (and would welcome your help!) [writing new typings][ember-typings] for Ember and the surrounding ecosystem. If you'd like to try those out, please see instructions in [that repo][ember-typings]!

[ember-typings]: https://github.com/typed-ember/ember-typings

Here is the short list of things which do _not_ work yet in the version of the typings published on DefinitelyTyped.

### Some `import`s don't resolve

You'll frequently see errors for imports which TypeScript doesn't know how to resolve. For example, if you use Ember Concurrency today and try to import its `task` helper:

```typescript
import { task } from 'ember-concurrency';
```

You'll see an error, because there aren't yet type definitions for it. You may see the same with some addons as well. **These won't stop the build from working;** they just mean TypeScript doesn't know where to find those.

Writing these missing type definitions is a great way to pitch in! Jump in `#e-typescript` on the [Ember Community Discord server](https://discord.gg/zT3asNS) and we'll be happy to help you.

### Type safety when invoking actions

TypeScript won't detect a mismatch between this action and the corresponding call in the template:

```typescript
Ember.Component.extend({
  actions: {
    turnWheel(degrees: number) {
      // ...
    },
  },
});
```

```hbs
<button onclick={{action 'turnWheel' 'NOT-A-NUMBER'}}> Click Me </button>
```

Likewise, it won't notice a problem when you use the `send` method:

```typescript
// TypeScript compiler won't detect this type mismatch
this.send('turnWheel', 'ALSO-NOT-A-NUMBER');
```
