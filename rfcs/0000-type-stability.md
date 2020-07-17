- Start Date: 2020-06-03
- RFC PR: (after opening the RFC PR, update this with a link to it and update the file name)
- Tracking: (leave this empty)

# RFC: Defining Semantic Versioning for Published Addon Types

This RFC proposes a set of guidelines and tooling recommendations for managing changes as addons adopt TypeScript throughout the Ember ecosystem, as part of the path to making TypeScript a first-class citizen in Ember as a whole.

This RFC does *not* attempt to solve—

- the problem of stability for ambient types (e.g. from `@types`/DefinitelyTyped)
- performance regression analysis

These concerns will be addressed in future RFCs.

While the detailed recommendations here are specific to the Ember ecosystem, we believe these recommendations will also be useful for the TypeScript ecosystem more broadly, with tweaks as appropriate to other ecosystems!

<!-- omit in toc -->
## Summary

Introduce an addon-focused policy for supported versions of TypeScript which is well-aligned with Ember’s SemVer and LTS commitments and design workflows to support that policy, so that consumers of Ember addons which publish types are insulated from breaking changes in TypeScript to the degree possible, and able to manage them appropriately otherwise.

- [Motivation](#motivation)
- [Detailed design](#detailed-design)
    - [Background: TypeScript and Semantic Versioning](#background-typescript-and-semantic-versioning)
    - [Defining breaking changes](#defining-breaking-changes)
        - [Breaking changes to type definitions](#breaking-changes-to-type-definitions)
        - [Non-breaking changes to type definitions](#non-breaking-changes-to-type-definitions)
        - [Bug fixes to type definitions](#bug-fixes-to-type-definitions)
        - [Dropping support for previously-supported versions](#dropping-support-for-previously-supported-versions)
    - [Tooling](#tooling)
        - [Detect breaking changes in types](#detect-breaking-changes-in-types)
        - [Mitigate breaking changes](#mitigate-breaking-changes)
            - [Updating types to maintain compatibility](#updating-types-to-maintain-compatibility)
            - [“Downleveling” types](#downleveling-types)
            - [Opt-in future types](#opt-in-future-types)
                - [Example: TypeScript 3.5 mitigation](#example-typescript-35-mitigation)
    - [Policy for supported TypeScript versions](#policy-for-supported-typescript-versions)
        - [Supporting new versions](#supporting-new-versions)
        - [Dropping TypeScript versions](#dropping-typescript-versions)
        - [Documenting supported versions](#documenting-supported-versions)
    - [Summary](#summary)
- [How we teach this](#how-we-teach-this)
- [Drawbacks](#drawbacks)
- [Alternatives](#alternatives)
    - [No policy](#no-policy)
    - [Decouple TypeScript support from Ember’s LTS cycle](#decouple-typescript-support-from-embers-lts-cycle)
    - [Use an alternative to `downlevel-dts`](#use-an-alternative-to-downlevel-dts)
- [Unresolved questions](#unresolved-questions)
- [Appendix: Core Addons and Ember CLI](#appendix-core-addons-and-ember-cli)
    - [Core addons](#core-addons)
    - [Ember CLI](#ember-cli)
- [Notes](#notes)

## Motivation

Ember and TypeScript have fundamentally different views on Semantic Versioning (SemVer). Ember has a deep commitment to minimizing breaking changes in general, and to strictly following SemVer when breaking changes *are* made. TypeScript explicitly *does not* follow SemVer [[see note 1](#notes)]. Every point release may be a breaking change, and “major” numbers for releases signify nothing beyond having reached `x.9` in the previous cycle. (At the time of drafting, the current latest TypeScript is 3.9; the next version will be 4.0.)

For TypeScript to be a first-class citizen of the Ember ecosystem, we need:

-   a policy defining what constitutes a breaking change for consumers of a library which publishes types
-   tooling to detect breaking changes in types—whether from refactors, or from new TypeScript releases—and to minimize the amount of churn from breaking changes in TypeScript
-   a general and widely-adopted policy for supported TypeScript versions

Once all three of those elements are adopted, end users will be able to have equally high confidence in the stability of addons’ published types as they do in their runtime code.

This RFC ***should not*** be understood to propose *anything* about the core Ember addons (Ember and Ember Data) or Ember CLI: that would need to flow through the normal Ember RFC process. However, these same tools and patterns are necessary for core tools and libraries to begin publishing types, and this same strategy could be applied successfully there with minor modification. See [<b>Appendix: Core Addons and CLI</b>](#appendix-core-addons-and-ember-cli) for an overview of some possible future directions.

## Detailed design

TypeScript should be treated with exactly the same rigor as other elements of the Ember ecosystem, with the same level of commitment to stability, clear and accurate use of Semantic Versioning, testing, and clear policies about breaking changes.

TypeScript introduces two new concerns around breaking changes for addons which publish types.

1.  TypeScript does not adhere to the same norms around Semantic Versioning as the rest of the npm ecosystem, so it is important for addon authors to understand when TypeScript versions may introduce breaking changes without any other change made to the addon.

2.  The runtime behavior of the addon is no longer the only source of potentially-breaking changes: types may be as well. In a well-typed addon, runtime behavior and types should be well-aligned, but it is possible to introduce breaking changes to types without changing runtime behavior.

Accordingly, we must define breaking changes precisely and carefully.

### Background: TypeScript and Semantic Versioning

TypeScript ***does not*** adhere to Semantic Versioning, but since it participates in the npm ecosystem, it uses the same format for its version numbers: `<major>.<minor>.<patch>`. In Semantic Versioning, `<major>` would be a breaking change release, `<minor>` would be a backwards-compatible feature-addition release, and `<patch>` would be a “bug fix” release.

TypeScript maintains this final distinction: the `<patch>` position corresponds to bug fix changes released between the time of one `<minor>` release and the next. For example, `3.9.3` is the third patch/bug fix release for TypeScript version 3.9. However, both `<major>` and `<minor>` releases *may* introduce breaking changes of the sort that the npm ecosystem normally reserves for the `<major>` slot in the version number. (Not all `<minor>` *or* `<major>` releases *do* introduce breaking changes in the normal Semantic Versioning sense, but either *may*.) Accordingly, and for simplicity, the Ember ecosystem should treat *all* TypeScript `<major>.<minor>` releases as *potentially* representing breaking changes.

By example:

-   `3.9.2` to `3.9.3`: always considered a bug fix
-   `3.9.3` to `4.0.0`: *may or may not* introduce breaking changes
-   `3.8.3` to `3.9.0`: *may or may not* introduce breaking changes

### Defining breaking changes

When making a change to the types of the public interface, it is subject to the same constraints as runtime code: *breaking the published types entails a breaking change.* Not all changes to published types are *breaking*, however: some changes will continue to allow user code to continue working without any issue. Thus, a *breaking* change to types is a change where previously-allowed code will stop type-checking.

#### Breaking changes to type definitions

A breaking change to a type definition occurs when—

-   the type changes entirely, for example if a function previously accepted `number` and now accepts `{ count: number }`—since the user will have to change all calls to the function ([playground][changed-type])

-   a function (including a class constructor or methods) argument *requires a more specific (“narrower”) type*, for example if it previously accepted `string | number` but now requires `string`—since the user will have to change some calls to the function ([playground][narrower-argument])

-   a function (including a class constructor or method) *returns a less specific (“wider”) type*, for example if it previously returned `string` but now returns `string | null`—since the user’s existing handling of the return value will be wrong in some cases ([playground][wider-return])

-   a function (including a class constructor or method) adds any new *required* arguments—since all user invocations of the function will now be broken ([playground][new-required-argument])

-   a function (including a class constructor or method) removes an existing argument entirely—since all user invocations of the function will now fail to type-check ([playground][remove-argument])

-   a `readonly` object property type becomes a *less specific (“wider”) type*, for example if it was previously `string` but now is `string | string[]`—since the user’s existing handling of the property will be wrong in some cases ([playground][wider-property]—note that the playground uses a class but an interface or type alias would have the same behavior)

-   a non-`readonly` object type changes in any way, for example if it was previously `string` but now is `string | number` *or* if it was previously `string | number` but now is `string`—since some of the user’s existing *writes* to the property will now be wrong.

    Note that at present, TypeScript cannot actually catch this error. [This playground][writable-property] demonstrates that there is a runtime error but no *type* error. TypeScript’s type system understands these types in terms of *assignability*, rather than local *mutability*. However, addon authors should treat the change as breaking whether TypeScript can currently identify it or not!

[changed-type]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0NigkBqBbJyoAPKY8AjknGZyoMUubIj0OPChLPSMNNK2nPYAFIEE0HqIbJAARlgAlHoAbhrwgeFyDtGx8Ymo5JS0DKgAwviIloGFJaXlldUMdQ12yK3teub0GmW6oF29WKAOg6AjYxNTctm5SFwAdIdkPUqI0WgBGABMAGZ+hM1tANshAgDakDjk1TpCYeEgA

[narrower-argument]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEs9Iw00rac9gAUgQTQesLZiLCgAD7JbJAARlgAlHoAbhrwgeFyDtGx8YmoKdR0jKAA6jOSyIEFxSVlFVUMtfV2yC1tHThdsOOgUzNzCwpgQlig9BqxclkckguAA6c7IOpUBrNACMACYAMyjOaA3Kg8GQ6HXTwYbgaTzIuQ7WIoQJgmoQy6Na7wpFzYl7MkYqnNHHIPEE8JAA

[wider-return]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEWVrac9gAUAJR6wtmIsOFyDtGx8YmoKdR0jKAA6vCxKIEFxSVlFVWWNnbITS04bbCgAD7JbNyd3QpgQlig9Bqxcs6l5ZWI6NCIgZzIAErU+zj1AG4r65tGjNith2JgHn86sgAHSvdp4Q7RfDPV4fKhfepZHJILjQpa1BqNRqdZEvd6fTjfcaTZCBPE1FZNYlyIA

[new-required-argument]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwEo7ictgBuAKFCRYCFOmx54yAsCgYQwanQZNWAGngAjOqmQBbTSBgd4XHgP4QQGeFHgBeQiTJUA5ARwY5OV2wFWbTQcpGTkFSndPb19eIA

[remove-argument]: https://www.typescriptlang.org/play/?ssl=2&ssc=35&pln=2&pc=47#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwBp4AjO1ZAW04gYASjrEcWYAG4AUKEiwEKdNjzxkBYFAwhg1OgyatR8cZNkyIIDPCjwAvIRJkqAcgI4M2nK44BGACZhWSsbTgd1TW1dSndPb194QOCgA

[wider-property]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEkoGdnwPIwJYHMsDsoJ4BvAKHnjimAHt8IBPeABxlpZBgBdGAueMm7Z8OANxkAvmTKgkcRNFTwA6llD4QwUhSoga9Jq3ace-QcII54AHwsicAbQC6UmQDMArvjDcs9eAALKHxgCBBkTFwCIgA5WHYAdwAKADciTxABKLxCCABKAXxPAFsAIy4dSjhuTxh8eHSITIA6Ng4uXhbw0W5AiWlZcGgFcO54KGzsXKIJORGEMfgygTUNLQlg0PDI6ZiIeJgk5Kh8zZCwiJz9w+Oys7IgA

[writable-property]: https://www.typescriptlang.org/play/#code/PTAEFpNB3BLATApgO1sg5qARgJ0QQwGsBnCKEAWACg0AXRHAM3wGNFQB1WAG266WSgA3tVBjQ+AFyhitHGnQBuagF9q1Og2ZtQAEQT8Uw0eKky5C0AB9QyAK4BbLA2VU1VaozvIWtWAHtBAAt8ZHhuRGIuXkNkAAoAN3xuO0RpaL4EFABKaXsnBmMqcVA8WjscQSSUxAA6fFqIjFog13dqJBZufDxQCNoYHkyBdKHY1xCwiKixrPi4GLns1w7ELp72ftB4AznpfXhx6knwyIzYuJ3DpZWqEDJwWx6cfzgMCW5if2w8IlJIR6UDw0ZD0JisdgZAByz1eRRKZlk8neNnyzhwbXUILB2nYBxhOBe0HhpjyjnRmOBXh8fkCMHk9GIABV-NDYdBEslUqNeASidkSWJqql6qAALygADkQUQvH8kspq3WvS2C24fNePPV7Nc0AZkRZbMJrziao10GWWM63RViAGV3N+wQ5t1+uZrKG5suzvZlqoQA

Each of these will trigger a compiler error for consumers, surfacing the error. As such, they should be easily detectable by testing infrastructure (see below under [Tooling: Detect breaking changes in types](#detect-breaking-changes-in-types)).

There are several reasons why breaking changes may occur:

-   The author of the addon may choose to change the API for whatever reason. This is no different than the situation today for addons which do not support TypeScript.

-   The author of the addon may need to make changes to adapt to changes in Ember, for example to support Octane idioms. This is likewise identical with the situation for addons which do not support TypeScript.

-   Adopting a new version of TypeScript may change the meaning of existing types. For example, in TypeScript 3.5, generic types without a specified default type changed their default value from `{}` to `unknown`. This improved type safety, but [broke many existing types][3.5-breakage], including the internal types for Glimmer and Ember.

-   Adopting a new version of TypeScript may change the type definitions emitted in `.d.ts` files in backwards-incompatible ways. For example, changing to use the finalized ECMAScript spec for class fields meant that [types emitted by TypeScript 3.7 were incompatible with TypeScript 3.5 and earlier][3.7-emit-change].

[3.5-breakage]: https://github.com/microsoft/TypeScript/issues/33272
[3.7-emit-change]: https://github.com/microsoft/TypeScript/pull/33470

#### Non-breaking changes to type definitions

The following are *not* breaking changes:

-   a function (including a class method or constructor) *accepts a less specific (“wider”) type*, for example if it previously accepted only a `boolean` but now accepts `boolean | undefined`—since all existing user code will continue working and type-checking ([playground][wider-argument])

-   a function (including a class method) which *returns a more specific (“narrower”) type*, for example if it previously returned `number | undefined` and now always returns `number`—since all user code will continue working and type-checking ([playground][narrower-return])

-   a function (including a class constructor or method) makes a previously-required argument optional—since all existing user code will continue to work with it ([playground][optional-argument])

-   a `readonly` object property becomes a *more specific (“narrower”) type*, for example if it was previously `string | string[]` and now is always `string[]`—since all user code will continue working and type-checking ([playground][narrower-property])

In each of these cases, some user code becomes *superfluous*, but it neither fails to type-check nor causes any runtime errors.

[wider-argument]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEs9Iw00rac9gAUgQTQegBGGhqcyNCIAJR6AG4a8IHhcg7RsfGJqCnUdIygAOrjksiBBcUlZRVVDLX1dsgtbZ3dvf2gAD6gpbHOSFtDoKPjk9MKYEJYoPQNLE5FkckguAA6I7IOpUBrNHCYewDSag3KQ6Gw+FnZxcCQouTrWIoQJQmowk6NM6I5GTImbUmYynNXGcfHhIA

[narrower-return]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEWVrac9gAUAJR6wtmIsKAAPsls3OFyDtGx8YmoKdR0jKAAcoluAO7IgQXFJWUVVZY2dshNLThtsP2DCmBCWKD0GrFyzqXllYjo0IiBnMgAStS9OPUAbjt9ocuj1uM0epAAEYXUyFYrYdiYJ4AurIAD8ADp3u08KA0WjQAAGY7RfCvd5fKg-epZHJILgYra1BqNRr9MlvT7fTi-WaYBZLRk1HZNNlyIA

[optional-argument]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwBp4AjO1ZAW04gYASjrEcWYAG4AUKEiwEKdNjzxkBYFAwhg1OgyasOnAPw9+gkWInSZMiCAzwo8ALyESZKgHICODG0cHw4ARgAmYVlHZ053dU1tXUo-AKCQ+AiooA

[narrower-property]: https://www.typescriptlang.org/play?#code/CYUwxgNghgTiAEkoGdnwPIwJYHMsDsoJ4BvAKHngAcYB7KkGAFwE8AueZJ7fHeAH07cCOANoBdANxkAvmTKgkcRNFTwAcrDoB3EMFIVqdBs3ZCeOWfIBmAV3xgmWWvngALKPmAQQyTLgIiTRgdAAoANyJbEA5-PEIIAEoOfFsAWwAjRgNKOCZbGFdIiGiAOhp6RlZSn14mN2k5BXBoZR8meChY7HiiaUVWhHb4DI5gnT1pDy8fPx7AiHHabVCoRKnPb184haWVjPWyIA

#### Bug fixes to type definitions

As with runtime code, types may have bugs. Addon authors may find cases where previously-allowed code was allowed *incorrectly*. For example, a type may have been `any` accidentally, allowing users to instantiate classes or call functions or methods incorrectly. In these cases, the incorrect types will correspond to incorrect runtime behavior! Just as with bug fixes for runtime code, addon authors may publish fixes to *types* in patch releases.

#### Dropping support for previously-supported versions

Additionally, once a TypeScript version has been added to an addon’s list of supported versions, dropping it constitutes a breaking change, because it has the same kind of impact on users of the addon as dropping support for a version of Ember, Ember CLI, or Node. Whatever the reason for dropping a previously-supported TypeScript release, addons should publish a new major version.

### Tooling

To successfully use TypeScript, we need to be able to *detect* breaking changes (whether from our own changes or from TypeScript itself) and to *mitigate* them.

#### Detect breaking changes in types

As with runtime code, it is essential to prevent unintentional changes to the API of types supplied by an addon. We can accomplish this using *type tests*: tests which assert that the types exposed by the public API of the addon are stable.

Addon authors publishing types should add [the `expect-type` library][expect-type] library and generate a set of tests corresponding to their public API. These tests should be put in the `types` folder configured by `ember-cli-typescript`’s default generator. If the API surface is small, a single file may be sufficient. For example, `ember-modifier` has `types/ember-modifier-test.ts`. In more complicated packages, addon authors may choose to break the tests down to mirror the structure of the addon’s API—for example, by dedicated test files for each helper, modifier, service, component, or utility class or function exported from the addon.

These type tests should be specific and precise. It is important, for example, to guarantee that an API element never *accidentally* becomes `any`, thereby making many things allowable which should not be in the case of function arguments, and “infecting” the caller’s code by eliminating type safety on the result in the case of function return values. The `expect-type` library’s `.toEqualTypeOf` assertion is robust against precisely this scenario; addon authors are also encouraged to use its `.not` modifier and `.toBeAny()` method where appropriate to prevent this failure mode.

This has no impact on runtime code: the `types` directory is not used for generating builds. However, to be safe, these tests should *never* export any code. They should import the public API they are testing and `expectTypeOf` and any test helpers, and nothing else. Actually executing the test then consists of running `tsc --noEmit`.

[expect-type]: https://github.com/mmkal/ts/tree/master/packages/expect-type#readme

In addition to *writing* these tests, addon authors should include `tsc --noEmit` in their continuous integration configuration, so that any changes made to the library are validated to make sure the API has not been changed accidentally.

Further, just as addons are encouraged to test against all a matrix of Ember versions which includes the current stable release, the currently active Ember LTS release, and the canary and beta releases, addons should test the types against all versions of TypeScript supported by the addon (see the [suggested policy for version support](#policy-for-supported-typescript-versions) below) as well as the upcoming version (the `next` tag for the `typescript` package on npm).

Type tests can run as normal [ember-try] variations. Typed Ember will document a conventional setup for ember-try configurations, so that correct integration into CI setups will be straightforward for addon authors.

[ember-try]: https://github.com/ember-cli/ember-try

#### Mitigate breaking changes

It is insufficient merely to be *aware* of breaking changes. It is also important to *mitigate* them, to minimize churn and breakage for addon users.

There are two tools and two techniques by which we can minimize churn in the ecosystem, which when combined will allow us to insulate addon users even from most breaking changes to TypeScript.

##### Updating types to maintain compatibility

Sometimes, it is possible when TypeScript makes a breaking change to update the types so they are backwards compatible, without impacting consumers at all. For example, [TypeScript 3.5][3.5-breakage] changed the default resolution of an otherwise-unspecified generic type from the empty object `{}` to `unknown`. This change was an improvement in the robustness of the type system, but it meant that any code which happened to rely on the previous behavior broke.

This example from [Google’s writeup on the TS 3.5 changes][3.5-breakage] illustrates the point. Given this function:

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

This is a totally-backwards compatible bugfix-style change, and should be released in a bugfix/point release. Users can then just upgrade to the bugfix release *before* upgrading their own TypeScript version—and will experience *zero* impact from the breaking TypeScript change.

Later, the default type argument `Promise<{}>` could be dropped and defaulted to the new value for a major release of the library when desired (per the policy [outlined below](#policy-for-supported-type-script-versions), giving it the new semantics. (Also see [<b>Opt-in future types</b>](#opt-in-future-types) below for a means to allow users to *opt in* to these changes before the major version.)

[3.3-pre-breakage-playground]: https://www.typescriptlang.org/play/?ts=3.3.3&ssl=1&ssc=27&pln=1&pc=40#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlIgN4CwAUIonlCNkmLgO6KES5KpTxk4AGwBuuWgF4AfPWatWYyTJoBuFYgC+1HUz3NmEBGSiJiAT0GkKALgFEHuADx09SuSjRY8e2FtIA
[3.5-breakage-plaground]: https://www.typescriptlang.org/play/?ts=3.5.1&ssl=1&ssc=27&pln=1&pc=40#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlIgN4CwAUIonlCNkmLgO6KES5KpTxk4AGwBuuWgF4AfPWatWYyTJoBuFYgC+1HUz3NmEBGSiJiAT0GkKALgFEHuADx09SuSjRY8e2FtIA
[3.5-mitigation-playground]: https://www.typescriptlang.org/play/?ts=3.5.1#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlAFyKEnm4A8A3gL4B8ibAsAChEiPFBDYkYXAHcGRUhUqU8ZOABsAbrmqIAvD35DhI3Ks1VqAbkHCOVwR0GCICMlETEAnowW56P5nZuPRQ0LDwAxSsgA

##### “Downleveling” types

When a new version of TypeScript results in backwards-incompatible *emit* to to the type definitions, as they did in [3.7][3.7-emit-change], the strategy of changing the types directly will not work. However, it is still possible to provide backwards-compatible types, using the combination of [downlevel-dts] and [typesVersions]. (In some cases, this may also require some manual tweaking of types, but this should be rare for most addons.)

- [downlevel-dts] allows you to take a `.d.ts` file which is not valid for an earlier version of TypeScript (e.g. the changes to class field emit mentioned in [<b>Breaking Changes to Type Definitions</b>](#breaking-changes-to-type-definitions)), and emit a version which *is* compatible with that version. Specifically: it currently generates types compatible with TypeScript 3.4.[[see note 2](#notes)]
- [typesVersions] allow you to specify a specific set of type definitions (which may consist of one or more `.d.ts` files) which correspond to a specific TypeScript version

[downlevel-dts]: https://github.com/sandersn/downlevel-dts
[typesVersions]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#version-selection-with-typesversions

The recommended flow will be as follows:[[see note 2](#notes)]

1.  Add `downlevel-dts`, `npm-run-all`, and `rimraf`  to your dev dependencies:

    ```sh
    npm install --save-dev downlevel-dts npm-run-all rimraf
    ```
    
    or 
    
    ```sh
    yarn add --dev downlevel-dts npm-run-all rimraf
    ```

2.  Update the `scripts` key in `package.json`  to generate downleveled types generated by running `downlevel-dts` on the output of `ember-cli-typescript`’s  `ts:precompile` command, and to clean up the results after publication:

    ```diff
    {
      "scripts": {
    -   "prepublishOnly": "ember ts:precompile",
    +   "prepublish:types": "ember ts:precompile",
    +   "prepublish:downlevel": "downlevel-dts . ts3.4",
    +   "prepublishOnly": "run-s prepublish:types prepublish:downlevel",
    -   "postpublish": "ember ts:clean",
    +   "clean:ts": "ember ts:clean",
    +   "clean:downlevel": "rimraf ./ts3.4",
    +   "clean": "npm-run-all --aggregate-output --parallel clean:*",
    +   "postpublish": "npm run clean",
      }
    }
    ```

3.  Add a `typesVersions` key to `package.json`, with the following contents, where instead of `3.9` the addon should always supply the current maximum supported TypeScript version:

    ```json
    {
      "types": "index.d.ts",
      "typesVersions": {
        "<3.9": { "*": ["ts3.4/*"] }
      }
    }
    ```

    This will tell TypeScript how to use the types generated during `ember ts:precompile`. Note that we explicitly include the `types` key so TypeScript will fall back to the defaults for 3.9 and higher.

4.  If using the `files` key in `package.json` to specify files to include (unusual but not impossible for TypeScript-authored addons), add `ts3.4` to the list of entries.

Now consumers using older versions of TypeScript will be buffered from the breaking changes in type definition emit.

(Noting the complexity of this work, the community may want to invest in tooling to automate support for managing dependencies, downleveling, and type tests. However, the core constraints of this RFC do not depend on such tooling existing, and the exact requirements of those tools will emerge organically as the community begins implementing this RFC's recommendations.)

##### Opt-in future types

In the case of significant breaking changes to *only* the types—whether because the addon author wants to make a change, or because of TypeScript version changes—addons may supply *future* types, which users may opt into *before* the library ships a breaking change. (We expect this use case will be rare, but important.)

In this case, addon authors will need to *hand-author* the types for the future version of the types, and supply them at a specific location which users can then import directly in their `types/my-app.d.ts` file—which will override the normal types location, while not requiring the user to modify the `paths` key in their `tsconfig.json`.

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

    —and the contents of `sub-package.d.ts` would be:
    
    ```ts
    declare module 'my-library/sub-package' {
      export function dontCarePromise(): Promise<unknown>;
    }
    ```

7.  Explicitly include each such sub-module in the import graph available from `ts3.5/index.d.ts`—either via direct import in that file or via imports in the other modules. (Note that these imports can simply be of the form `import 'some-module';`, rather than importing specific types or values from the modules.)

7.  Commit the `ts3.5` directory, since it now needs to be maintained manually until a breaking change of the library is released which opts into the new behavior.

8.  Cut a release which includes the new fixes. With that release:

    -   Inform users about the incoming breaking change.

    -   Tell users to add `import 'fancy-addon/ts3.5';` to the top of their app's `types/my-app.d.ts` or `types/my-addon.d.ts` file (which is generated by `ember-cli-typescript`’s post-install blueprint).

9.  At a later point, cut a breaking change which opts into the TypeScript 3.5 behavior.

    -   Remove the `ts3.5` directory from the repository.

    -   Note in the release notes that users who did not previously opt into the changes will need to do so now.

    -   Note in the release notes that users who *did* previously opt into the changes should remove the `import 'fancy-addon/ts3.5';` import from `types/my-app.d.ts` or `types/my-addon.d.ts`.

### Policy for supported TypeScript versions

TypeScript and Ember both have regular cadences for release:

- Ember releases every six weeks, with new Long-Term Support (LTS) releases every 24 weeks (that is, every 4 releases).
- TypeScript releases roughly quarterly. There are no LTS releases for TypeScript.

These map reasonably well to each other, and this correspondence provides a helpful basis for recommending a version support policy.

Addons should generally support the TypeScript versions current during the lifetime of the Ember LTS versions they support. As noted above, dropping a supported TypeScript version is a breaking change, and it is helpful to minimize the number of major versions of an addon in use.

#### Supporting new versions

The Typed Ember team shall normally make a recommendation within a week of the release of a new TypeScript version whether it should be adopted as a supported version by the community.

Some TypeScript releases have bugs which last throughout the life of the release and are fixed only in the following release. This is not uncommon; the same is true of ember-source and ember-data. Critically, however, the role played by TypeScript in the development pipeline means that users—including addon authors—can safely wait for later releases. This is not *common*, but has happened enough times in recent TypeScript history (including 2.9–3.1, 3.5, and 3.8) that a recommended support matrix will minimize churn and pain in the ecosystem.

Addon authors should *prefer* to follow guidance from the Typed Ember team about supported TypeScript versions. Addon authors *may* opt into supporting non-recommended versions, but the Typed Ember team will not commit to helping support TypeScript issues and bugs for addons which do so. (See [<b>Documenting supported versions</b>](#documenting-supported-versions) below.)

Adding a new supported version does *not* require an addon to create a new release, though it should be added to addons’ test suites and their  documentation about supported versions.

#### Dropping TypeScript versions

As discussed above in [Changes to types: Dropping support for previously-supported versions](#dropping-support-for-previously-supported-versions), dropping support for previously-supported versions of TypeScript is always a breaking change and therefore requires releasing a major version. Given the constraints of Ember CLI’s version resolution today (where only one major version will be resolved successfully), addon authors should prefer to drop older supported TypeScript versions relatively infrequently. Optimally, addon authors should drop TypeScript versions at the same time as they are already making *other* breaking changes of a similar sort, like dropping support for Node or Ember versions when their LTS period ends.

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
-   making the addon’s semantic versioning commitments clear by linking to a tagged version of Typed Ember’s `SEMVER.md`, and how to describe any modifications from that policy
-   publicizing the addon’s supported versions of TypeScript
-   the currently-recommended versions of TypeScript, along with a standard badge

Finally, Typed Ember will publish a new document in its own repo: `SEMVER.md`, tagged so it can be referenced by direct stable link from addon repositories—with the same set of rules as documented in this document.

## Drawbacks

-   Adding type tests and infrastructure may slow the development of any given feature. We believe that is more than made up for by the resulting stability of the code, just as with runtime tests—but there is a real cost in time spent nonetheless.

-   The current version of `downlevel-dts` generates output in a way that could cause regressions in strictness for previously-published versions. This means that when we upgrade an addon to a new version of TypeScript, we will *sometimes* be shipping types to consumers which are *less* useful and catch *fewer* errors than they did previously. This is a real, if small, concern for the viability of the current proposal. See below for discussion on alternatives to the use of `downlevel-dts`. Notably, however, these regressions would *never* cause code that compiles to stop compiling—only allow some code to compile that *should not* and previously *did not*.

-   The policy proposed here *may* at times mean uptake of new TypeScript features is slower than it would otherwise be, in order to support versions for the lifetime of Ember LTS releases. While in most cases, the mitigations suggested here will make this less of a problem, it *may* be an issue at times given the current limitations of `downlevel-dts`.

## Alternatives

### No policy

Other frameworks do not currently have any specific support policy. Nor do most TypeScript libraries. Instead, they just roughly track latest and expect downstream consumers of the types to eat the cost of changes. This strategy *could* work if libraries were honest about the SemVer implications of this and cut major releases any time a new TypeScript version resulted in breaking changes. Notably, the Ember TypeScript ecosystem has largely operated in this mode to date, and it has worked all right so far.

However, there are three major problems with this approach.

-   First, it does not scale well. While many apps and a few addons are using TypeScript today, as the community of TypeScript users grows and especially as it increasingly includes addons used extensively throughout the community (e.g. [ember-modifier]), the cost of breaking changes will be magnified greatly.

-   Second, and closely related, the more central an addon is to the ecosystem, the worse the impact is—especially when combined with the fact that Ember CLI will only resolve a single major version of an addon. Without a mitigation strategy, core addons like ember-modifier could easily end up fragmenting the ecosystem.

-   Third, in the absence of a specific policy, each addon would end up developing its own _ad hoc_ support policy (as has been the case today). The Ember community highly values shared solutions and stability—preferring to avoid churn and risk through policies such as the one outlined in this RFC. Accordingly, a policy which aligns TypeScript support with existing community norms around supported versions would make TypeScript adoption more palatable both at the community level in general and specifically to large/enterprise engineering organizations with a lower appetite for risk.

[ember-modifier]: https://github.com/ember-modifier/ember-modifier

### Decouple TypeScript support from Ember’s LTS cycle

This is a perfectly reasonable decision, and in fact some addons may choose to take it. However, it comes with the previously mentioned challenges when multiple major versions of an addon exist in the Ember ecosystem. While a strategy for resolving those challenges at the ecosystem level would be nice, it is far beyond the scope of *this* RFC and indeed is beyond Typed Ember’s purview.

### Use an alternative to `downlevel-dts`

As noted above in [<b>“Downleveling” types</b>](#downleveling-types), `downlevel-dts` currently only generates types for TypeScript 3.4, with no ability to generate targeted types. As such, there are two other approaches we might take to 

1.  **Build our own tool.** While this is probably doable—`downlevel-dts` is not especially large or complicated—it is additional maintenance burden, and is not aligned with the TypeScript team’s own efforts. It is, as such, not *preferable*. However, if the TypeScript team is unwilling to maintain a more granular tool, this may be appropriate, and it would likely see wide uptake across the broader TypeScript ecosystem, as its utility is obvious.

2.  **Manually generate downleveled types.** This is possible, but very difficult: it requires addon authors to deeply understand the semantics of changes between TypeScript versions, rather than simply allowing a tool to manage it automatically. In practice, we expect that addon authors would choose *not* to downlevel their types because of the complexity involved, and instead either to just wait to adopt *new* TypeScript versions for a longer period of time or to drop support for *older* versions much more rapidly than this RFC proposes, with all the attendant downsides of either.

## Unresolved questions

-   Is the recommended version support policy appropriate? There are other options available, like Typed Ember’s current commitment to support the latest two (<i>N−1</i>) versions in the types. (In practice, we did not bump most of the Ember types’ minimum version from TypeScript 2.8 until the release of TypeScript 3.9, at which time we bumped minimum supported TypeScript version to 3.7.)

-   How should we make downleveling and CI runs against supported TypeScript versions interact? Should we tell users to generate test-specific `tsconfig.json` files to use with downleveled types in their tests? Can this be automated in some way? Does use of `typesVersions` plus the CI runs handle it?

-   What is the right strategy and naming for validating types: "lint," "test," or a new-to-the-ecosystem concept like "check"? (See [this discussion](https://github.com/ember-modifier/ember-modifier/pull/41#discussion_r435628423) for background.)

-   How should transitive dependencies be expected to be handled? Should addon authors be expected to absorb any upstream differences in SemVer handling?

-   Given the prevalence of QUnit in the Ember community, the Jest/Mocha-like `expectType` assertions may seem out of place in some addons. Should we write an `assert-type` library akin to `expect-type`, with assertions like `assertType<SomeType>().equal<{ count: number }>()`?

## Appendix: Core Addons and Ember CLI

This RFC is intended to be the first step toward formally supporting TypeScript as a first-class citizen. However, there are additional concerns to address for the core components of Ember: `ember-source`, `ember-data`, and `ember-cli`.

### Core addons

1.  Their release cadence (especially LTS releases) are foundational for this RFC’s recommendations for when the *rest* of the ecosystem should move.

2.  Their types are foundational to the types in the rest of the ecosystem, so even with mitigations, any breaking changes to them will have a ripple effect—just as with runtime code.

3.  They generally operate on longer time scales between major releases than other addons in the ecosystem, in part because of cultural norms, but in part also because of the ripple effect mentioned above.

The combination of these factors means that a slightly different strategy is likely necessary for Ember’s core types. If the *same* strategy recommended above for addons were in use for Ember during the 3.x lifecycle, it would mean that the types would need to have supported *at least* TypeScript versions 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9 (possibly with some exceptions because of instability in some specific releases), all without a breaking change. This may be *possible*, but would have involved significant work, and there may be alternative approaches worth considering in line with Ember’s general LTS strategy. These will be addressed in a future RFC for Ember itself.

### Ember CLI

Ember CLI has many of the same constraints that ember-source and ember-data do: it is foundational to the ecosystem, and if it were to publish types, breakage to those types would be similarly disruptive as a result. Additionally, though, it has the challenge that is versioning system *today* does not technically follow SemVer, because Ember CLI versions are kept in lockstep with Ember and Ember Data’s versions. So, for example, when Ember CLI drops support for a Node version, it does *not* publish a breaking change even though by the norms of the Node ecosystem (and indeed the rest of the Ember ecosystem), it should.

Any publication of types for Ember CLI would therefore require *either* that it exactly match the policy of Ember and Ember Data, *or* that Ember CLI drop lockstep versioning with Ember and Ember Data—or possibly other options not considered here.

As with the core addons, making either of these changes is substantially beyond the remit of this RFC.

## Notes

1.  TypeScript’s core team argues that *every* change to the compiler is a breaking change, and that SemVer is therefore meaningless. We do not agree with this characterization, but are not interested in litigating it.

2.  This is *not* optimal: we would prefer to be able to supply types specific to each supported version, rather than downleveling everything to a lowest-common denominator of 3.4. If [the upstream issue][downlevel-dts-36] which prevents us from being more granular is resolved, this RFC will be amended and docs and any blueprints updated to support that more granular resolution.

[downlevel-dts-36]: https://github.com/sandersn/downlevel-dts/issues/36
