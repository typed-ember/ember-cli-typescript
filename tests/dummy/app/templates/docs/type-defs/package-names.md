# Understanding the Package Names

You may be wondering why the packages added to your `package.json` and described in [**Installation: Other packages this addon installs**][packages] are named things like `@types/ember__object` instead of something like `@types/@ember/object`. This is a conventional name used to allow both the compiler and the [DefinitelyTyped] publishing infrastructure ([types-publisher]) to handle scoped packages, documented under [<b>What about scoped packages?</b>][readme-h] in [the DefinitelyTyped README][readme].

See also:

- [Microsoft/types-publisher#155]
- [Microsoft/Typescript#14819]

[packages]: ../../docs#other-packages-this-addon-installs
[DefinitelyTyped]: https://github.com/DefinitelyTyped/DefinitelyTyped
[types-publisher]: https://github.com/Microsoft/types-publisher
[readme-h]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master#what-about-scoped-packages
[readme]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master
[Microsoft/types-publisher#155]: https://github.com/Microsoft/types-publisher/issues/155
[Microsoft/Typescript#14819]: https://github.com/Microsoft/TypeScript/issues/14819
