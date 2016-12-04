# ember-cli-typescript

Enable typescript preprocessing on Ember 2.x apps.


## One time setup

To use install dependencies

    npm install --save-dev typescript@2.1 # Older versions are not supported
    npm install --save-dev ember-cli-typescript
    npm install --save-dev @types/ember

Create a tsconfig.json file:

    ember generate ember-cli-typescript

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
