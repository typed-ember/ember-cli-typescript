# Current Limitations

While TS already works nicely for many things in Ember, there are a number of corners where it _won't_ help you out. Some of them are just a matter of further work on updating the [existing typings](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember); others are a matter of further support landing in TypeScript itself, or changes to Ember's object model.

## Some `import`s don't resolve

You'll frequently see errors for imports which TypeScript doesn't know how to resolve. **These won't stop the build from working;** they just mean TypeScript doesn't know where to find those.

Writing these missing type definitions is a great way to pitch in! Jump in `#topic-typescript` on the [Ember Community Discord server](https://discord.gg/zT3asNS) and we'll be happy to help you.

## Templates

Templates are currently totally non-type-checked. This means that you lose any safety when moving into a template context, even if using a Glimmer `Component` in Ember Octane.

Addons need to import templates from the associated `.hbs` file to bind to the layout of any components they export. The TypeScript compiler will report that it cannot resolve the module, since it does not know how to resolve files ending in `.hbs`. To resolve this, you can provide this set of definitions to `my-addon/types/global.d.ts`, which will allow the import to succeed:

```ts
declare module '\*/template' {
  import { TemplateFactory } from 'ember-cli-htmlbars';
  const template: TemplateFactory; export default template;
}


declare module 'app/templates/\*' {
  import { TemplateFactory } from 'ember-cli-htmlbars';
  const template: TemplateFactory; export default template;
}

declare module 'addon/templates/\*' {
  import { TemplateFactory } from 'ember-cli-htmlbars';
  const template: TemplateFactory; export default template;
}
```

## Invoking actions

TypeScript won't detect a mismatch between this action and the corresponding call in the template:

```ts
import Component from '@ember/component';
import { action } from '@ember/object';

export default class MyGame extends Component {
  @action turnWheel(degrees: number) {
    // ...
  }
}
```

```hbs
<button {{on "click" (fn this.turnWheel "potato")}}>
Click Me
</button>
```

Likewise, it won't notice a problem when you use the `send` method:

```ts
// TypeScript compiler won't detect this type mismatch
this.send\('turnWheel', 'ALSO-NOT-A-NUMBER'\);
```
