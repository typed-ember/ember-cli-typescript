import Controller from '@ember/controller';

export default class <%= classifiedModuleName %> extends Controller.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
}

declare module 'ember' {
  interface ControllerRegistry {
    '<%= dasherizedModuleName %>': <%= classifiedModuleName %>;
  }
}
