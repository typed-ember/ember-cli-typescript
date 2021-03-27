# Routes

Working with Routes is in general just working normal TypeScript classes. Ember's types supply the definitions for the various lifecycle events available within route subclasses, which will provide autocomplete and type-checking along the way in general.

However, there is one thing to watch out for: the types of the arguments passed to methods will _not_ autocomplete as you may expect. This is because in _general_ a subclass may override a superclass method as long as it calls its superclass's method correctly. This is very bad practice, but it is legal JavaScript! This is never a concern for lifecycle hooks in Ember, because they are called by the framework itself. However, TypeScript does not and cannot know that, so we have to provide the types directly.

Accordingly, and because the `Transition` type is not currently exported as a public type, you may find it convenient to define it using TypeScript's `ReturnType` utility type, which does exactly what it sounds like and gives us a local type which is the type returned by some function. The `RouterService.transitionTo` returns a `Transition`, so we can rely on that as stable public API to define `Transition` locally ourselves:

```typescript
import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
type Transition = ReturnType<RouterService['transitionTo']>;

export default class MyRoute extends Route {
  beforeModel(transition: Transition) {
    // ...
  }
}
```

This inconsistency will be solved in the future. For now, this workaround gets the job done, and also shows the way to using this information to provide the type of the route's model to other consumers: see [Working with Route Models](../cookbook/working-with-route-models.md) for details!

```typescript
import Route from '@ember/routing/route';

type Resolved<P> = P extends Promise<infer T> ? T : P;

export type MyRouteModel = Resolved<ReturnType<MyRoute['model']>>;

export default class MyRoute extends Route {
  model() {
    // ...
  }
}
```

The `Resolved<T>` utility type takes in any type, and if the type is a `Promise` it transforms the type into whatever the `Promise` resolves to; otherwise it just returns the same type. As we saw above, `ReturnType` gets us the return type of the function. So our final `MyRouteModel` type takes the return type from our `model` hook, and uses the `Resolved` type to get the type the promise will resolve to—that is, exactly the type we will have available as `@model` in the template and as `this.model` on a controller. This in turn allows us to use

