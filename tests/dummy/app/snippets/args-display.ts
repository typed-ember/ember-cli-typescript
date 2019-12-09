// BEGIN-SNIPPET args-display.ts
import Component from '@glimmer/component';

const log = console.log.bind(console);

export default class ArgsDisplay extends Component {
  constructor(owner: unknown, args: {}) {
    super(owner, args);

    Object.keys(args).forEach(log);
  }
}
// END-SNIPPET
