import Ember from 'ember';

import * as constants from '../lib/some-const';

export default Ember.Component.extend({
  poke: Ember.computed.equal('ha', constants.CHANGE)
});
