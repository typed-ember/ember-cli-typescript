# Components

{% hint style="info" %}
New to Ember or the Octane edition specifically? You may want to read [the Ember Guides’ material on `Component`s](https://guides.emberjs.com/release/components/) first!
{% endhint %}

Glimmer Components are defined in one of three ways: with templates only, with a template and a backing class, or with only a backing class \(i.e. a `yield`-only component\). When using a backing class, you get a first-class experience using TypeScript! For type-checking Glimmer templates as well, see [Glint](https://typed-ember.gitbook.io/glint/).

## A simple component

A _very_ simple Glimmer component which lets you change the count of a value might look like this:

```text
<button {{on "click" this.minus}}>&minus;</button>
{{this.count}}
<button {{on "click" this.plus}}>+</button>
```

```typescript
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Counter extends Component {
  @tracked count = 0;

  @action plus() {
    this.count += 1;
  }

  @action minus() {
    this.count -= 1;
  }
}
```

Notice that there are no type declarations here – but this _is_ actually a well-typed component. The type of `count` is `number`, and if we accidentally wrote something like `this.count = "hello"` the compiler would give us an error.

## Adding arguments and giving them a type

So far so good, but of course most components aren’t quite this simple! Instead, they’re invoked by other templates and they can invoke other components themselves in their own templates.

Glimmer components can receive both _arguments_ and _attributes_ when they are invoked. When you are working with a component’s backing class, you have access to the arguments but _not_ to the attributes. The arguments are passed to the constructor, and then available as `this.args` on the component instance afterward. 

Since the implementation of [RFC 748], Glimmer and Ember components accept a `Signature` type parameter as part of their definition. This parameter is expected to be an object type with (up to) three members: `Args`, `Element` and `Blocks`.

[rfc 748]: https://github.com/emberjs/rfcs/pull/748

`Args` represents the arguments your component accepts. Typically this will be an object type mapping the names of your args to their expected type. For example:

```
export interface MySignature {
  Args: {
    arg1: string;
    arg2: number;
    arg3: boolean;
  }
}
```
If no `Args` key is specified, it will be a type error to pass any arguments to your component. You can read more about `Element` and `Block` in the Glint [Component Signatures documentation](https://typed-ember.gitbook.io/glint/using-glint/ember/component-signatures).

Let’s imagine a component which just logs the names of its arguments when it is first constructed. First, we must define the Signature and pass it into our component, then we can use the `Args` member in our Signature to set the type of `args` in the constructor:

```typescript
import Component from '@glimmer/component';

const log = console.log.bind(console);

export interface ArgsDisplaySignature {
  Args: {
    arg1: string;
    arg2: number;
    arg3: boolean;
  }
}

export default class ArgsDisplay extends Component<ArgsDisplaySignature> {
  constructor(owner: unknown, args: ArgsDisplaySignature['Args']) {
    super(owner, args);

    Object.keys(args).forEach(log);
  }
}
```

{% hint style="info" %}
If you’re used to the classic Ember Object model, there are two important differences in the constructor itself:

* we use `super` instead of `this._super`
* we _must_ call `super` before we do anything else with `this`, because in a subclass `this` is set up by running the superclass's constructor first \(as implied by [the JavaScript spec](https://tc39.es/ecma262/#sec-runtime-semantics-classdefinitionevaluation)\)
{% endhint %}

Notice that we have to start by calling `super` with `owner` and `args`. This may be a bit different from what you’re used to in Ember or other frameworks, but is normal for sub-classes in TypeScript today. If the compiler just accepted any `...arguments`, a lot of potentially _very_ unsafe invocations would go through. So, instead of using `...arguments`, we explicitly pass the _specific_ arguments and make sure their types match up with what the super-class expects.

{% hint style="info" %}
This might change in the future! If TypeScript eventually adds [support for “variadic kinds”](https://github.com/Microsoft/TypeScript/issues/5453), using `...arguments` could become safe.
{% endhint %}

The types for `owner` here and `args` line up with what the `constructor` for Glimmer components expect. The `owner` is specified as `unknown` because this is a detail we explicitly _don’t_ need to know about. The `args` are the `Args` from the Signature we defined.

The `args` passed to a Glimmer Component [are available on `this`](https://github.com/glimmerjs/glimmer.js/blob/2f840309f013898289af605abffe7aee7acc6ed5/packages/%40glimmer/component/src/component.ts#L12), so we could change our definition to return the names of the arguments from a getter:

```typescript
import Component from '@glimmer/component';

export interface ArgsDisplaySignature {
  Args: {
    arg1: string;
    arg2: number;
    arg3: boolean;
  }
}

export default class ArgsDisplay extends Component<ArgsDisplaySignature> {
  get argNames(): string[] {
    return Object.keys(this.args);
  }
}
```

```text
<p>The names of the <code>@args</code> are:</p>
<ul>
  {{#each this.argNames as |argName|}}
    <li>{{argName}}</li>
  {{/each}}
</ul>
```

### Understanding `args`

Now, looking at that bit of code, you might be wondering how it knows what the type of `this.args` is. In the `constructor` version, we explicitly _named_ the type of the `args` argument. Here, it seems to just work automatically. This works because the type definition for a Glimmer component looks roughly like this:

```typescript
export default class Component<Args extends {} = {}> {
  readonly args: Args;

  constructor(owner: unknown, args: Args);
}
```

{% hint style="info" %}
Not sure what’s up with `<Args>` _at all_? We highly recommend the [TypeScript Deep Dive](https://basarat.gitbooks.io/typescript/) book’s [chapter on generics ](https://basarat.gitbooks.io/typescript/docs/types/generics.html) to be quite helpful in understanding this part.
{% endhint %}

The type signature for Component, with `Args extends {} = {}`, means that the component _always_ has a property named `args` —

* with the type `Args`
* which can be anything that extends the type `{}` – an object
* and _defaults_ to being just an empty object – `= {}`

This is analogous to the type of `Array` : since you can have an array of `string` , or an array of `number` or an array of `SomeFancyObject` , the type of array is `Array<T>` , where `T` is the type of thing in the array, which TypeScript normally figures out for you automatically at compile time:

```typescript
let a = [1, 2, 3];  // Array<number>
let b = ["hello", "goodbye"]; // Array<string>
```

In the case of the Component, we have the types the way we do so that you can’t accidentally define `args` as a string, or `undefined` , or whatever: it _has_ to be an object. Thus, `Component<Args extends {}>` . But we also want to make it so that you can just write `extends Component` , so that needs to have a default value. Thus, `Component<Args extends {} = {}>`.

### Giving `args` a type

Now let’s put this to use. Imagine we’re constructing a user profile component which displays the user’s name and optionally an avatar and bio. The template might look something like this:

```text
<div class='user-profile' ...attributes>
  {{#if this.avatar}}
    <img src={{this.avatar}} class='user-profile__avatar'>
  {{/if}}
  <p class='user-profile__bio'>{{this.userInfo}}</p>
</div>
```

Then we could capture the types for the profile with an interface representing the _arguments_:

```typescript
import Component from '@glimmer/component';
import { generateUrl } from '../lib/generate-avatar';

interface User {
  name: string;
  avatar?: string;
  bio?: string;
}

export default class UserProfile extends Component<User> {
  get userInfo(): string {
    return this.args.bio ? `${this.args.name} ${this.args.bio}` : this.args.name;
  }

  get avatar(): string {
    return this.args.avatar ?? generateUrl();
  }
}
```

Assuming the default `tsconfig.json` settings \(with `strictNullChecks: true`\), this wouldn't type-check if we didn't _check_ whether the `bio` argument were set.

## Generic subclasses

If you'd like to make your _own_ component subclass-able, you need to make it generic as well.

{% hint style="warning" %}
Are you sure you want to provide an inheritance-based API? Oftentimes, it's easier to maintain \(and involves less TypeScript hoop-jumping\) to use a compositional API instead. If you're sure, here's how!
{% endhint %}

```typescript
import Component from '@glimmer/component';

export interface FancyInputArgs {
  // ...
}

export default class FancyInput<Args extends FancyInputArgs = FancyInputArgs> extends Component<Args> {
  // ...
}
```

Requiring that `Args extends FancyInputArgs` means that subclasses can have _more_ than these args, but not _fewer_. Specifying that the `Args = FancyInputArgs` means that they _default_ to just being `FancyInputArgs`, so users don't need to supply an explicit generic type parameter here unless they're adding more arguments to the class.
