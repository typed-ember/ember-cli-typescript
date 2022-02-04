# Mixins

Mixins are fundamentally hostile to robust typing with TypeScript. While you can supply types for them, you will regularly run into problems with self-referentiality in defining properties within the mixins.

As a stopgap, you can refer to the type of a mixin using the `typeof` operator.

In general, however, prefer to use one of the following four strategies for migrating _away_ from mixins before attempting to convert code which relies on them to TypeScript:

1. For functionality which encapsulates DOM modification, rewrite as a custom modifier using [ember-modifier](https://github.com/emeber-modifier/ember-modifier).
2. If the mixin is a way of supplying shared behavior \(not data\), extract it to utility functions, usually just living in module scope and imported and exported as needed.
3. If the mixin is a way of supplying non-shared state which follows the lifecycle of a given object, replace it with a utility class instantiated in the owning class's `constructor` \(or `init` for legacy classes\).
4. If the mixin is a way of supplying long-lived, shared state, replace it with a service and inject it where it was used before. This pattern is uncommon, but sometimes appears when mixing functionality into multiple controllers or services.

You can also use inheritance and class decorators to accomplish some of the same semantics as mixins classically supplied. However, these patterns are more fragile and therefore not recommended.

