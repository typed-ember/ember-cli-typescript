# Working with route models

We often use routes’ models throughout our application, since they’re a core ingredient of our application’s data. As such, we want to make sure that we have good types for them!

We can start by defining some type utilities to let us get the resolved value returned by a route’s model hook:

```typescript
import Route from '@ember/routing/route';

/**
  Get the resolved type of an item.

  - If the item is a promise, the result will be the resolved value type
  - If the item is not a promise, the result will just be the type of the item
 */
export type Resolved<P> = P extends Promise<infer T> ? T : P;

/** Get the resolved model value from a route. */
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;
```

How that works:

* `Resolved<P>` says "if this is a promise, the type here is whatever the promise resolves to; otherwise, it's just the value"
* `ReturnType<T>` gets the return value of a given function
* `R['model']` \(where `R` has to be `Route` itself or a subclass\) uses TS's mapped types to say "the property named `model` on `R`

Putting those all together, `ModelFrom<Route>` ends up giving you the resolved value returned from the `model` hook for a given route:

```typescript
type MyRouteModel = ModelFrom<MyRoute>;
```

## `model` on the controller

We can use this functionality to guarantee that the `model` on a `Controller` is always exactly the type returned by `Route::model` by writing something like this:

```typescript
import Controller from '@ember/controller';
import MyRoute from '../routes/my-route';
import { ModelFrom } from '../lib/type-utils';

export default class ControllerWithModel extends Controller {
  declare model: ModelFrom<MyRoute>;
}
```

Now, our controller’s `model` property will _always_ stay in sync with the corresponding route’s model hook.

**Note:** this _only_ works if you do not mutate the `model` in either the `afterModel` or `setupController` hooks on the route! That's generally considered to be a bad practice anyway. If you do change the type there, you'll need to define the type in some other way and make sure your route's model is defined another way.

