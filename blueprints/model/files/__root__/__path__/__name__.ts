import DS from 'ember-data';

export default class <%= classifiedModuleName %> extends DS.Model.extend({
<%= attrs.length ? '  ' + attrs : '' %>
}) {}

declare module 'ember-data' {
  interface ModelRegistry {
    '<%= dasherizedModuleName %>': <%= classifiedModuleName %>;
  }
}
