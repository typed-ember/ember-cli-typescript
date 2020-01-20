# Decorators

<!-- TODO: link to Decorators discussions in the Ember guides and the ember-decorators docs -->

There are two important points that apply to *all* decorator usage in Ember:

1. Whenever using a decorator, you will need to use the `?` or `!` operator on field declarations to specify whether the field is optional (`?`) or guaranteed to be present (`!`) on an instance of the model (assuming you are using the default configuration).

    Normally, TypeScript determines whether a property is definitely not `null` or `undefined` by checking what you do in the constructor. In the case of service injections, controller injections, or Ember Data model decorations, though, TypeScript does not have visibility into how instances of the class are *initialized*.

2. You are responsible to write the type correctly. TypeScript does not currently use decorator information at all in its type information. If you write `@service foo` or even `@service('foo') foo`, *Ember* knows that this resolves at runtime to the service `Foo`, but TypeScript does not and—for now—*cannot*.

    This means that you are responsible to provide this type information, and that you are responsible to make sure that the information remains correct and up to date

For examples, see the detailed discussions of each place decorators are used in the framework:

- <LinkTo @route='docs.ember.services'>Ember Services</LinkTo>
- <LinkTo @route='docs.ember.controllers'>Ember Controllers</LinkTo>
- <LinkTo @route='docs.ember-data.models'>Ember Data Models</LinkTo>
