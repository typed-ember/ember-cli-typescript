<%= importStatement %>

export default class <%= classifiedModuleName %> extends <%= baseClass %>.extend({
}) {}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data' {
  interface SerializerRegistry {
    '<%= dasherizedModuleName %>': <%= classifiedModuleName %>;
  }
}
