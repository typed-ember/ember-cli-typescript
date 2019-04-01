declare namespace Chai {
  interface ChaiStatic {
    file(name: string): {
      content: string;
    };
  }
}

declare module 'ember-cli-blueprint-test-helpers/chai' {
  import 'chai-as-prsomised';
  import * as chai from 'chai';
  export = chai;
}
declare module 'ember-cli-blueprint-test-helpers/helpers';
declare module 'ember-cli-blueprint-test-helpers/lib/helpers/ember';
