# ember-cli-typescript

Enable typescript preprocessing on Ember 2.x apps.


## Installation

In addition to ember-cli-typescript, the following files are required:

- [typescript](https://github.com/Microsoft/TypeScript) version 2.0.0 or greater
- [@types/ember](https://www.npmjs.com/package/@types/ember)
- [tsconfig](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

You can setup all of these at once with:

```
ember install ember-cli-typescript
```

All dependencies will be added to your package.json, and you're ready to roll!

## Configuration file notes

If you make changes to the paths included in your `tsconfig.json`, you will need to restart the server to take the changes into account.

### Problem ###

The configuration file is used by both Ember CLI/[broccoli](http://broccolijs.com/) and [VS Code](http://code.visualstudio.com/)/`tsc` command line compiler.

Broccoli controls the inputs and the output folder of the various build steps
that make the Ember build pipeline. Its expectation are impacted by Typescript
configuration properties like "include", "exclude", "outFile", "outDir".

We want to allow you to change unrelated properties in the tsconfig file.

### Solution ###

This addon takes the following approach to allow this dual use:

- is starts with the following [blueprint](https://github.com/emberwatch/ember-cli-typescript/blob/master/blueprints/ember-cli-typescript/files/tsconfig.json)

- the generated tsconfig file does not set "outDir" and sets "noEmit" to true.
  This allows you to run vscode and tsc without creating `.js` files throughout
  your codebase.

- before calling broccoli the addon removes "outDir" and sets "noEmit" and "includes"

### Customization ###

You can customize this file further for your use case. For example to see the
output of the compilation in a separate folder you are welcome to set and
outDir and set noEmit to false. Then VS Code and tsc will generate files here
while the broccoli pipeline will use its own temp folder.

Please see the wiki for additional how to tips from other users or to add 
your own tips. If an use case is frequent enough we can codify in the plugin.
https://github.com/emberwatch/ember-cli-typescript/wiki/tsconfig-how-to


## Incremental adoption

If you are porting an existing app to TypeScript, you can install this addon and
migrate your files incrementally by changing their extensions from `.js` to
`.ts`.  A good approach is to start at your leaf files and then work your way
up. As TypeScript starts to find errors, make sure to celebrate your (small)
wins with your team, specially if some people are not convinced yet. We would also
love to hear your stories.

## VSCode setup

Create the file `.vscode/settings.json` with the following content:

```json
// Place your settings in this file to overwrite default and user settings.
{
    "typescript.tsdk" : "node_modules/typescript/lib"
}
```
