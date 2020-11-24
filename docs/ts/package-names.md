# Understanding the `@types` Package Names

You may be wondering why the packages added to your `package.json` and described in [**Installation: Other packages this addon installs**](https://github.com/typed-ember/ember-cli-typescript/tree/3a434def8b8c8214853cea0762940ccedb2256e8/docs/README.md#other-packages-this-addon-installs) are named things like `@types/ember__object` instead of something like `@types/@ember/object`. This is a conventional name used to allow both the compiler and the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) publishing infrastructure \([types-publisher](https://github.com/Microsoft/types-publisher)\) to handle scoped packages, documented under [**What about scoped packages?**](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master#what-about-scoped-packages) in [the DefinitelyTyped README](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master).

See also:

* [Microsoft/types-publisher\#155](https://github.com/Microsoft/types-publisher/issues/155)
* [Microsoft/Typescript\#14819](https://github.com/Microsoft/TypeScript/issues/14819)

