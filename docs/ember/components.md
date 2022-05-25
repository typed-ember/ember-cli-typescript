# Components

{% hint style="info" %}
New to Ember or the Octane edition specifically? You may want to read [the Ember Guides’ material on `Component`s](https://guides.emberjs.com/release/components/) first!
{% endhint %}

Glimmer Components are defined in one of three ways: with templates only, with a template and a backing class, or with only a backing class \(i.e. a `yield`-only component\). When using a backing class, you get a first-class experience using TypeScript! Furthermore, when used with [Glint](https://typed-ember.gitbook.io/glint/), the typing you provide for your components provides guidance for type-checking your handlebars templates. So let’s dig in and see how it works in practice.

## A simple component

A _very_ simple Glimmer component, `Counter`, which lets you change the count of a value might look like this:

```hbs
{{! /app/components/counter.hbs }}
<button {{on "click" this.minus}}>&minus;</button>
{{this.count}}
<button {{on "click" this.plus}}>+</button>
```

```typescript
/* /app/components/counter.ts */
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

Notice that though there are no type declarations here, this _is_ actually a well-typed component. The type of `count` is `number`, and if we accidentally wrote something like `this.count = "hello"` the compiler would give us an error.

## Component Signature

So far so good, but most components aren't quite this simple! As of [RFC 0748](https://emberjs.github.io/rfcs/0748-glimmer-component-signature.html), Glimmer components have a specific `Signature` that defines:

* What _arguments_, if any, the component accepts and expects
* What _blocks_, if any, the component accepts and expects
* What kind of `Element` the component provides for attributes and modifiers

These three categories, encapsulated as `Args`, `Blocks`, and `Element` fields, make up a Glimmer component's `Signature`. None of the categories is required. As such, the most basic Glimmer component can be typed like this:

```typescript
/* /app/components/my-component.ts */
import Component from '@glimmer/component';

interface MyComponentSignature {}

export default class MyComponent extends Component<MyComponentSignature> {}
```

We'll explore `Args`, `Blocks`, and `Element` fields below.

## Adding arguments with the `Args` field

Glimmer components receive arguments and then expose them as `this.args` within the component's backing class. Given a `MyButton` component invoked like this:

```hbs
<MyButton @type="submit" @text="Submit!" @clickHandler={{this.handleClick}} class="button-primary"/>
```

We can see that it receives three arguments, `type`, `text`, and `clickHandler`. In this example, `class` is an _attribute_, not an _argument_, and Glimmer handles attributes through the `Element` part of the signature, as detailed below. The three arguments are all available in the backing class as `this.args.type`, `this.args.text`, and `this.args.clickHandler`. And these three can be typed in our component's signature:

```typescript
/* /app/components/my-button.ts */
import Component from '@glimmer/component';

interface MyButtonComponentSignature {
  Args: {
    type?: 'submit' | 'reset' | 'button';
    text?: string;
    clickHandler?: () => void;
  };
}

export default class MyButtonComponent extends Component<MyButtonComponentSignature> {}
```

```hbs
{{! /app/components/my-button.hbs }}
<button type={{@type}} ...attributes>
  {{@text}}
</button>
```

Note that this example does not do anything with `@clickHandler`. Similarly, though the arguments are marked as optional in the signature, in practice, Ember is relying on them. If someone neglected to include a `clickHandler`, in fact, and so `undefined` was passed to an `{{on "click"}}` modifier, the app would crash. Let's use some getters to toughen up this component:

```typescript
/* /app/components/my-button.ts */
import Component from '@glimmer/component';
import { action } from '@ember/object';

interface MyButtonComponentSignature {
  Args: {
    type?: 'submit' | 'reset' | 'button';
    text?: string;
    clickHandler?: () => void;
  };
}

export default class MyButtonComponent extends Component<MyButtonComponentSignature> {
  get type() {
    return this.args.type ?? 'button';
  }

  get text() {
    return this.args.text ?? 'Default Button Label';
  }

  @action handleClick() {
    this.args.clickHandler();
  }
}
```

```hbs
{{! /app/components/my-button.hbs }}
<button type={{this.type}} {{on "click" this.handleClick}}>
  {{this.text}}
</button>
```

The `Args` field can host any kind of type. For example, components are often passed a `@model` argument. If you know that the component is being passed an Ember Data `User` model through the `@model` argument, you could type the component like this:

```typescript
/* /app/components/user-profile-widget.ts */
import Component from '@glimmer/component';
import type User from 'my-app-name/models/user';

interface UserProfileWidgetComponentSignature {
  Args: {
    model?: User;
  };
}

export default class UserProfileWidgetComponent extends Component<UserProfileWidgetComponentSignature> {}
```

## Adding blocks with the `Blocks` field

Glimmer components in Ember receive not only arguments and attributes, [but they can also receive blocks](https://guides.emberjs.com/release/components/block-content/) . The default component template in Ember, for example, is nothing more than `{{yield}}`, which yields the `default` block back to the template that invoked the component. When typing a Glimmer component, then, we can type the blocks and the parameters sent to each block.

Building on the example in the Ember guides, Assume you want to create a `BlogPost` component that nevertheless allows the developer to change the HTML on a case-by-case basis. Given a template like:

```hbs
{{! /app/components/blog-post.hbs}}
<article>
  <header>
    <h1>{{@post.title}}</h1>
    <h2>by {{@post.author}}</h2>
  </header>

    {{yield @post.body}}

</article>
```

The component could then be invoked like this:

```hbs
{{! /app/templates/blog/post.hbs}}
<BlogPost @post={{@model}} as |postBody|>
  <img alt="" role="presentation" src="./blog-logo.png">

  {{postBody}}
</BlogPost>
```

We could then type this component:

```typescript
/* /app/components/blog-post.ts */
import Component from '@glimmer/component';
import type Post from 'my-app-name/models/post';

interface BlogPostComponentSignature {
  Args: {
    post: Post;
  };
  Blocks: {
    default: [postBody: string];
  }
}

export default class BlogPostComponent extends Component<BlogPostComponentSignature> {}
```

Named blocks, invoked with `{{yield to="someName"}}` are typed exactly as the `default` block in the `Blocks` field, but with, in this example, `someName` as the key. Additionally, any added block parameters would be added to the array, like `default: [postBody?: string, postAuthor?: string]`. If the block yields no parameters, then the array of parameters is simply empty, so simply `{{yield}}` would be typed as `default: []` within the `Blocks` field.

Working with blocks—and especially named blocks—is a new pattern for many Ember users, so we recommend reading [the Ember Guide to block content](https://guides.emberjs.com/release/components/block-content/) as well as the [API documentation for glimmer components](https://api.emberjs.com/ember/release/modules/@glimmer%2Fcomponent).

## Directing the DOM with `Element`

As mentioned above, the _attributes_ a Glimmer component receives (such as `class`) are not handled by the `Args` field. Those attributes, instead, are collected and provided to the component as the `...attributes` splattributes. What kind of DOM element (if any) will receive the splattributes is indicated by the `Element` member of the component `Signature`.

This holds true for modifiers as well. In fact, a component `Signature` with no `Element` or with `Element: null` indicates that its component does not accept HTML attributes and modifiers at all. The `MyButton` component from above, then, needs to be amended:

```typescript
/* /app/components/my-button.ts */
import Component from '@glimmer/component';

interface MyButtonComponentSignature {
  Args: {
    type?: 'submit' | 'reset' | 'button';
    text?: string;
    clickHandler?: () => void;
  };
  Element: HTMLButtonElement;
}

// ...
```

The DOM element indicated in `Element` is not necessarily the root element of the component. Rather, it indicates where `...attributes` will be spread. For example, the `<ResponsiveImage>` component from [ember-responsive-image](https://github.com/kaliber5/ember-responsive-image) provides a `<picture>` element with an `<img>` element inside. It's the latter element that receives `...attributes`, so the component's `Signature`'s `Element` field would be (and [is](https://github.com/kaliber5/ember-responsive-image/blob/master/addon/components/responsive-image.ts)) `HTMLImageElement`. 

The `Element` member is of particular relevance for the modifiers that consumers can apply to a component. In a system using this information to provide typechecking, any modifiers applied to its component must be declared to accept the component's Element type (or a broader type) as its first parameter, or else produce a type error.

A component with `Element: Element` can only be used with modifiers that accept any DOM element. Many existing modifiers in the Ember ecosystem, such as `{{on}}` and everything in [ember-render-modifiers](https://github.com/emberjs/ember-render-modifiers), fall into this bucket.

A component with e.g. `Element: HTMLCanvasElement`, may be used with any general-purpose modifiers as described above as well as any modifiers that specifically expect to be attached to a `<canvas>`.

A component whose `Element` type is a union of multiple possible elements can only be used with a modifier that is declared to accept all of those element types. This behavior is, in fact, the point—modifiers are essentially callbacks that receive the element they're attached to, and so the normal considerations for typing callback parameters apply.

## Subclassing your own component

If you'd like to make your *own* component subclass-able, you need to make it generic as well.

{% hint style="warning" %}
Are you sure you want to provide an inheritance-based API? Oftentimes, it's easier to maintain \(and involves less TypeScript hoop-jumping\) to use a compositional API instead. If you're sure, here's how!
{% endhint %}

Because the `Signature` has multiple fields, subclassing just, say, the `Args` field requires an additional step. So given a parent component:

```typescript
/* /app/components/parent.ts */
import Component from '@glimmer/component';

interface ParentComponentSignature {
  Element: Element;
  Args: {
    name?: string;
  }
}

export default class ParentComponent<S extends ParentComponentSignature> extends Component<S> {}
```

The child component must first add its arguments to just the `Args` of the parent component and then extend the parent component's `Signature`:

```typescript
/* /app/components/child.ts */
import ParentComponent, { ParentComponentSignature } from './parent';

type ChildComponentSignatureArgs = ParentComponentSignature['Args'] & {
  childName?: string;
}

interface ChildComponentSignature extends ParentComponentSignature {
  Args: ChildComponentSignatureArgs;
}

export default class Childcomponent extends ParentComponent<ChildComponentSignature> {}
```

