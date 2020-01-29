# Services

Ember Services are global singleton classes that can be made available to different parts of an Ember application via dependency injection. Due to their global, shared nature, writing services in TypeScript gives you a build-time-enforcable API for some of the most central parts of your application.

<aside>

If you are not familiar with Services in Ember, first make sure you have read and understood the [Ember Guide on Services][guide]!

</aside>

[guide]: https://guides.emberjs.com/release/services/

## A basic service

Let's take this example from the [Ember Guide][guide]:

<DocsSnippet @name='shopping-cart.ts' @title='app/services/shopping-cart.ts' @showCopy={{true}} />

Just making this a TypeScript file gives us some type safety without having to add any additional type information. We'll see this when we use the service elsewhere in the application.

## Using services

You can use a service in any container-resolved object such as a component or another service. Services are injected into these objects by decorating a property with the `inject` decorator. Because decorators can't affect the type of the property they decorate, we must manually type the property. Also, we must use the non-null assertion operator `!` to tell the TypeScript compiler to trust that this property will be initialized (TypeScript is not aware of service injection).

Here's an example of using the `ShoppingCartService` we defined above in a component:

<DocsSnippet @name='cart-contents.ts' @title='app/components/cart-contents.ts' @showCopy={{true}} />

Any attempt to access a property or method not defined on the service will fail type-checking:

<DocsSnippet @name='cart-contents-bad.ts' @title='app/components/cart-contents.ts' @showCopy={{false}} />

Services can also be loaded from the dependency injection container manually:

<DocsSnippet @name='cart-contents-lookup.ts' @title='app/components/cart-contents.ts' @showCopy={{true}} />

Here we need to cast the lookup result to `ShoppingCartService` in order to get type-safety.
