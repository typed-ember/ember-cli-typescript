import Service from '@ember/service';

export default class <%= classifiedModuleName %> extends Service.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
}

declare module 'ember' {
  interface ServiceRegistry {
    '<%= dasherizedModuleName %>': <%= classifiedModuleName %>;
  }
}
