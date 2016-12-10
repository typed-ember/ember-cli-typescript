# ember-cli-typescript

Enable typescript preprocessing on Ember 2.x apps.


## Installation

In addition to ember-cli-typescript, [typescript](https://github.com/Microsoft/TypeScript) and [@type/ember](https://www.npmjs.com/package/@types/ember) are required.  You can install all of these at once with:

```
ember install "ember-cli-typescript@emberwatch/ember-cli-typescript"
```

All 3 dependencies will be added to your package.json, and you're ready to roll!


## Incremental adoption

Rename the files you want to check from `.js` to `.ts`.

## VSCode setup

Create the file `.vscode/settings.json` with the following content:

```json
// Place your settings in this file to overwrite default and user settings.
{
    "typescript.tsdk" : "node_modules/typescript/lib"
}
```
