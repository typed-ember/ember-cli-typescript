<%= importStatement %>

export default class <%= classifiedModuleName %> extends <%= baseClass %>.extend({
}) {}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data' {
  interface AdapterRegistry {
    '<%= dasherizedModuleName %>': <%= classifiedModuleName %>;
  }
}
