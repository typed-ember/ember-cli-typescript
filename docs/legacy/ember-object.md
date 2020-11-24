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


## Mixins and classic class syntax

The Ember mixin system is the legacy Ember construct TypeScript supports *least* well, as described in [Mixins](./mixins/). While this may not be intuitively obvious, the classic class syntax simply *is* the mixin system. Every classic class creation is a case of mixing together multiple objects to create a new base class with a shared prototype. The result is that any time you see the classic `.extend({ ... })` syntax, regardless of whether there is a named mixin involved, you are dealing with Ember's legacy mixin system. This in turn means that you are dealing with the parts of Ember which TypeScript is *least* able to handle well.

While we describe here how to use types with classic (mixin-based) classes insofar as they *do* work, there are many failure modes. As a result, we strongly recommend moving away from both classic classes and mixins, and as quickly as possible. This is the direction the Ember ecosystem as a whole is moving, but it is *especially* important for TypeScript users.

<aside>

The [Ember Atlas] includes guides for migrating [from classic classes to native classes][classic to native], along with [a variety of patterns][mixin patterns] for dealing with specific kinds of mixins in your codebase.

</aside>

[Ember Atlas]: https://emberatlas.com
[classic to native]: https://www.notion.so/Native-Classes-55bd67b580ca49f999660caf98aa1897
[mixin patterns]: https://www.notion.so/Converting-Classes-with-Mixins-5dc68c0ac3044e51a218fa7aec71c2db

### Failure modes

You often need to define `this` in actions hashes, computd properties, etc. That in turn often leads to problems with self-referential `this`: TypeScript simply cannot figure out how to stop recursing through the definitions of the type.

Additionally, even when you get past the endlessly-recursive type definition problems, when enough mixins are resolved TypeScript will occasionally just give up because it cannot resolve the property or method you're interested in across the many shared base classes.

Finally, when you have "zebra-striping" of your classes between classic classes and native classes, your types will often stop resolving.

## Native classes

### `EmberObject`

In general, we recommend (following the Ember Octane guides) that any class which extends directly from the `EmberObject` base class eliminate any use of `EmberObject`-specific API and convert to standalone class, with no base class at all. You can follow the [ember-classic-decorator] workflow to eliminate the base class—switching from `init` to `constructor`, getting rid of uses of methods like `this.set` and `this.get` in favor of using standalone `set` and `get`, and so on.

[ember-classic-decorator]: https://github.com/emberjs/ember-classic-decorator

###  `EmberObject`-descended classes

The framework base classes which depend on `EmberObject` cannot follow the exact same path. However, as long as you are using native class syntax, all of these (`Component`, `Controller`, `Helper`,  etc.) work nicely and safely with TypeScript. In each of these cases, the same caveats apply as with `EmberObject` itself, and you should follow the [ember-classic-decorator] workflow with them as well if you are converting an existing app or addon. However, because these base classes themselves descend from `EmberObject`, you will not be able to remove the base classes as you can with your *own* classes which descend *directly* from `EmberObject`. Instead, you will continue to extend from the Ember base classes:

```ts
import Component from '@ember/component';
export default class Profile extends Component {}
```
```ts
import Controller from '@ember/controller';
export default class IndexController extends Controller {}
```
```ts
import Helper from '@ember/component/helper';
export default class Localize extends Helper {}
```
```ts
import Route from '@ember/routing/route';
export default class ApplicationRoute extends Route {}
```
```ts
import EmberRouter from '@ember/routing/router'
export default class AppRouter extends EmberRouter {}
```
```ts
import Service from '@ember/service';
export default class Session extends Service {}
```
```ts
import Model from '@ember-data/model';
export default class User extends Model {}
```
