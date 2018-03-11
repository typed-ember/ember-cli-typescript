
declare namespace EmberCliTestInfo {

  /**
   Converts a string into friendly human form.

   ```javascript
   humanize("SomeCoolString") // 'some cool string'
   ```

   @method humanize
   @param {String} str The string to humanize.
   @return {String} the humanize string.
   */
  function humanize(str: string): string;


  /**
   Return a friendly test name with type prefix
   Unit | Components | x-foo

   ```javascript
   name("x-foo", "Unit", "Component") // Unit | Component | x foo
   ```

   @method name
   @param {String} name The name of the generated item.
   @param {String} testType The type of test (Unit, Acceptance, etc).
   @param {String} blueprintType The type of bluprint (Component, Mixin, etc).
   @return {String} A normalized name with type and blueprint prefix.
   */

  function name(name: string, testType: string, blueprintType: string | undefined | null): string;

  /**
   Return a friendly test description

   ```javascript
   description("x-foo", "Unit", "Component") // Unit | Component | x foo
   ```

   @method description
   @param {String} description The description of the generated item.
   @param {String} testType The type of test (Unit, Acceptance, etc).
   @param {String} blueprintType The type of bluprint (Component, Mixin, etc).
   @return {String} A normalized description with type and blueprint prefix.
   */
  function description(description: string, testType: string, blueprintType: string | undefined | null): string;
}

export = EmberCliTestInfo;
