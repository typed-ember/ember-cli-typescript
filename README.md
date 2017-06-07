# ember-cli-typescript

Use TypeScript in your Ember 2.x apps!


## Installation

Just run:

```
ember install ember-cli-typescript
```

All dependencies will be added to your `package.json`, and you're ready to roll!

In addition to ember-cli-typescript, the following files are installed:

- [typescript](https://github.com/Microsoft/TypeScript) version 2.0.0 or greater
- [@types/ember](https://www.npmjs.com/package/@types/ember)
- [tsconfig](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)


## Write your add-ons in TypeScript

To support shipping add-ons with TypeScript, move `ember-cli-typescript` from
`devDependencies` to `dependencies` in your `package.json`.

This is a function of the way Ember CLI add-ons work, not specific to TypeScript
or this add-on. *Any* transpiler support (including this, CoffeeScript, or even
Babel) needs to be specified in the `dependencies`, not `devDependencies`, to
use it for developing the add-on itself: that's how its compiled output can be
used in consuming apps or add-ons.

### :warning: Warning: install size

This is a WIP :construction: part of the add-on, and it *will* make a dramatic
difference in the size of your add-on in terms of installation. (It won't affect
the size of the add-on after build, of course!)

We're working on making a solution that lets us ship generated typings and
compiled JavaScript instead of shipping the entire TypeScript compiler toolchain
for add-ons. If you're using ember-cli-typescript in an add-on, you might add a
note to your users about the install size until we get that sorted out!

## Configuration file notes

If you make changes to the paths included in your `tsconfig.json`, you will need
to restart the server to take the changes into account.

### Quirks with `tsconfig.json`

Additionally, depending on what you're doing, you may notice that your tweaks to
`tsconfig.json` don't get picked up by the compiler at all.

#### The Problem

The configuration file is used by both Ember CLI/[broccoli](http://broccolijs.com/)
and `tsc` command line compiler (used by e.g. [VS Code](http://code.visualstudio.com/),
JetBrains IDEs, etc.).

Broccoli controls the inputs and the output folder of the various build steps
that make the Ember build pipeline. Its expectation are impacted by Typescript
configuration properties like "include", "exclude", "outFile", "outDir".

We want to allow you to change unrelated properties in the tsconfig file.

#### The Solution

This addon takes the following approach to allow this dual use:

- it starts with the following [blueprint](https://github.com/emberwatch/ember-cli-typescript/blob/master/blueprints/ember-cli-typescript/files/tsconfig.json)

- the generated tsconfig file does not set "outDir" and sets "noEmit" to true.
  This allows you to run vscode and tsc without creating `.js` files throughout
  your codebase.

- before calling broccoli the addon removes "outDir" and sets "noEmit" and "includes"

### Customization

You can customize the `tsconfig.json` file further for your use case. For
example to see the output of the compilation in a separate folder you are
welcome to set and outDir and set noEmit to false. Then VS Code and tsc will
generate files here while the broccoli pipeline will use its own temp folder.

Please see [the wiki] for additional how to tips from other users or to add 
your own tips. If an use case is frequent enough we can codify in the plugin.

[the wiki]: https://github.com/emberwatch/ember-cli-typescript/wiki/tsconfig-how-to


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

## Not (yet) supported

While TS works nicely for many things in Ember, there are a number of corners
where it *won't* help you out. These are worth being aware of. Some of them are
just a matter of further work on updating the [typings]; others are a matter of
further support landing in TypeScript itself.

[typings]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ember

Here is the short list of things which do *not* work yet.

### Extending from framework entities using `class` syntax

```js
export default MyComponent extends Ember.Component {
}
``` 

### Type safety when invoking actions

```ts
actions: {
   turnWheel(degrees: number) {
      ...
   }
}
``` 

```hbs
<!-- TypeScript compiler won't detect this type mismatch -->
<button onclick={{action 'turnWheel' 'NOT-A-NUMBER'}}> Click Me </button>
```

```js
// TypeScript compiler won't detect this type mismatch
this.send('turnWheel', 'ALSO-NOT-A-NUMBER');
```

### Type safety when invoking KVO compliant accessors or mutators

```ts
Ember.Object.extend({
  urls: <string[]> null,
  port: 4200,
  init() {
     this._super(...arguments);
     this.set('urls', []);
  },
  foo() {
    // TypeScript won't detect these type mismatches
    this.get('urls').addObject(51);
    this.set('port', 3000);
  }
});
``` 

