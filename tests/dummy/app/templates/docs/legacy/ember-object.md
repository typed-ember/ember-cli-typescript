# `EmberObject`

When working with the legacy Ember object model, `EmberObject`, there are a number of caveats and limitations you need to be aware of. For today, these caveats and limitations apply to any classes which extend directly from `EmberObject`, or which extend classes which *themselves* extend `EmberObject`:

- `Component` – meaning *classic* Ember components, which imported from `@ember/component`, *not* Glimmer components which are imported from `@glimmer/component` and do *not* extend the `EmberObject` base class.
- `Controller`
- `Helper` – note that this applies only to the *class* form. Function-based helpers do not involve the `EmberObject` base class.
- `Route`
- `Router`
- `Service`
- Ember Data’s `Model` class

Additionally, Ember’s mixin system is deeply linked to the semantics and implementation details of `EmberObject`, *and* it has the most caveats and limitations.

<aside>

In the future, some of these may be able to drop their `EmberObject` base class dependency, but that will not happen till at least the next major version of Ember, and these guides will be updated when that happens.

</aside>
