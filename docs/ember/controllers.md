# Controllers

Like [routes](./routes.md), controllers are just normal classes with a few special Ember lifecycle hooks and properties available.

The main thing you need to be aware of is special handling around query params. In order to provide type safety for query param configuration, Ember's types specify that when defining a query param's `type` attribute, you must supply one of the allowed types: `'boolean'`, `'number'`, `'array'`, or `'string'` \(the default\). However, if you supply these types as you would in JS, like this:

```typescript
import Controller from "@ember/controller";

export default class HeyoController extends Controller {
  queryParams = [
    {
      category: { type: "array" },
    },
  ];
}
```

Then you will see a type error like this:

```text
Property 'queryParams' in type 'HeyoController' is not assignable to the same property in base type 'Controller'.
  Type '{ category: { type: string; }; }[]' is not assignable to type '(string | Record<string, string | QueryParamConfig | undefined>)[]'.
    Type '{ category: { type: string; }; }' is not assignable to type 'string | Record<string, string | QueryParamConfig | undefined>'.
      Type '{ category: { type: string; }; }' is not assignable to type 'Record<string, string | QueryParamConfig | undefined>'.
        Property 'category' is incompatible with index signature.
          Type '{ type: string; }' is not assignable to type 'string | QueryParamConfig | undefined'.
            Type '{ type: string; }' is not assignable to type 'QueryParamConfig'.
              Types of property 'type' are incompatible.
                Type 'string' is not assignable to type '"string" | "number" | "boolean" | "array" | undefined'.ts(2416)
```

This is because TS currently infers the type of `type: "array"` as `type: string`. You can work around this by supplying `as const` after the declaration:

```diff
import Controller from "@ember/controller";

export default class HeyoController extends Controller {
  queryParams = [
    {
-     category: { type: "array" },
+     category: { type: "array" as const },
    },
  ];
}
```

Now it will type-check.

