import Component from '@glimmer/component';

import * as constants from '../lib/some-const';

export default class JsImportingTs extends Component {
  get poke() {
    return constants.CHANGE === 'ha';
  }
}
