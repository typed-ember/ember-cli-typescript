// BEGIN-SNIPPET args-getter.ts
import Component from '@glimmer/component';

export default class ArgsDisplay extends Component {
  get argNames(): string[] {
    return Object.keys(this.args);
  }
}
// END-SNIPPET
