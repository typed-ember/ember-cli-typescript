import Component from '@glimmer/component';

function compute(): { value: string } {
  return { value: 'from component' };
}

export default class TsComponent extends Component {
  someValue = compute().value;
}
