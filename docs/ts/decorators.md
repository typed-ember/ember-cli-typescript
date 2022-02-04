# Decorators

Ember makes heavy use of decorators, and TypeScript does not currently support deriving type information from decorators.

As a result, there are three important points that apply to _all_ decorator usage in Ember:

1. Whenever using a decorator to declare a class field the framework sets up for you, you should mark it with `declare`. That includes all service and controller injections as well as all Ember Data attributes and relationships.

   Normally, TypeScript determines whether a property is definitely not `null` or `undefined` by checking what you do in the constructor. In the case of service injections, controller injections, or Ember Data model decorations, though, TypeScript does not have visibility into how instances of the class are _initialized_. The `declare` annotation informs TypeScript that a declaration is defined somewhere else, outside its scope.

2. For Ember Data Models, you will need to use the optional `?` operator on field declarations if the field is optional \(`?`\). See the Ember Data section of the guide for more details!

3. You are responsible to write the type correctly. TypeScript does not currently use decorator information at all in its type information. If you write `@service foo` or even `@service('foo') foo`, _Ember_ knows that this resolves at runtime to the service `Foo`, but TypeScript does not and—for now—_cannot_.

   This means that you are responsible to provide this type information, and that you are responsible to make sure that the information remains correct and up to date

For examples, see the detailed discussions of the two main places decorators are used in the framework:

* [Services](../ember/services.md)
* [Ember Data Models](../ember-data/models.md)
