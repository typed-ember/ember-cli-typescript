# Services

Ember Services are global singleton classes that can be made available to different parts of an Ember application via dependency injection. Due to their global, shared nature, writing services in TypeScript gives you a build-time-enforcable API for some of the most central parts of your application.

{% hint style="info" %}
If you are not familiar with Services in Ember, first make sure you have read and understood the [Ember Guide on Services](https://guides.emberjs.com/release/services/)!
{% endhint %}

## A basic service

Let's take this example from the [Ember Guide](https://guides.emberjs.com/release/services/):

```typescript
import { A } from '@ember/array';
import Service from '@ember/service';

export default class ShoppingCartService extends Service {
  items = A([]);

  add(item) {
    this.items.pushObject(item);
  }

  remove(item) {
    this.items.removeObject(item);
  }

  empty() {
    this.items.clear();
  }
}
```

Just making this a TypeScript file gives us some type safety without having to add any additional type information. We'll see this when we use the service elsewhere in the application.

{% hint style="info" %}
When working in Octane, you're better off using a `TrackedArray` from [tracked-built-ins](https://github.com/pzuraq/tracked-built-ins) instead of the classic EmberArray:

```typescript
import { TrackedArray } from 'tracked-built-ins';
import Service from '@ember/service';

export default class ShoppingCartService extends Service {
  items = new TrackedArray();

  add(item) {
    this.items.push(item);
  }

  remove(item) {
    this.items.splice(1, this.items.findIndex((i) => i === item));
  }

  empty() {
    this.items.clear();
  }
}
```

Notice that here we are using only built-in array operations, not Ember's custom array methods.
{% endhint %}

## Using services

You can use a service in any container-resolved object such as a component or another service. Services are injected into these objects by decorating a property with the `inject` decorator. Because decorators can't affect the type of the property they decorate, we must manually type the property. Also, we must use `declare` modifier to tell the TypeScript compiler to trust that this property will be set up by something outside this component—namely, the decorator.

Here's an example of using the `ShoppingCartService` we defined above in a component:

```typescript
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import ShoppingCartService from 'my-app/services/shopping-cart';

export default class CartContentsComponent extends Component {
  @service declare shoppingCart: ShoppingCartService;

  @action
  remove(item) {
    this.shoppingCart.remove(item);
  }
}
```

Any attempt to access a property or method not defined on the service will fail type-checking:

```typescript
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import ShoppingCartService from 'my-app/services/shopping-cart';

export default class CartContentsComponent extends Component {
  @service declare shoppingCart: ShoppingCartService;

  @action
  remove(item) {
    // Error: Property 'saveForLater' does not exist on type 'ShoppingCartService'.
    this.shoppingCart.saveForLater(item);
  }
}
```

Services can also be loaded from the dependency injection container manually:

```typescript
import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

import ShoppingCartService from 'my-app/services/shopping-cart';

export default class CartContentsComponent extends Component {
  get cart() {
    return getOwner(this).lookup('service:shopping-cart') as ShoppingCartService;
  }

  @action
  remove(item) {
    this.cart.remove(item);
  }
}
```

Here we need to cast the lookup result to `ShoppingCartService` in order to get any type-safety because the lookup return type is `any` \(see caution below\).

{% hint style="danger" %}
This type-cast provides no guarantees that what is returned by the lookup is actually the service you are expecting. Because TypeScript cannot resolve the lookup micro-syntax \(`service:<name>`\) to the service class, a typo would result in returning something other than the specified type. It only gurantees that _if_ the expected service is returned that you are using it correctly.

There is a merged \(but not yet implemented\) [RFC](https://emberjs.github.io/rfcs/0585-improved-ember-registry-apis.html) which improves this design and makes it straightforward to type-check. Additionally, TypeScript 4.1's introduction of [template types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#template-literal-types) may allow us to supply types that work with the microsyntax.

For now, however, remember that _the cast is unsafe_!
{% endhint %}

