<%= importStatement %>

export default class <%= classifiedModuleName %> extends <%= baseClass %>.extend({
}) {}

declare module 'ember-data' {
  interface AdapterRegistry {
    '<%= dasherizedModuleName %>': <%= classifiedModuleName %>;
  }
}
