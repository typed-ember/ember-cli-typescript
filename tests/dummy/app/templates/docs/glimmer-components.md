# Glimmer Components

<aside>

If you’re entirely unfamiliar with Glimmer components, we recommend [the Ember Guides][guides-component] to understand that first!

</aside>


Glimmer Components are defined in one of three ways: with templates only, with a template and a backing class, or with only a backing class (i.e. a `yield`-only component). When using a backing class, you get a first-class experience using TypeScript! Unfortunately, we don’t yet support type-checking for templates, but we hope to build that out eventually. Don’t let that stop you, though: types in your component classes make for a great experience, so let’s dig in and see how it works in practice.

## A simple component

A *very* simple Glimmer component which lets you change the count of a value might look like this:

```htmlbars
<button {{on "click" this.minus}}>&minus;</button>
{{this.count}}
<button {{on "click" this.plus}}>+</button>
```

```ts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking'
import { action } from '@ember/object';

export default class Counter extends Component {
  @tracked count = 0;
  
  @action
  plus() {
    this.count += 1;
  }
  
  @action
  minus() {
    this.count -= 1;
  }
}
```

Notice that there are no type declarations here – but this *is* actually a well-typed component. The type of `count` is `number`, and if we accidentally wrote something like `this.count = null` the compiler would give us an error.

## A component with arguments

So far so good, but of course most components aren’t quite this simple! Instead, they’re invoked by other templates and they can invoke other components themselves in their own templates.

Glimmer components can receive both *arguments* and *attributes* when they are invoked. When you are working with a component’s backing class, you have access to the arguments but *not* to the attributes. The arguments are passed to the constructor, and then available as `this.args` on the component instance afterward. Let’s imagine a component which just logs the names of its arguments when it is first constructed:

```ts
import Component from '@glimmer/component';

export default class ArgsDisplay extends Component {
  constructor(owner: unknown, args: {}) {
    super(owner, args);

    Object.keys(args).forEach(argName => {
      console.log(argName);
    });
  }
}
```

<aside>

If you’re used to the classic Ember Object model, there are two important differences in the constructor itself:

- we use `super` instead of `this._super`
- we *must* call `super` before we do anything else

</aside>

Notice that we have to start by calling `super` with `owner` and `args`. This may be a bit different from what you’re used to in Ember or other frameworks, but is normal for sub-classes in TypeScript. If the compiler just accepted any `...arguments`, a lot of potentially *very* unsafe invocations would go through. So, instead of using `...arguments`, we explicitly pass the *specific* arguments and make sure their types match up with what the super-class expects.

The types for `owner` here and `args` line up with what the `constructor` for Glimmer components expect. The `owner` is specified as `unknown` because this is a detail we explicitly *don’t* need to know about. The `args` are `object` because a Glimmer component *always* receives an object containing its arguments, even if the caller didn’t pass anything: then it would just be an empty object.

The `args` are also available on `this`, just as you’d expect, so we could change our definition to return the names of the arguments from a getter:

```ts
import Component from '@glimmer/component';

export default class ArgsDisplay extends Component {
  get argNames(): string[] {
    return Object.keys(this.args);
  }
}
```

```htmlbars
<ul>
  {{#each this.argNames as |argName|}}
    <li>{{argName}}</li>
  {{/each}}
</ul>
```

Now, looking at that bit of code, you might be wondering how it knows what the type of `this.args` is. In the `constructor` version, we explicitly *named* the type of the `args` argument. Here, it seems to just work automatically. This works because the type definition for a Glimmer component looks roughly like this:

```ts
class Component<Args extends {} = {}> {
  args: Args;
}
```

::TODO: pull in the content from my answer on Stack Overflow here!::

[guides-component]: https://guides.emberjs.com/release/components/
