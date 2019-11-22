# Testing

Testing with TypeScript mostly works just the same as you'd expect in a non-TypeScript Ember application—so if you're just starting out with Ember, we recommend you read the official Ember [Testing Guides] first. The rest of this guide assumes you're already comfortable with testing in Ember!

[Testing Guides]: https://guides.emberjs.com/release/testing/

When working with TypeScript in Ember tests, there are a few differences in your experience, and there are

##  Differences

### App tests

One major difference when working with TypeScript in *app* code is that once your app is fully converted, there are a bunch of kinds of tests you just don't need to write any more: things like testing bad inputs to functions. In JavaScript, you mind find yourself writing a unit test like this (admittedly contrived and silly example):

```js
// the function we'll test
function add(a, b) {
  assert(
    'arguments must be numbers',
    typeof a === number && typeof b === number
  );

  return a + b;
}

// in a test file somewhere
module('add function', function(hooks) {
  test('throws an error with strings', function(assert) {
    assert.throws(
      'when the first is a string and the second is a number',
      () => add('hello', 1)
    );
    assert.throws(
      'when the first is a number and the second is a string',
      () => add(0, 'hello')
    );
    assert.throws(
      'when both are strings',
      () => add('hello', 'goodbye')
    );
  })
});
```

In TypeScript, that wouldn't make any sense at all, because we'd simply add the types to the function declaration:

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

We might still write tests to make sure what we actually got back was what we expected—`add(2, 2)` should give us `4`, not `NaN` or `Infinity` or `-119928`!—but there are a bunch of things we *don't* need to test.

### Addon tests

Note, however, that this *only* applies to *app code*. If you're writing an Ember addon (or any other library), you cannot assume that everyone consuming your code is using TypeScript. You still need to account for these kinds of cases. This will require you to do something that probably feels a bit gross: casting a bunch of values `as any` for your tests, so that you can test what happens when people feed bad data to your addon!

## Gotchas

On