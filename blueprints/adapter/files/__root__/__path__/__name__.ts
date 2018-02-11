<%= importStatement %>

export default class <%= classifiedModuleName %> extends <%= baseClass %>.extend({
  // anything which *must* be merged on the prototype
}) {
  // normal class body
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data' {
  interface AdapterRegistry {
    '<%= dasherizedModuleName %>': <%= classifiedModuleName %>;
  }
}
