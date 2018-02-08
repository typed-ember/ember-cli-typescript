import DS from 'ember-data';

export default class <%= classifiedModuleName %> extends DS.Model.extend({
<%= attrs.length ? '  ' + attrs : '' %>
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    '<%= dasherizedModuleName %>': <%= classifiedModuleName %>;
  }
}
