- Start Date: 2020-06-03
- RFC PR: [#1158](https://github.com/typed-ember/ember-cli-typescript/pull/1158)
- Tracking: (leave this empty)

# RFC: Defining Semantic Versioning for Published Addon Types

This RFC proposes a set of guidelines and tooling recommendations for managing changes as addons adopt TypeScript throughout the Ember ecosystem, as part of the path to making TypeScript a first-class citizen in Ember as a whole.

This RFC does *not* attempt to solve -- 

- the problem of stability for ambient types distributed separately from the package they represent (e.g. from DefinitelyTyped in the `@types` namespace)
- performance regression analysis

These concerns will be addressed in future RFCs.

While the detailed recommendations here are specific to the Ember ecosystem, we believe these recommendations will also be useful for the TypeScript ecosystem more broadly, with tweaks as appropriate to other ecosystems!

<!-- omit in toc -->
## Summary

Introduce an addon-focused policy for supported versions of TypeScript which is well-aligned with Ember's SemVer and LTS commitments and design workflows to support that policy, so that consumers of Ember addons which publish types are insulated from breaking changes in TypeScript to the degree possible, and able to manage them appropriately otherwise.

- [Motivation](#motivation)
- [Detailed design](#detailed-design)
    - [Background: TypeScript and Semantic Versioning](#background-typescript-and-semantic-versioning)
    - [Defining breaking changes](#defining-breaking-changes)
        - [Definitions](#definitions)
        - [Breaking changes](#breaking-changes)
            - [Symbols](#symbols)
            - [Interfaces, Type Aliases, and Classes](#interfaces-type-aliases-and-classes)
            - [Functions](#functions)
        - [Non-breaking changes](#non-breaking-changes)
            - [Symbols](#symbols-1)
            - [Interfaces, Type Aliases, and Classes](#interfaces-type-aliases-and-classes-1)
            - [Functions](#functions-1)
        - [Bug fixes](#bug-fixes)
        - [Dropping support for previously-supported versions](#dropping-support-for-previously-supported-versions)
    - [Tooling](#tooling)
        - [Detect breaking changes in types](#detect-breaking-changes-in-types)
        - [Mitigate breaking changes](#mitigate-breaking-changes)
            - [Avoiding user constructability](#avoiding-user-constructability)
            - [Updating types to maintain compatibility](#updating-types-to-maintain-compatibility)
            - ["Downleveling" types](#downleveling-types)
            - [Opt-in future types](#opt-in-future-types)
        - [Matching exports to public API](#matching-exports-to-public-api)
    - [Policy for supported TypeScript versions](#policy-for-supported-typescript-versions)
        - [Supporting new versions](#supporting-new-versions)
        - [Dropping TypeScript versions](#dropping-typescript-versions)
        - [Documenting supported versions](#documenting-supported-versions)
    - [Summary](#summary)
- [How we teach this](#how-we-teach-this)
- [Drawbacks](#drawbacks)
- [Alternatives](#alternatives)
    - [No policy](#no-policy)
    - [Decouple TypeScript support from Ember's LTS cycle](#decouple-typescript-support-from-embers-lts-cycle)
    - [Use an alternative to `downlevel-dts`](#use-an-alternative-to-downlevel-dts)
- [Unresolved questions](#unresolved-questions)
- [Appendix A: Core Addons and Ember CLI](#appendix-a-core-addons-and-ember-cli)
    - [Core addons](#core-addons)
    - [Ember CLI](#ember-cli)
- [Appendix B: Existing Implementations](#appendix-b-existing-implementations)

## Motivation

Ember and TypeScript have fundamentally different views on Semantic Versioning (SemVer).

Ember has a deep commitment to minimizing breaking changes in general, and to strictly following SemVer when breaking changes *are* made. (The use of lockstep versioning for Ember Data and Ember CLI complicates this commitment to a substantial degree, but that complication is outside the scope of this RFC.)

TypeScript explicitly *does not* follow SemVer. (TypeScript's core team argues that *every* change to the compiler is a breaking change, and that SemVer is therefore meaningless. We do not agree with this characterization, but are also uninterested in arguing it. This RFC takes the TypeScript team's position as a given.) Every TypeScript point release may be a breaking change, and "major" numbers for releases signify nothing beyond having reached `x.9` in the previous cycle. (At the time of drafting this sentence, the current latest TypeScript was 3.9; the next version released was 4.0.)

For TypeScript to be a first-class citizen of the Ember ecosystem, we need:

-   a policy defining what constitutes a breaking change for consumers of a library which publishes types
-   tooling to detect breaking changes in types -- whether from refactors, or from new TypeScript releases -- and to minimize the amount of churn from breaking changes in TypeScript
-   a general and widely-adopted policy for supported TypeScript versions

Once all three of those elements are adopted, end users will be able to have equally high confidence in the stability of addons' published types as they do in their runtime code.

This RFC ***should not*** be understood to propose *anything* about the core Ember addons (Ember and Ember Data) or Ember CLI: that would need to flow through the normal Ember RFC process. However, these same tools and patterns are necessary for core tools and libraries to begin publishing types, and this same strategy could be applied successfully there with minor modification. See [<b>Appendix: Core Addons and CLI</b>](#appendix-core-addons-and-ember-cli) for an overview of some possible future directions.

## Detailed design

TypeScript should be treated with exactly the same rigor as other elements of the Ember ecosystem, with the same level of commitment to stability, clear and accurate use of Semantic Versioning, testing, and clear policies about breaking changes.

TypeScript introduces two new concerns around breaking changes for addons which publish types.

1.  TypeScript does not adhere to the same norms around Semantic Versioning as the rest of the npm ecosystem, so it is important for addon authors to understand when TypeScript versions may introduce breaking changes without any other change made to the addon.

2.  The runtime behavior of the addon is no longer the only source of potentially-breaking changes: types may be as well. In a well-typed addon, runtime behavior and types should be well-aligned, but it is possible to introduce breaking changes to types without changing runtime behavior.

Accordingly, we must define breaking changes precisely and carefully.

### Background: TypeScript and Semantic Versioning

TypeScript ***does not*** adhere to Semantic Versioning, but since it participates in the npm ecosystem, it uses the same format for its version numbers: `<major>.<minor>.<patch>`. In Semantic Versioning, `<major>` would be a breaking change release, `<minor>` would be a backwards-compatible feature-addition release, and `<patch>` would be a "bug fix" release.

Both `<major>` and `<minor>` releases *may* introduce breaking changes of the sort that the npm ecosystem normally reserves for the `<major>` slot in the version number. Not all `<minor>` *or* `<major>` releases *do* introduce breaking changes in the normal Semantic Versioning sense, but either *may*. Accordingly, and for simplicity, the Ember ecosystem should treat *all* TypeScript `<major>.<minor>` releases as a major release.

TypeScript's use of patch releases is more in line with the rest of the ecosystem's use of patch versions. The TypeScript Wiki [currently summarizes patch releases][ts-patch-releases] as follows:

> Patch releases are periodically pushed out for any of the following:
>
> - High-priority regression fixes
> - Performance regression fixes
> - Safe fixes to the language service/editing experience
>
> These fixes are typically weighed against the cost (how hard it would be for the team to retroactively apply/release a change), the risk (how much code is changed, how understandable is the fix), as well as how feasible it would be to wait for the next version.

These three categories of fixes are well within the normally-understood range of fixes that belong in a "bug fix" release in the npm ecosystem. In these cases, a user's code may stop type-checking, but *only* if they were depending on buggy behavior. This matches users' expectations around runtime code: a SemVer patch release to a library which fixes a bug may cause apps or libraries which were depending on that bug to stop working.

By example:

-   `3.9.2` to `3.9.3`: always considered a bug fix
-   `3.9.3` to `4.0.0`: *may or may not* introduce breaking changes
-   `3.8.3` to `3.9.0`: *may or may not* introduce breaking changes

[ts-patch-releases]: https://github.com/microsoft/TypeScript/wiki/TypeScript's-Release-Process/e669ab1ad96edc1a7bcef5f6d9e35e24397891e5

### Defining breaking changes

When making a change to the types of the public interface, it is subject to the same constraints as runtime code: *breaking the public published types entails a breaking change.* Not all changes to published types are *breaking*, however: some changes will continue to allow user code to continue working without any issue, and some published types may constitute private API.

It is impossible to define the difference between breaking and non-breaking changes purely in the abstract. Instead, we must define exactly what changes are "backwards-compatible" and which are "breaking," and we must further define what constitutes a legitimate "bug fix" for type definitions designed to represent runtime behavior.

Accordingly, we propose the following specific definitions of breaking, non-breaking, and bug-fix changes for types in the Ember community. Because types are designed to represent runtime behavior, we assume throughout that these changes *do* in fact correctly represent changes to runtime behavior, and that changes which *incorrectly* represent runtime behavior are *bugs*.

#### Definitions

**Symbols:** There are two kinds of *symbols* in TypeScript: value symbols and type symbols. Value symbols are the symbols present in JavaScript: `let`, `const`, and `var` bindings; and `function` and `class` declarations. Type symbols are represented by type literal declarations, `interface` declarations, `type` (type alias) declarations, and `class` declarations.

**Functions:** "functions" always refers interchangeably to functions in standalone scope defined with either `function` or an arrow, class methods, and class constructors unless otherwise specified.

**Privacy:** No change to a type *documented as private* is a breaking change, whether or not the type is exported. *Documented as private* is defined in terms of the documentation norm of the package in question. Some packages may choose to specify that the public API consists of *documented* exports, in which case no published type may be considered public API unless it is in the documentation. Other packages may choose to say the reverse: all exports are public unless explicitly defined as private (for example with the `@private` JSDoc annotation, a note in the docs, etc.).

**User constructability:** exported types (interfaces, type aliases, and the type side of classes) may be defined by documentation to be user-constructable or *not*. For example, a library may choose to export an interface to allow users to name the type returned by a function, while specifying that the only legal way to construct such an interface is via the exported function: the type is *not* user-constructable. Alternatively, a library may export an interface or type alias explicitly for users to construct objects matching the type themselves: the type *is* user-constructable.

For best practices here, see also the discussion of [Matching exports to public API](#matching-exports-to-public-api).

#### Breaking changes

Each of the kinds of breaking changes defined below will trigger a compiler error for consumers, surfacing the error. As such, they should be easily detectable by testing infrastructure (see below under [Tooling: Detect breaking changes in types](#detect-breaking-changes-in-types)).

There are several reasons why breaking changes may occur:

-   The author of the addon may choose to change the API for whatever reason. This is no different than the situation today for addons which do not support TypeScript. This would be a major version independent of types.

-   The author of the addon may need to make changes to adapt to changes in Ember, for example to support Octane idioms. This is likewise identical with the situation for addons which do not support TypeScript: it would require a major version regardless.

-   Adopting a new version of TypeScript may change the meaning of existing types. For example, in TypeScript 3.5, generic types without a specified default type changed their default value from `{}` to `unknown`. This improved type safety, but [broke many existing types][3.5-breakage], including the internal types for Glimmer and Ember.

-   Adopting a new version of TypeScript may change the type definitions emitted in `.d.ts` files in backwards-incompatible ways. For example, changing to use the finalized ECMAScript spec for class fields meant that [types emitted by TypeScript 3.7 were incompatible with TypeScript 3.5 and earlier][3.7-emit-change].

[3.5-breakage]: https://github.com/microsoft/TypeScript/issues/33272
[3.7-emit-change]: https://github.com/microsoft/TypeScript/pull/33470

##### Symbols

Changing a symbol is a breaking change when:

-   changing the name of an exported symbol (type or value), since users' existing imports will need to be updated. This is a breaking for value exports (`let`, `const`, `class`, `function`) independent of types, but renaming exported `interface`, `type` alias, or `namespace` declarations is breaking as well.

-   removing an exported symbol, since users' existing imports will stop working. This is a breaking for value exports (`let`, `const`, `class`, `function`) independent of types, but removing exported `interface`, `type` alias, or `namespace` declarations is breaking as well.

    This includes changing a previously type-and-value export such as `export class` to either -- 
    
    -   a type-only export, since the export in the value namespace has been removed:

        ```diff
        -export class Foo {
        +class Foo {
          neato: string;
        }
        +
        +export type { Foo };
        ```
    
    -   a value-only export, since the export in the type namespace has been removed:

        ```diff
        -export class Foo {
        +class _Foo {
          neato: string;
        }
        +
        +export let Foo: typeof _Foo;
        ```

-   changing the kind (*value* vs. *type*) of an exported symbol in any way, since users' imports and own definitions may both be broken, since values and types are in different namespaces but may be imported together if they share a name:

    -   Given a *value*-only exported symbol, including `namespace` declarations, adding a *type* export with the same name as the *value* may break users' code: they may have imported the value and safely created a type of the same name. Their existing import will now cause a re-declaration conflict. Note that this is distinct from adding an entirely new type export where there was no type or value export previously, since the user could never accidentally introduce the conflict, and could work around the conflict using the `as` import specifier when introducing the import.

    -   Given a *type*-only exported symbol, including `type`, `interface`, or `export type` for a type or value, adding a *value* export with the same name may break users' code: they may have imported the type and safely created a value of the same name. Their existing import will now cause a re-declaration conflict. Note that this is distinct from adding an entirely new value export where there was no type or value export previously, since the user could never accidentally introduce the conflict, and could work around the conflict using the `as` import specifier when introducing the import.

-   changing an `interface` to a `type` alias will break any user code which used interface merging

-   changing a `namespace` export to any other type will break any code which used namespace merging

-   changing a `class` export to a type-only export will break any code which extended the class or constructed an instance of the class ([playground][class-to-type-only]), and changing a `class` export to a value-only export will break any code which referred to the class as a type ([playground][class-to-value-only])

[class-to-type-only]: https://www.typescriptlang.org/play?#code/PTAEEEDtQIgewE4EsDmTIEMA2NQBMBTAYywwQwBck5IAaUAdwAsCEDQKXGm4t2SMAZ0GMhoAgA8ADogoE8AOgBQhAW1ADhoAOpCAotNnzQAbwC+SpSFAAVJkhEOOXAgEcArkgBu2ApAqgcABmoBgcAJ5SBAC0NFjh4oYIAcGhGqTC9MxIREyMcO5YeKCQiAC22PFWYABG7AzIFHLQWEgA1uycDgBc1aB9AAZDfZoiuoIGMsnG5n2SUwEUkewmOvpJcsUW1kMDSqOgAPoAcnAUk0bFs0tRoKfnG8YAvEf3F9N4ANyWBwDK7jVRgAxRDvTaJZp4MbrBYzCx-AHAxBvR7FSSQkQo2FXCwqYikdRBdyQIhUGgcDAdQTjMHyAAUDBhl26awmqIAlCyvHAkF88Wp2ESSWToBRKQRBFjLgymR8WVKPpzQNzed99jRBAFGWzsaAXpACAxWbS8HT2d8iBqAqUHrr9Ya7mcTWbPkA

[class-to-value-only]: https://www.typescriptlang.org/play?#code/PTAEEEDtQIgewE4EsDmTIEMA2NQBMBTAYywwQwBck5IAaUAdwAsCEDQKXGm4t2SMAZ0GMhoAgA8ADogoE8AOgBQhAW1ADhoAOpCAotNnzQAbwC+SpSFAAVJkhEOOXAgEcArkgBu2ApAqgcABmoBigPljuBAC0NFgAnuKGCAHBoRqkwgqgAHKIALbYCaDxcO6MZVh4VmAMyHLOTgxInKAABpIyKaB8FG2g5JyszhjQbaqk6r1typoiAPp5FAZdcnimFhNk7L25cMvJawBcHPFSBGmL+ytGeADclnOgAMruAEZzAGKINynGknJIHgRLpBL81hslE9Xh9MoJvggluD-hJAcC9gdVsZzJYtuogu5IEQqDQOBgANYEQSg5F4AAUDH0h3kJxpzLwAEoTl44Eh7ipiJN2ASiSToBQKVSkeyGUysXgTtL5Vzwrz+VCaIIAoywezQABeUCQAgMHRy250jkPIiagKQa56w3G01Ki1WoA

##### Interfaces, Type Aliases, and Classes

Object types may be defined with interfaces, type aliases, or classes. Interfaces and type aliases define symbols only in the type namespace. Classes define symbols in both the type and value namespaces. The additional constraints for classes in the value namespace are covered above under [Breaking Changes: Symbols](#symbols).

A change to any object type (user constructable or not) is breaking when:

-   a non-`readonly` object property's type changes in any way:

    -   if it was previously `string` but now is `string | number`, some of the user's existing *reads* of the property will now be wrong ([playground][reads-of-property]). Note that this includes making a property optional.

    -   if it was previously `string | number` but now is `string`, some of the user's existing *writes* to the property will now be wrong ([playground][writes-to-property]). Note that this includes making a previously-optional property required. 

        Note that at present, TypeScript cannot actually catch all variants of this error. [This playground][writes-to-property] demonstrates that there is a runtime error but no *type* error in one scenario. TypeScript's type system understands these types in terms of *assignability*, rather than local *mutability*. However, addon authors should test for the catchable variant of this condition.

-   a property is removed from the type entirely, since some of the user's existing uses of the type will break, even if the property was optional ([optional][optional-removed], [required][required-removed])

A change to a user-constructable type is breaking when:

-   a required property is added to the type, since all of the user's existing constructions of the type will be incorrect ([new-required-property][required-added])

A change to a non-user-constructable object type is breaking when:

-   a `readonly` object property type becomes a *less specific ("wider") type*, for example if it was previously `string` but now is `string | string[]` -- since the user's existing handling of the property will be wrong in some cases ([playground][wider-property] -- the playground uses a class but an interface or type alias would have the same behavior).

    Note that this includes making a property optional, since these are equivalent for the purposes of type-checking:

    ```diff
    interface A {
    - a: string;
    + a?: string;
    }
    ```

    ```diff
    interface A {
    - a: string;
    + a: string | undefined;
    }
    ```

[reads-of-property]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgOrADYfQEwiZAbwFgAoZC5OALmQGcwpQBzAbjIF8yzRJZEUAEWA5c+ImUpVaDJiGbIAPshABXALYAjaO1JdSZGKpAIwwAPYEAFnBA4MEOuixiQACgBucDKoi1n2CL4AJS0alrQEuSUUBBgqlAEXj4QAHRwqQ7yYFa6+mR4CBhwscgOYMgA7piBeCD+Na66NnYOTo1B7tUuncG6BRBFJSjlyDgirrTCop3NtvaOAa5u4zN1fWRAA

[writes-to-property]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgOrADYYHJylAewHdkBvAWAChkbk4AuZAZzClAHNkAfZEAVwC2AI2gBuKgF8qVUJFiIUAEWAATXPmJkqtOo37Cxk6ZRh8QCMMAIhkRNpCYAVAuizrCRABQA3OBj4QjK44eB4AlFrUtL7+EAB0cMgAvMgA5AAWEFgEqeKUUpRUKhAIGHgoGBBgtpghGkRBte7EeXbADs7BzV5ETaHEYXlFJWVQFVXIKqrdjMpq-UR5U-P1CcnIAEQADgRgcGAEG6LIAPQnyPCYTFRtHS599Z7L3YOn50x8CEgQKkzI0IQQBACHwmBgAJ5UIA

[optional-removed]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgEIHU4GcDyAHMYAexDgBtkBvAWAChkHk4AuZAIyKLIjhAG46jdgH5WHLj350AvnTqhIsRClQAlCAFsiANwgATKoMYt2nbrwG1ZtOtzDISZAJ4BBVBBhEoEVhmz5CEnJkAF4qJlYwKABXFGlLO2RQBDJovX1Ud09vX0xcAmJSCjDKCOQo2IAadlZ4Miw4y1sIe0dXFxhFX3UtXQMSsorG5vtk1PS9VA6utB6dfVDwkyHqtlryBuR4oA

[required-removed]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgEIHU4GcBKECOArsFBACbIDeAsAFDIPJwBcyARgPYcA2EcIAbjqN2rTjz6C6AXzp1QkWIhSo8AWw4A3clWGMW7Lr35Das2nV5hkoBN0JlyqVBBgdSrDNjxESOgLxUTKxgUIQQADSiyPDcWCjSppYQ1rb2jmSoAIIwip7qWgFBBqHhUWyssfHIiUA

[required-added]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgEIRgeyig3gWAChkTk4AuZAI00wBsI4QBuIgXyKNElkRQEEYPZAWKkK1WgyasxJKpRABXALZVosjoSIg4KiAGcADnzQZsEAKpGAJnEgiipZAzDIEmEAbBQlCMMCelOhYOMgAvCJklD5KKGyanIS6+samgjzWdg6izq7unt6+-oEglBnQEVESsfGJhEA

[wider-property]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEkoGdnwPIwJYHMsDsoJ4BvAKHnjimAHt8IBPeABxlpZBgBdGAueMm7Z8OANxkAvmTKgkcRNFTwA6llD4QwUhSoga9Jq3ace-QcII54AHwsicAbQC6UmQDMArvjDcs9eAALKHxgCBBkTFwCIgA5WHYAdwAKADciTxABKLxCCABKAXxPAFsAIy4dSjhuTxh8eHSITIA6Ng4uXhbw0W5AiWlZcGgFcO54KGzsXKIJORGEMfgygTUNLQlg0PDI6ZiIeJgk5Kh8zZCwiJz9w+Oys7IgA

##### Functions

For functions which return or accept user-constructable types, the rules specified for [Breaking Changes: Interfaces, Type Aliases, and Classes](#interfaces-type-aliases-and-classes) hold. Otherwise, a change to the type of a function is breaking when:

-   an argument or return type changes entirely, for example if a function previously accepted `number` and now accepts `{ count: number }`, or previously returned `string` and now returns `boolean` -- since the user will have to change all call sites for the function ([playground][changed-type])

-   a function (including a class constructor or methods) argument *requires a more specific ("narrower") type*, for example if it previously accepted `string | number` but now requires `string` -- since the user will have to change some calls to the function ([playground][narrower-argument])

-   a function (including a class constructor or method) *returns a less specific ("wider") type*, for example if it previously returned `string` but now returns `string | null` -- since the user's existing handling of the return value will be wrong in some cases ([playground][wider-return]).

    This includes widening from a *type guard* to a more general check. For example:

    ```diff
    -function isString(x: string | number): x is string {
    +function isString(x: string): boolean {
      return typeof x === 'string';
    }
    ```

    This change would cause user-land code that expects narrowing to break:

    ```ts
    if (isString(value)) {
      return value.length;
    } else {
      return value;
    }
    ```

-   a function (including a class constructor or method) adds any new *required* arguments -- since all user invocations of the function will now be broken ([playground][new-required-argument])

-   a function (including a class constructor or method) removes an existing argument entirely -- since user invocations of the function may now fail to type-check

    -   if the argument was required, *all* invocations will fail to type-check ([playground][remove-required-argument])

    -   if the argument was optional, any invocations which used it will fail to type-check ([playground][remove-optional-argument])

-   changing a function from a `function` declaration to a an arrow function declaration, since it changes the type of `this` and the effect of calling `bind` or `call` on the function

[changed-type]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0NigkBqBbJyoAPKY8AjknGZyoMUubIj0OPChLPSMNNK2nPYAFIEE0HqIbJAARlgAlHoAbhrwgeFyDtGx8Ymo5JS0DKgAwviIloGFJaXlldUMdQ12yK3teub0GmW6oF29WKAOg6AjYxNTctm5SFwAdIdkPUqI0WgBGABMAGZ+hM1tANshAgDakDjk1TpCYeEgA

[narrower-argument]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEs9Iw00rac9gAUgQTQesLZiLCgAD7JbJAARlgAlHoAbhrwgeFyDtGx8YmoKdR0jKAA6jOSyIEFxSVlFVUMtfV2yC1tHThdsOOgUzNzCwpgQlig9BqxclkckguAA6c7IOpUBrNACMACYAMyjOaA3Kg8GQ6HXTwYbgaTzIuQ7WIoQJgmoQy6Na7wpFzYl7MkYqnNHHIPEE8JAA

[wider-return]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEWVrac9gAUAJR6wtmIsOFyDtGx8YmoKdR0jKAA6vCxKIEFxSVlFVWWNnbITS04bbCgAD7JbNyd3QpgQlig9Bqxcs6l5ZWI6NCIgZzIAErU+zj1AG4r65tGjNith2JgHn86sgAHSvdp4Q7RfDPV4fKhfepZHJILjQpa1BqNRqdZEvd6fTjfcaTZCBPE1FZNYlyIA

[new-required-argument]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwEo7ictgBuAKFCRYCFOmx54yAsCgYQwanQZNWAGngAjOqmQBbTSBgd4XHgP4QQGeFHgBeQiTJUA5ARwY5OV2wFWbTQcpGTkFSndPb19eIA

[remove-required-argument]: https://www.typescriptlang.org/play/?ssl=2&ssc=35&pln=2&pc=47#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwBp4AjO1ZAW04gYASjrEcWYAG4AUKEiwEKdNjzxkBYFAwhg1OgyatR8cZNkyIIDPCjwAvIRJkqAcgI4M2nK44BGACZhWSsbTgd1TW1dSndPb194QOCgA

[remove-optional-argument]: https://www.typescriptlang.org/play?#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwBp4AjAfjtWQC2nEDACUdYjizAA3AChQkWAhTpseeMgLAoGEMGp0GTVuPiTp8uRBAZ4UeAF5CJMlQDkBHBl053HAEYAJlF5GztOJ01tXX1KT29ff3hg0OtbeDAoohBSHAp4rx8MPzTw+GAorR09AwTi0vkgA

#### Non-breaking changes

In each of these cases, some user code becomes *superfluous*, but it neither fails to type-check nor causes any runtime errors.

##### Symbols

A change to an exported symbol is *not* breaking when:

-   a wholly new symbol is exported which was not previously exported and which does not share a name with another symbol of a different kind (type vs. value) with a symbol which was previously exported

##### Interfaces, Type Aliases, and Classes

A change to any type (user-constructable or not) is *not* breaking when:

-   a new optional property is added to the type, since all existing code will continue working ([playground][new-optional-prop])

Any change to a non-user-constructable type is *not* breaking when:

-   a `readonly` object property on the type becomes a *more specific ("narrower") type*, for example if it was previously `string | string[]` and now is always `string[]` -- since all user code will continue working and type-checking ([playground][narrower-property]). Note that this includes a previously-optional property becoming required.

-   a new required property is added to the object -- since its presence does not require the consuming code to use the property at a type level ([playground][new-required-prop])

[new-optional-prop]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgPJWAc1HANsgbwFgAoZc5OALmQGcwMRMBuUgX1NNElkRQFUADgBM4kYYVIVKNeoxZSKAIwD8NEAFcAtkuisSHEqWEQEuOFBQwNIBGGAB7EMktgNUELXRYcuABQAlDTe2CB4+iZmFlY2do7Oru6eQqLigTQpYhDC+sam5pbI1rb2TshgcADWEF4YoXh+AB7Bdb5ByABuDsA5eVGFxXFlFdW0mWnNyOPZ7V09uSRhWjWCfMgAQhAwDpbTkmQUAPSHyAhOchpDIIrkuBBgMmitYfgAvISPAEQAFhC4uA5Psg2AtpMcXPcktlkEoAJ7IXDAJRQCywm4I+4wlo+F7Id6JDy1HENAKgo4nBB4cxKYCIsBog7kEY1EK+PxwUno5lE+r+AhfX7-QHAgLsTiLODLWirJDIACCMB4e2IjOQ4LOngYl1K11Vdwe1CmIiyEne-MNPz+AKBIPFYJOBJA0LhCKRKKgDOk+qxT2JbwhbkJ02EgTJ5HVVLgNLpnoo3NZL3ZnNV3ODSf00njzwaSmTmaqNTTuYzcYLY2NaXNNEtQptooMpCAA

[narrower-property]: https://www.typescriptlang.org/play?#code/CYUwxgNghgTiAEkoGdnwPIwJYHMsDsoJ4BvAKHngAcYB7KkGAFwE8AueZJ7fHeAH07cCOANoBdANxkAvmTKgkcRNFTwAcrDoB3EMFIVqdBs3ZCeOWfIBmAV3xgmWWvngALKPmAQQyTLgIiTRgdAAoANyJbEA5-PEIIAEoOfFsAWwAjRgNKOCZbGFdIiGiAOhp6RlZSn14mN2k5BXBoZR8meChY7HiiaUVWhHb4DI5gnT1pDy8fPx7AiHHabVCoRKnPb184haWVjPWyIA

[new-required-prop]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgPJWAc1HANsgbwFgAoZc5OALmQGcwMRMBuUgX1NNElkRQFUADgBM4kYYVIVKNeoxZSKAIxogArgFsl0ViQ4lSwiAlxwoKGGpAIwwAPYhk5sGqgha6LDlwAKAJQ0ntggeLpGJmYWVjb2js6u7kKi4v40SWIQwrqGxqbmyJbWtg7IYHAA1hAeGMF4PgAegTXeAcgAbnbAWTkR+YUxJWWVtOkpjcijma0dXdkkIRpVgnzIAEIQMHbmk5JkFAD0+04QLm6ZyEoAnsi4wEpQZpeK5LgnMmjNIfgAvMen7kFvP5dNJXmBkKAYNBzBJfvE3NUvF9gZw9uRDsgEHhTEpgLcwNcAO7AMAACz+CUyz1KFSqgORcD8IIoQzpnzqkOhU10+lICyWKwAgjAeDtiGjkBj4SBzlcbncHlAnhKMQBhUlwJigTClUkoYAaQRbcHAWiYrbmGwXYxwNS0fWOMkocx4drQWixZB2GC600AGmpGMudjUyEJIdwEm0yGEnSYyAABgajVBwQRkABlOyLACS4Gg8CQyDYBSg2eQAHJaNmIABaW73R4V5gJgMqo6aiRO5BqEQZCTcAsrcNqSPIDVtFDd2hwRbIfl+uh2XUoCD1QS3BAkwMd2gezAgRbgMMRiT0PH4ZZ75A+OBmteCYziPzIABUndfNwyUB79ohIB3c183qMAzUJUlgAQclzAARzUYB8m7QQy0fVMiVPShcGra1fzgJRXjDElSRDMBAI0OxhGAGBILEWJqTBd5JlhCkESY4FJSOc9cHwO99xCfCIHot5OSgGFkDhE4EhGPsUiZVFpAxLFuLwvESSJIiWJlYRqVZRFal8RlmXIXT6Q5EAoVE7kdNpaTkkyW85IlXS2JEmFHP0IA

##### Functions

-   a function (including a class method or constructor) *accepts a less specific ("wider") type*, for example if it previously accepted only a `boolean` but now accepts `boolean | undefined` -- since all existing user code will continue working and type-checking ([playground][wider-argument])

-   a function (including a class method) which *returns a more specific ("narrower") type*, for example if it previously returned `number | undefined` and now always returns `number` -- since all user code will continue working and type-checking ([playground][narrower-return])

-   a function (including a class constructor or method) makes a previously-required argument optional -- since all existing user code will continue to work with it ([playground][optional-argument])

-   changing a function from an arrow function declaration to `function` declaration, since it allows the caller to use `bind` or `call` meaningfully where they could not before

[wider-argument]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEs9Iw00rac9gAUgQTQegBGGhqcyNCIAJR6AG4a8IHhcg7RsfGJqCnUdIygAOrjksiBBcUlZRVVDLX1dsgtbZ3dvf2gAD6gpbHOSFtDoKPjk9MKYEJYoPQNLE5FkckguAA6I7IOpUBrNHCYewDSag3KQ6Gw+FnZxcCQouTrWIoQJQmowk6NM6I5GTImbUmYynNXGcfHhIA

[narrower-return]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEWVrac9gAUAJR6wtmIsKAAPsls3OFyDtGx8YmoKdR0jKAAcoluAO7IgQXFJWUVVZY2dshNLThtsP2DCmBCWKD0GrFyzqXllYjo0IiBnMgAStS9OPUAbjt9ocuj1uM0epAAEYXUyFYrYdiYJ4AurIAD8ADp3u08KA0WjQAAGY7RfCvd5fKg-epZHJILgYra1BqNRr9MlvT7fTi-WaYBZLRk1HZNNlyIA

[optional-argument]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwBp4AjO1ZAW04gYASjrEcWYAG4AUKEiwEKdNjzxkBYFAwhg1OgyasOnAPw9+gkWInSZMiCAzwo8ALyESZKgHICODG0cHw4ARgAmYVlHZ053dU1tXUo-AKCQ+AiooA

#### Bug fixes

As with runtime code, types may have bugs. We define a ‘bug' here as a mismatch between types and runtime code. That is: if the types allow code which will cause a runtime type error, or if they forbid code which is allowed at runtime, the types are buggy. Types may be buggy by being inappropriately *wider* or *narrower* than runtime.

For example (noting that this list is illustrative, not exhaustive):

-   If a function is typed as accepting `any` but actually requires a `string`, this will cause an error at runtime, and is a bug.

-   If a function is typed as returning `string | number` but always returns `string`, this is a bug. It will not cause an error at runtime, since consumers must "narrow" the type to use it, and narrowing the type would not even be a breaking change. However, the type is incorrect, and it *will* require end users to do unnecessary work.

-   If an interface is defined as having a property which is *not* part of the public API of the runtime object, or if an interface is defined as *missing* a a property which the public API of the runtime object does have, this is a bug.

As with runtime bugs, authors are free to fix type bugs in a patch release. As with runtime code, this may break consumers who were relying on the buggy behavior. However, as with runtime bugs, this is well-understood to be part of the sociotechnical contract of semantic versioning.

In practice, this suggests two key considerations around type bugs:

1.  It is essential that types be well-tested! See discussion below under [**Tooling**](#tooling).

2.  If a given types bug has existed for long enough, an author may choose to treat it as ["intimate API"][intimate] and change the *runtime* behavior to match the types rather than vice versa.

[intimate]: https://twitter.com/wycats/status/918644693759488005

#### Dropping support for previously-supported versions

Additionally, once a TypeScript version has been added to an addon's list of supported versions, dropping it constitutes a breaking change, because it has the same kind of impact on users of the addon as dropping support for a version of Ember, Ember CLI, or Node. Whatever the reason for dropping a previously-supported TypeScript release, addons should publish a new major version.

However, bug fix/patch releases to TypeScript (as described above under [Bug fixes](#bug-fixes)) qualify for bug fix releases for libraries. For example, if a library initially publishes support for TypeScript 4.5.0, but a critical bug is discovered and fixed in 4.5.1, the library may drop support for 4.5.0. Dropping support does not require publishing a new release, only documenting the change.

### Tooling

To successfully use TypeScript, we need to be able to *detect* breaking changes (whether from our own changes or from TypeScript itself) and to *mitigate* them.

#### Detect breaking changes in types

As with runtime code, it is essential to prevent unintentional changes to the API of types supplied by an addon. We can accomplish this using *type tests*: tests which assert that the types exposed by the public API of the addon are stable.

Addon authors publishing types can use whatever tools they find easiest to use and integrate, within the constraint that the tools must be capable of catching all the kinds of breaking changes outlined above. Additionally, they must be able to run against multiple supported versions of TypeScript, so that users can detect and account for breaking changes in TypeScript.

The current options include:

-   [`dtslint`][dtslint] -- used to support the DefinitelyTyped ecosystem, so it is well-tested and fairly robust. It uses the TypeScript compiler API directly, and is maintained by the TypeScript team directly. Accordingly, it is very unlikely to stop working against the versions of TypeScript it supports. However, there are several significant downsides as well:

    -   The tool checks against string representations of types, which makes it relatively fragile: it can be disturbed by changes to the representation of a type, even when those changes would not impact type-checking.

    -   As its name suggests, it is currently powered by [tslint][tslint], which is deprecated in favor of [eslint][eslint]. While there is [initial interest][eslint-migration] in migrating to eslint, there is no active effort to accomplish this task.

    -   The developer experience of authoring assertions with dtslint is poor, with no editor-powered feedback or indication of whether you've actually written the test correctly at all. For example, if a user types `ExpectType` instead of `$ExpectType`, the assertion will simply be silently ignored.

- [`tsd`][tsd] -- a full solution for testing types by writing `.test-d.ts` files with a small family of assertions and using the `tsd` command to validate all `.test-d.ts` files. Authoring has robust editor integration, since the type assertions are normal TS imports, and the type assertions are specific enough to catch all the kinds of breakage identified above. It is implemented using the TS compiler version directly, which makes its assertions fairly robust. Risks and downsides:

    -   The tool uses a patched version of the TypeScript compiler, which increases the risk of errors and the risk that at some points it will simply be unable to support a new version of TypeScript.

    -   Because the assertions are implemented as type definitions, the library is subject to the same risk of compiler breakage as the types it is testing.

    -   **BLOCKER:**  currently only supports a single version of TypeScript at a time. While the author is [interested][tsd-versions] in supporting multiple versions, it is not currently possible.

- [`expect-type`][expect-type] -- a library with a variety of type assertions, inspired by Jest's matchers but tailored to types and with no runtime implementation. Like `tsd`, it is implemented as a series of function types which can be imported, and accordingly it has excellent editor integration. However, unlike `tsd`, it does *not* use the compiler API. Instead,  It is robust enough to catch all the varieties of breaking type changes. The risks with expect-type are:

    -   It currently has a single maintainer, and relatively few users.

    -   It is relatively young, having been created only about a year ago, and therefore having existed for only 5 TypeScript releases. While its track record is good so far, there is not yet evidence of how it would deal with serious breaking changes like those introduce in TypeScript 3.5.

    -   BBecause the assertions are implemented as type definitions, the library is subject to the same risk of compiler breakage as the types it is testing.

At present, `expect-type` seems to be the best option, and several libraries in the Ember ecosystem are already using `expect-type`. However, for the purposes of *this* RFC, we do not make a specific recommendation about which library to use. The tradeoffs above are offered to help authors make an informed choice in this space, and can be integrated into documentation is this RFC is accepted. Future Ember or Typed Ember RFCs may specify a default to be installed with Ember apps and addons generated in TypeScript.

Users should add one of these libraries and generate a set of tests corresponding to their public API. These tests should be written is such a way as to test the imported API as consumers will consume the library. For example, type tests should not import using relative paths, but using the absolute paths at which the types should resolve, just as consumers would. 

These type tests should be specific and precise. It is important, for example, to guarantee that an API element never *accidentally* becomes `any`, thereby making many things allowable which should not be in the case of function arguments, and "infecting" the caller's code by eliminating type safety on the result in the case of function return values. For example, the `expect-type` library's `.toEqualTypeOf` assertion is robust against precisely this scenario; addon authors are also encouraged to use its `.not` modifier and `.toBeAny()` method where appropriate to prevent this failure mode.

To be safe, these tests should be placed in a directory which does not emit runtime code -- either colocated with the library's runtime tests, or in a dedicated `type-tests` directory. Additionally, type tests should *never* export any code.

[dtslint]: https://github.com/microsoft/dtslint
[tslint]: https://github.com/palantir/tslint
[eslint]: https://github.com/eslint/eslint
[eslint-migration]: https://github.com/microsoft/dtslint/issues/300
[tsd]: https://github.com/SamVerschueren/tsd
[tsd-versions]: https://github.com/SamVerschueren/tsd/issues/47
[expect-type]: https://github.com/mmkal/ts/tree/master/packages/expect-type#readme

In addition to *writing* these tests, addon authors should make sure to run the tests (as appropriate to the testing tool chosen) in their continuous integration configuration, so that any changes made to the library are validated to make sure the API has not been changed accidentally.

Further, just as addons are encouraged to test against all a matrix of Ember versions which includes the current stable release, the currently active Ember LTS release, and the canary and beta releases, addons should test the types against all versions of TypeScript supported by the addon (see the [suggested policy for version support](#policy-for-supported-typescript-versions) below) as well as the upcoming version (the `next` tag for the `typescript` package on npm).

Type tests can run as normal [ember-try] variations. Typed Ember will document a conventional setup for ember-try configurations, so that correct integration into CI setups will be straightforward for addon authors.

[ember-try]: https://github.com/ember-cli/ember-try

#### Mitigate breaking changes

It is insufficient merely to be *aware* of breaking changes. It is also important to *mitigate* them, to minimize churn and breakage for addon users.

The specific mechanics of mitigating churn are left to library authors. Accordingly, the following four sections are non-normative.

##### Avoiding user constructability

For types where it is useful to publish an interface for end users, but where users should not construct the interface themselves, authors have a number of options (noting that this list is not exhaustive):

-   The type can simply be documented as non-user-constructable. This is the easiest, and allows an escape hatch for scenarios like testing, where users will recognize that if the public interface changes, they will necessarily need to update their test mocks to match. This can further be mitigated by providing a sanctioned test helper to construct test versions of the types.

-   Export a nominal-like version of the type, using `export type` with a class with a private field:

    ```ts
    class Person {
      // 1.  The private brand means this cannot be constructed other than the
      //     class's own constructor, because other approaches cannot add the
      //     private field. Even if you write a class yourself with a matching
      //     private field, TS will treat them as distinct.
      // 2.  Using `declare` means this marker has no runtime over head: it will
      //     not be emitted by TypeScript or Babel.
      // 3.  Because the class itself is declared but not exported, the only way
      //     to construct it is using the function exported lower in the module.
      declare private __brand: '_Person';

      name: string;
      age: number;

      constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
      }
    }

    // This exports only the *type* side of `Person`, not the *value* side, so
    // users can neither call `new Person(...)` nor subclass it. Per the note
    // above, they also cannot *implement* their own version of `Person`, since
    // they do not have the ability to add the private field.
    export type { Person };

    // This is the controlled way of building a person: users can only get a
    // `Person` by calling this function, even though they can *name* the type
    // by doing `import type { Person} from '...';`.
    export function buildPerson(name: string, age: number): Person {
      return new Person(name, age);
    }
    ```

    This *cannot* be constructed outside the module. Note that it may be useful to provide corresponding test helpers for scenarios like this, since users cannot safely provide their own mocks.

-   Document that users can create their own local aliases for these types, while *not* exporting the types in a public way. This has one of the same upsides as the use of the classs with a private brand: the type is not constructable other than via the module. It also shares the upside of being able to create your own instance of it for test code. However, it has ergonomic downsides, requiring the use of the `ReturnType` utility class and requiring all consumers to generate that utility type for themselves.

Each of these leaves this module in control of the construction of `Person`s, which allows more flexibility for evolving the API, since non-user-constructable types are subject to fewer breaking change constraints that user-constructable types. Whichever is chosen for a given type, authors should document it clearly.

##### Updating types to maintain compatibility

Sometimes, it is possible when TypeScript makes a breaking change to update the types so they are backwards compatible, without impacting consumers at all. For example, [TypeScript 3.5][3.5-breakage] changed the default resolution of an otherwise-unspecified generic type from the empty object `{}` to `unknown`. This change was an improvement in the robustness of the type system, but it meant that any code which happened to rely on the previous behavior broke.

This example from [Google's writeup on the TS 3.5 changes][3.5-breakage] illustrates the point. Given this function:

```ts
function dontCarePromise() {
  return new Promise((resolve) => {
    resolve();
  });
}
```

In TypeScript versions before 3.5, the return type of this function was inferred to be `Promise<{}>`. From 3.5 forward, it became `Promise<unknown>`. If a user ever wrote down this type somewhere, like so:

```ts
const myPromise: Promise<{}> = dontCarePromise();
```

…then it broke on TS 3.5, with the compiler reporting an error ([playground][3.5-breakage-plaground]):

> Type 'Promise<unknown>' is not assignable to type 'Promise<{}>'.
>   Type 'unknown' is not assignable to type '{}'.

This change could be mitigated by supplying a default type argument equal to the original value ([playground][3.5-mitigation-playground]):

```ts
function dontCarePromise(): Promise<{}> {
  return new Promise((resolve) => {
    resolve();
  });
}
```

This is a totally-backwards compatible bugfix-style change, and should be released in a bugfix/point release. Users can then just upgrade to the bugfix release *before* upgrading their own TypeScript version -- and will experience *zero* impact from the breaking TypeScript change.

Later, the default type argument `Promise<{}>` could be dropped and defaulted to the new value for a major release of the library when desired (per the policy [outlined below](#policy-for-supported-type-script-versions), giving it the new semantics. (Also see [<b>Opt-in future types</b>](#opt-in-future-types) below for a means to allow users to *opt in* to these changes before the major version.)

[3.3-pre-breakage-playground]: https://www.typescriptlang.org/play/?ts=3.3.3&ssl=1&ssc=27&pln=1&pc=40#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlIgN4CwAUIonlCNkmLgO6KES5KpTxk4AGwBuuWgF4AfPWatWYyTJoBuFYgC+1HUz3NmEBGSiJiAT0GkKALgFEHuADx09SuSjRY8e2FtIA
[3.5-breakage-plaground]: https://www.typescriptlang.org/play/?ts=3.5.1&ssl=1&ssc=27&pln=1&pc=40#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlIgN4CwAUIonlCNkmLgO6KES5KpTxk4AGwBuuWgF4AfPWatWYyTJoBuFYgC+1HUz3NmEBGSiJiAT0GkKALgFEHuADx09SuSjRY8e2FtIA
[3.5-mitigation-playground]: https://www.typescriptlang.org/play/?ts=3.5.1#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlAFyKEnm4A8A3gL4B8ibAsAChEiPFBDYkYXAHcGRUhUqU8ZOABsAbrmqIAvD35DhI3Ks1VqAbkHCOVwR0GCICMlETEAnowW56P5nZuPRQ0LDwAxSsgA

##### "Downleveling" types

When a new version of TypeScript results in backwards-incompatible *emit* to to the type definitions, as they did in [3.7][3.7-emit-change], the strategy of changing the types directly may not work. However, it is still possible to provide backwards-compatible types, using the combination of [downlevel-dts] and [typesVersions]. (In some cases, this may also require some manual tweaking of types, but this should be rare for most addons.)

- The [`downlevel-dts`][downlevel-dts] tool allows you to take a `.d.ts` file which is not valid for an earlier version of TypeScript (e.g. the changes to class field emit mentioned in [<b>Breaking Changes</b>](#breaking-changes)), and emit a version which *is* compatible with that version. It supports targeting all TypeScript versions later than 3.4.

- TypeScript supports using the [`typesVersions`][typesVersions] key in a `package.json` file to specify a specific set of type definitions (which may consist of one or more `.d.ts` files) which correspond to a specific TypeScript version.

[downlevel-dts]: https://github.com/sandersn/downlevel-dts
[typesVersions]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#version-selection-with-typesversions

The recommended flow would be as follows:

1.  Add `downlevel-dts`, `npm-run-all`, and `rimraf`  to your dev dependencies:

    ```sh
    npm install --save-dev downlevel-dts npm-run-all rimraf
    ```
    
    or 
    
    ```sh
    yarn add --dev downlevel-dts npm-run-all rimraf
    ```

2.  Create a script to downlevel the types to all supported TypeScript versions:

    ```sh
    # scripts/downlevel.sh
    npm run downlevel-dts . --to 3.7 ts3.7
    npm run downlevel-dts . --to 3.8 ts3.8
    npm run downlevel-dts . --to 3.9 ts3.9
    npm run downlevel-dts . --to 4.0 ts4.0
    ```

3.  Update the `scripts` key in `package.json`  to generate downleveled types generated by running `downlevel-dts` on the output of `ember-cli-typescript`'s  `ts:precompile` command, and to clean up the results after publication:

    ```diff
    {
      "scripts": {
    -   "prepublishOnly": "ember ts:precompile",
    +   "prepublish:types": "ember ts:precompile",
    +   "prepublish:downlevel": "./scripts/downlevel.sh",
    +   "prepublishOnly": "run-s prepublish:types prepublish:downlevel",
    -   "postpublish": "ember ts:clean",
    +   "clean:ts": "ember ts:clean",
    +   "clean:downlevel": "rimraf ./ts3.7 ./ts3.8 ./ts3.9 ./ts4.0",
    +   "clean": "npm-run-all --aggregate-output --parallel clean:*",
    +   "postpublish": "npm run clean",
      }
    }
    ```

4.  Add a `typesVersions` key to `package.json`, with the following contents:

    ```json
    {
      "types": "index.d.ts",
      "typesVersions": {
        "3.7": { "*": ["ts3.7/*"] },
        "3.8": { "*": ["ts3.8/*"] },
        "3.9": { "*": ["ts3.9/*"] },
        "4.0": { "*": ["ts4.0/*"] },
      }
    }
    ```

    This will tell TypeScript how to use the types generated during `ember ts:precompile`. Note that we explicitly include the `types` key so TypeScript will fall back to the defaults for 3.9 and higher.

5.  If using the `files` key in `package.json` to specify files to include (unusual but not impossible for TypeScript-authored addons), add each of the output directories (`ts3.7`, `ts3.8`, `ts3.9`, `ts4.0`) to the list of entries.

Now consumers using older versions of TypeScript will be buffered from the breaking changes in type definition emit.

If the community adopts this practice broadly we will want to invest in tooling to automate support for managing dependencies, downleveling, and type tests. However, the core constraints of this RFC do not depend on such tooling existing, and the exact requirements of those tools will emerge organically as the community begins implementing this RFC's recommendations.

##### Opt-in future types

In the case of significant breaking changes to *only* the types -- whether because the addon author wants to make a change, or because of TypeScript version changes -- addons may supply *future* types, which users may opt into *before* the library ships a breaking change. (We expect this use case will be rare, but important.)

In this case, addon authors will need to *hand-author* the types for the future version of the types, and supply them at a specific location which users can then import directly in their `types/my-app.d.ts` file -- which will override the normal types location, while not requiring the user to modify the `paths` key in their `tsconfig.json`.

This approach is a variant on [**Updating types to maintain compatibility**](#updating-types-to-maintain-compatibility). Using that same example, an addon author who wanted to provide opt-in future types instead (or in addition) would follow this procedure:

1.  Backwards-compatibly *fix* the types by explicitly setting the return type on `dontCarePromise`, just as discussed above:

    ```diff
    - function dontCarePromise() {
    + function dontCarePromise(): Promise<{}> {
    ```

2.  Create a new directory, named something like `ts3.5`.

3.  Generate the type definition files for the addon by running `ember ts:precompile`.

4.  Manually move the generated type definition files into `ts3.5`.

5.  In the `ts3.5` directory, either *remove* or *change* the explicit return type, so that the default from TypeScript 3.5 is restored:

    ```diff
    - function dontCarePromise(): Promise<{}> {
    + function dontCarePromise(): Promise<unknown> {
    ```

6.  Wrap each module file in the generated definition with a `declare module` specifying the *canonical* module name. For example, if our `dontCarePromise` definition were from a module at `my-library/sub-package`, we would have the following structure:

    ```
    my-library/
      ts3.5/
        index.d.ts
        sub-package.d.ts
    ```

     -- and the contents of `sub-package.d.ts` would be:
    
    ```ts
    declare module 'my-library/sub-package' {
      export function dontCarePromise(): Promise<unknown>;
    }
    ```

7.  Explicitly include each such sub-module in the import graph available from `ts3.5/index.d.ts` -- either via direct import in that file or via imports in the other modules. (Note that these imports can simply be of the form `import 'some-module';`, rather than importing specific types or values from the modules.)

7.  Commit the `ts3.5` directory, since it now needs to be maintained manually until a breaking change of the library is released which opts into the new behavior.

8.  Cut a release which includes the new fixes. With that release:

    -   Inform users about the incoming breaking change.

    -   Tell users to add `import 'fancy-addon/ts3.5';` to the top of their app's `types/my-app.d.ts` or `types/my-addon.d.ts` file (which is generated by `ember-cli-typescript`'s post-install blueprint).

9.  At a later point, cut a breaking change which opts into the TypeScript 3.5 behavior.

    -   Remove the `ts3.5` directory from the repository.

    -   Note in the release notes that users who did not previously opt into the changes will need to do so now.

    -   Note in the release notes that users who *did* previously opt into the changes should remove the `import 'fancy-addon/ts3.5';` import from `types/my-app.d.ts` or `types/my-addon.d.ts`.

#### Matching exports to public API

<!-- TODO: write this and describe use of API extractor as possible but not _normative_ -->

### Policy for supported TypeScript versions

TypeScript and Ember both have regular cadences for release:

- Ember releases every six weeks, with new Long-Term Support (LTS) releases every 24 weeks (that is, every 4 releases).
- TypeScript releases roughly quarterly. There are no LTS releases for TypeScript.

These map reasonably well to each other, and this correspondence provides a helpful basis for recommending a version support policy.

Addons should generally support the TypeScript versions current during the lifetime of the Ember LTS versions they support. As noted above, dropping a supported TypeScript version is a breaking change, and it is helpful to minimize the number of major versions of an addon in use.

#### Supporting new versions

The Typed Ember team shall normally make a recommendation within a week of the release of a new TypeScript version whether it should be adopted as a supported version by the community.

Some TypeScript releases have bugs which last throughout the life of the release and are fixed only in the following release. This is not uncommon; the same is true of ember-source and ember-data. Critically, however, the role played by TypeScript in the development pipeline means that users -- including addon authors -- can safely wait for later releases. This is not *common*, but has happened enough times in recent TypeScript history (including 2.9–3.1, 3.5, and 3.8) that a recommended support matrix will minimize churn and pain in the ecosystem.

Addon authors should *prefer* to follow guidance from the Typed Ember team about supported TypeScript versions. Addon authors *may* opt into supporting non-recommended versions, but the Typed Ember team will not commit to helping support TypeScript issues and bugs for addons which do so. (See [<b>Documenting supported versions</b>](#documenting-supported-versions) below.)

Adding a new supported version does *not* require an addon to create a new release, though it should be added to addons' test suites and their  documentation about supported versions.

#### Dropping TypeScript versions

As discussed above in [Changes to types: Dropping support for previously-supported versions](#dropping-support-for-previously-supported-versions), dropping support for previously-supported versions of TypeScript is always a breaking change and therefore requires releasing a major version. Given the constraints of Ember CLI's version resolution today (where only one major version will be resolved successfully), addon authors should prefer to drop older supported TypeScript versions relatively infrequently. Optimally, addon authors should drop TypeScript versions at the same time as they are already making *other* breaking changes of a similar sort, like dropping support for Node or Ember versions when their LTS period ends.

#### Documenting supported versions

Addons should document their currently supported TypeScript versions in their README. Typed Ember shall maintain a standard badge for addon authors to use with the currently-recommended versions listed in the ember-cli-typescript repo (likely in the README):

An example badge might look like this:

[![supported TS versions: 3.6, 3.7 and 3.9](https://img.shields.io/badge/TypeScript-3.6%20%7C%203.7%20%7C%203.9-blue)](https://github.com/typed-ember/ember-cli-typescript)

### Summary

-   Adding a new TypeScript version to the support matrix *may* cause breaking changes (as verified by type tests). When it does not, adding it is a normal minor release. When it *does*, it should be [mitigated](#mitigate-breaking-changes) *or* should be a breaking change for the addon.
-   Removing a TypeScript version from the support matrix is a breaking change.
-   Addons should normally support all TypeScript versions released during the current Ember LTS, and drop support for them only when they drop support for that Ember LTS, to minimize the number of major versions in the ecosystem.
-   Supported versions shall be documented by Typed Ember in both human-friendly and programmatically-useable ways, and should be documented by addons.

## How we teach this

There are three new concepts for the Ember/TypeScript ecosystem:

- **recommended TypeScript versions:** the versions of TypeScript which the Typed Ember team recommends addons use
- **supported TypeScript versions:** the versions of TypeScript any given addon supports
- **type tests:** assertions about the *types* exported by an addon, to be verified in CI

These should be explained in a new section of the ember-cli-typescript docs dedicated to addons. The same new section should also explain how addons should opt into the policies and tooling recommended in this RFC:

-   writing type tests
-   configuring `ember-try` to verify the type tests
-   making the addon's semantic versioning commitments clear by linking to a tagged version of Typed Ember's `SEMVER.md`, and how to describe any modifications from that policy
-   publicizing the addon's supported versions of TypeScript
-   the currently-recommended versions of TypeScript, along with a standard badge

Finally, Typed Ember will publish a new document in its own repo: `SEMVER.md`, tagged so it can be referenced by direct stable link from addon repositories -- with the same set of rules as documented in this document.

## Drawbacks

-   Adding type tests and infrastructure may slow the development of any given feature. We believe that is more than made up for by the resulting stability of the code, just as with runtime tests -- but there is a real cost in time spent nonetheless.

-   The current version of `downlevel-dts` generates output in a way that could cause regressions in strictness for previously-published versions. This means that when we upgrade an addon to a new version of TypeScript, we will *sometimes* be shipping types to consumers which are *less* useful and catch *fewer* errors than they did previously. This is a real, if small, concern for the viability of the current proposal. See below for discussion on alternatives to the use of `downlevel-dts`. Notably, however, these regressions would *never* cause code that compiles to stop compiling -- only allow some code to compile that *should not* and previously *did not*.

-   The policy proposed here *may* at times mean uptake of new TypeScript features is slower than it would otherwise be, in order to support versions for the lifetime of Ember LTS releases. While in most cases, the mitigations suggested here will make this less of a problem, it *may* be an issue at times given the current limitations of `downlevel-dts`.

## Alternatives

### No policy

Other frameworks do not currently have any specific support policy. Nor do most TypeScript libraries. Instead, they just roughly track latest and expect downstream consumers of the types to eat the cost of changes. This strategy *could* work if libraries were honest about the SemVer implications of this and cut major releases any time a new TypeScript version resulted in breaking changes. Notably, the Ember TypeScript ecosystem has largely operated in this mode to date, and it has worked all right so far.

However, there are three major problems with this approach.

-   First, it does not scale well. While many apps and a few addons are using TypeScript today, as the community of TypeScript users grows and especially as it increasingly includes addons used extensively throughout the community (e.g. [ember-modifier]), the cost of breaking changes will be magnified greatly.

-   Second, and closely related, the more central an addon is to the ecosystem, the worse the impact is -- especially when combined with the fact that Ember CLI will only resolve a single major version of an addon. Without a mitigation strategy, core addons like ember-modifier could easily end up fragmenting the ecosystem.

-   Third, in the absence of a specific policy, each addon would end up developing its own _ad hoc_ support policy (as has been the case today). The Ember community highly values shared solutions and stability -- preferring to avoid churn and risk through policies such as the one outlined in this RFC. Accordingly, a policy which aligns TypeScript support with existing community norms around supported versions would make TypeScript adoption more palatable both at the community level in general and specifically to large/enterprise engineering organizations with a lower appetite for risk.

[ember-modifier]: https://github.com/ember-modifier/ember-modifier

### Decouple TypeScript support from Ember's LTS cycle

This is a perfectly reasonable decision, and in fact some addons may choose to take it. However, it comes with the previously mentioned challenges when multiple major versions of an addon exist in the Ember ecosystem. While a strategy for resolving those challenges at the ecosystem level would be nice, it is far beyond the scope of *this* RFC and indeed is beyond Typed Ember's purview.

### Use an alternative to `downlevel-dts`

As noted above in [<b>"Downleveling" types</b>](#downleveling-types), the long-term support for `downlevel-dts` is unknown as of yet, and there is a maintenance risk accordingly. As such, there are three other approaches we might take to the risk of incompatible type emit.

1.  **Build our own tool.** While this is probably doable -- `downlevel-dts` is not especially large or complicated -- it is additional maintenance burden, and is not aligned with the TypeScript team's own efforts. It is, as such, not *preferable*. However, if the TypeScript team is unwilling to maintain a more granular tool, this may be appropriate, and it would likely see wide uptake across the broader TypeScript ecosystem, as its utility is obvious.

2.  **Manually generate downleveled types.** This is possible, but very difficult: it requires addon authors to deeply understand the semantics of changes between TypeScript versions, rather than simply allowing a tool to manage it automatically. In practice, we expect that addon authors would choose *not* to downlevel their types because of the complexity involved, and instead either to just wait to adopt *new* TypeScript versions for a longer period of time or to drop support for *older* versions much more rapidly than this RFC proposes, with all the attendant downsides of either.

3.  **Do not bother with downleveling.** We could instead simply cut breaking changes whenever the TypeScript compiler creates backwards-incompatible changes. This is likely to cause considerable (and mostly-unnecessary) churn in the ecosystem, but it matches what most of the *rest* of the TypeScript ecosystem does.

## Unresolved questions

-   Is the recommended version support policy appropriate? There are other options available, like Typed Ember's current commitment to support the latest two (<i>N−1</i>) versions in the types. (In practice, we did not bump most of the Ember types' minimum version from TypeScript 2.8 until the release of TypeScript 3.9, at which time we bumped minimum supported TypeScript version to 3.7.)

-   How should we make downleveling and CI runs against supported TypeScript versions interact? Should we tell users to generate test-specific `tsconfig.json` files to use with downleveled types in their tests? Can this be automated in some way? Does use of `typesVersions` plus the CI runs handle it?

-   What is the right strategy and naming for validating types: "lint," "test," or a new-to-the-ecosystem concept like "check"? (See [this discussion](https://github.com/ember-modifier/ember-modifier/pull/41#discussion_r435628423) for background.)

-   How should transitive dependencies be expected to be handled? Should addon authors be expected to absorb any upstream differences in SemVer handling?

-   Given the prevalence of QUnit in the Ember community, the Jest/Mocha-like `expectType` assertions may seem out of place in some addons. Should we write an `assert-type` library akin to `expect-type`, with assertions like `assertType<SomeType>().equal<{ count: number }>()`?

## Appendix A: Core Addons and Ember CLI

This RFC is intended to be the first step toward formally supporting TypeScript as a first-class citizen. However, there are additional concerns to address for the core components of Ember: `ember-source`, `ember-data`, and `ember-cli`.

### Core addons

1.  Their release cadence (especially LTS releases) are foundational for this RFC's recommendations for when the *rest* of the ecosystem should move.

2.  Their types are foundational to the types in the rest of the ecosystem, so even with mitigations, any breaking changes to them will have a ripple effect -- just as with runtime code.

3.  They generally operate on longer time scales between major releases than other addons in the ecosystem, in part because of cultural norms, but in part also because of the ripple effect mentioned above.

The combination of these factors means that a slightly different strategy is likely necessary for Ember's core types. If the *same* strategy recommended above for addons were in use for Ember during the 3.x lifecycle, it would mean that the types would need to have supported *at least* TypeScript versions 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9 (possibly with some exceptions because of instability in some specific releases), all without a breaking change. This may be *possible*, but would have involved significant work, and there may be alternative approaches worth considering in line with Ember's general LTS strategy. These will be addressed in a future RFC for Ember itself.

### Ember CLI

Ember CLI has many of the same constraints that ember-source and ember-data do: it is foundational to the ecosystem, and if it were to publish types, breakage to those types would be similarly disruptive as a result. Additionally, though, it has the challenge that is versioning system *today* does not technically follow SemVer, because Ember CLI versions are kept in lockstep with Ember and Ember Data's versions. So, for example, when Ember CLI drops support for a Node version, it does *not* publish a breaking change even though by the norms of the Node ecosystem (and indeed the rest of the Ember ecosystem), it should.

Any publication of types for Ember CLI would therefore require *either* that it exactly match the policy of Ember and Ember Data, *or* that Ember CLI drop lockstep versioning with Ember and Ember Data -- or possibly other options not considered here.

As with the core addons, making either of these changes is substantially beyond the remit of this RFC.

## Appendix B: Existing Implementations

The recommendations in this RFC have been full implemented in [`ember-modifier`][ember-modifier] and partly implemented in [`ember-concurrency`][ember-concurrency]. `ember-modifier` publishes types generated from runtime code. `ember-concurrency` supplies a standalone type definition file. Since the implementations in early summer 2020, no known issues have emerged, and the experience of implementing earlier versions of the recommendations from this RFC were incorporated into the final form of this RFC.

There are, to the best of our knowledge, no other major adopters of these recommendations, and no similar such recommendations in the TypeScript ecosystem at large.

[ember-concurrency]: https://github.com/machty/ember-concurrency
