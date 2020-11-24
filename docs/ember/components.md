# Components

<aside>

New to Ember or the Octane edition specifically? You may want to read [the Ember Guides’ material on `Component`s](https://guides.emberjs.com/release/components/) first!

</aside>


Glimmer Components are defined in one of three ways: with templates only, with a template and a backing class, or with only a backing class (i.e. a `yield`-only component). When using a backing class, you get a first-class experience using TypeScript! Unfortunately, we don’t yet support type-checking for templates, but we hope to build that out eventually. Don’t let that stop you, though: types in your component classes make for a great experience, so let’s dig in and see how it works in practice.

## A simple component

A *very* simple Glimmer component which lets you change the count of a value might look like this:

<DocsSnippet @name='up-and-down.hbs' @title='my-app/components/up-and-down.hbs' @showCopy={{true}} />

<DocsSnippet @name='up-and-down.ts' @title='my-app/components/up-and-down.ts' @showCopy={{true}} />

Notice that there are no type declarations here – but this *is* actually a well-typed component. The type of `count` is `number`, and if we accidentally wrote something like `this.count = "hello"` the compiler would give us an error.

## Adding arguments

So far so good, but of course most components aren’t quite this simple! Instead, they’re invoked by other templates and they can invoke other components themselves in their own templates.

Glimmer components can receive both *arguments* and *attributes* when they are invoked. When you are working with a component’s backing class, you have access to the arguments but *not* to the attributes. The arguments are passed to the constructor, and then available as `this.args` on the component instance afterward. Let’s imagine a component which just logs the names of its arguments when it is first constructed:

<DocsSnippet @name='args-display.ts' @title='my-app/components/args-display.ts' @showCopy={{true}} />

<aside>

If you’re used to the classic Ember Object model, there are two important differences in the constructor itself:

- we use `super` instead of `this._super`
- we *must* call `super` before we do anything else with `this`, because in a subclass `this` is set up by running the superclass's constructor first (as implied by [the JavaScript spec](https://tc39.es/ecma262/#sec-runtime-semantics-classdefinitionevaluation))

</aside>

Notice that we have to start by calling `super` with `owner` and `args`. This may be a bit different from what you’re used to in Ember or other frameworks, but is normal for sub-classes in TypeScript today. If the compiler just accepted any `...arguments`, a lot of potentially *very* unsafe invocations would go through. So, instead of using `...arguments`, we explicitly pass the *specific* arguments and make sure their types match up with what the super-class expects.

<aside>

This might change in the future! If TypeScript eventually adds [support for “variadic kinds”](https://github.com/Microsoft/TypeScript/issues/5453), using `...arguments` could become safe.

</aside>

The types for `owner` here and `args` line up with what the `constructor` for Glimmer components expect. The `owner` is specified as `unknown` because this is a detail we explicitly *don’t* need to know about. The `args` are `{}` because a Glimmer component *always* receives an object containing its arguments, even if the caller didn’t pass anything: then it would just be an empty object.

`{}` is an empty object type – all objects extend from it, but there will be no properties on it. This is distinct from the `object` type, which the TypeScript docs describe as:

> any thing that is not `number`, `string`, `boolean`, `symbol`, `null`, or `undefined`.

If we used `object`, we could end up with TypeScript thinking `args` were an array, or a `Set`, or anything else that isn’t a primitive. Since we have `{}`, we *know* that it's an object.

<aside>

For some further details, check out [this blog post](https://mariusschulz.com/blog/the-object-type-in-typescript).

</aside>

The `args` passed to a Glimmer Component [are available on `this`](https://github.com/glimmerjs/glimmer.js/blob/2f840309f013898289af605abffe7aee7acc6ed5/packages/%40glimmer/component/src/component.ts#L12), so we could change our definition to return the names of the arguments from a getter:

```ts
import Component from '@glimmer/component';

export default class ArgsDisplay extends Component {
  get argNames(): string[] {
    return Object.keys(this.args);
  }
}
```

```hbs
<p>The names of the <code>@args</code> are:</p>
<ul>
  {{#each this.argNames as |argName|}}
    <li>{{argName}}</li>
  {{/each}}
</ul>
```

### Understanding `args`

Now, looking at that bit of code, you might be wondering how it knows what the type of `this.args` is. In the `constructor` version, we explicitly *named* the type of the `args` argument. Here, it seems to just work automatically. This works because the type definition for a Glimmer component looks roughly like this:

```ts
export default class Component<Args extends {} = {}> {
  readonly args: Args;

  constructor(owner: unknown, args: Args);
}
```

{% hint style="info" %}

Not sure what’s up with `<Args>` *at all*? We highly recommend the [TypeScript Deep Dive](https://basarat.gitbooks.io/typescript/) book’s [chapter on generics ](https://basarat.gitbooks.io/typescript/docs/types/generics.html) to be quite helpful in understanding this part.

{% endhint %}

The type signature for Component, with `Args extends {} = {}`, means that the component *always* has a property named `args` —

* with the type `Args`
* which can be anything that extends the type `{}` – an object
* and *defaults* to being just an empty object – `= {}`

This is analogous to the type of `Array` : since you can have an array of `string` , or an array of `number` or an array of `SomeFancyObject` , the type of array is `Array<T>` , where `T` is the type of thing in the array, which TypeScript normally figures out for you automatically at compile time:

```ts
let a = [1, 2, 3];  // Array<number>
let b = ["hello", "goodbye"]; // Array<string>
```

In the case of the Component, we have the types the way we do so that you can’t accidentally define `args` as a string, or `undefined` , or whatever: it *has* to be an object. Thus, `Component<Args extends {}>` . But we also want to make it so that you can just write `extends Component` , so that needs to have a default value. Thus, `Component<Args extends {} = {}>`.

### Giving `args` a type

Now let’s put this to use. Imagine we’re constructing a user profile component which displays the user’s name and optionally an avatar and bio. The template might look something like this:

<DocsSnippet @name='user-profile.hbs' @title='my-app/components/user-profile.hbs' @showCopy={{true}} />

Then we could capture the types for the profile with an interface representing the *arguments*:

<DocsSnippet @name='user-profile.ts' @title='my-app/components/user-profile.ts' @showCopy={{true}} />

Assuming the default `tsconfig.json` settings (with `strictNullChecks: true`), this wouldn't type-check if we didn't *check* whether the `bio` argument were set, or if our `isURL` didn't account for the possibility of the string not being set.

## Generic subclasses

If you'd like to make your *own* component subclass-able, you need to make it generic as well.

{% hint style="warning" %}
Are you sure you want to provide an inheritance-based API? Oftentimes, it's easier to maintain (and involves less TypeScript hoop-jumping) to use a compositional API instead. If you're sure, here's how!
{% endhint %}

```ts
import Component from '@glimmer/component';

export interface FancyInputArgs {
  // ...
}

export default class FancyInput<Args extends FancyInputArgs = FancyInputArgs> extends Component<Args> {
  // ...
}
```

Requiring that `Args extends FancyInputArgs` means that subclasses can have *more* than these args, but not *fewer*. Specifying that the `Args = FancyInputArgs` means that they *default* to just being `FancyInputArgs`, so users don't need to supply an explicit generic type parameter here unless they're adding more arguments to the class.
