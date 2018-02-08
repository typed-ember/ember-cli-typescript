import Component from '@ember/component';
import { equal } from '@ember/object/computed';

import * as constants from '../lib/some-const';

export default Component.extend({
  poke: equal('ha', constants.CHANGE),
});
