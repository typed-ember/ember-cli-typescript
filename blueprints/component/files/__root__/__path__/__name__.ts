import Component from '@ember/component';
<%= importTemplate %>
export default class <%= classifiedModuleName %> extends Component.extend({
  // anything which *must* be merged to prototype here
}) {<%= contents %>
  // normal class body definition here
};
